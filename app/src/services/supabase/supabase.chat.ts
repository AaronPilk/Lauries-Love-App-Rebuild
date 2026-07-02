// Direct + group chat on Supabase (Phase B2) — replaces Sendbird chat.
// Legacy Sendbird channel/message shapes preserved so screens stay unchanged.
// Realtime: postgres_changes subscription on messages per conversation.

import { supabase } from './client';

const uid = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
};

const senderFromProfile = (p: any) => ({
  userId: p?.id ?? 'unknown',
  nickname: p?.display_name || p?.first_name || 'Member',
  plainProfileUrl: '',
  profileUrl: '',
  isActive: true,
  metaData: { id: p?.id ?? 'unknown' },
});

const msgShape = (m: any, senderProfile: any) => ({
  messageId: m.id,
  message: m.body ?? '',
  createdAt: new Date(m.created_at).getTime(),
  messageType: 'user',
  sender: senderFromProfile(senderProfile),
  reactions: [],
});

// conversation row (+members' profiles) -> legacy chat channel shape
const conversationToChannel = (
  conv: any,
  memberProfiles: any[],
  meId: string,
  lastMessage: any | null,
) => {
  const others = memberProfiles.filter(p => p?.id !== meId);
  const display =
    conv.name ||
    others.map(o => o?.display_name || o?.first_name).filter(Boolean).join(', ') ||
    'Conversation';
  return {
    url: conv.id,
    name: display,
    coverUrl: '',
    memberCount: memberProfiles.length,
    joinedMemberCount: memberProfiles.length,
    createdAt: new Date(conv.created_at).getTime(),
    customType: conv.is_group ? 'group' : 'chat',
    cachedMetaData: { type: conv.is_group ? 'group' : 'chat' },
    members: memberProfiles.map(senderFromProfile),
    creator: null,
    lastMessage: lastMessage,
    unreadMessageCount: 0,
    data: '',
  };
};

/** All my conversations, shaped as legacy chat channels, newest first. */
export async function getMyConversations(meIdHint?: string) {
  const me = meIdHint ?? (await uid());
  if (!me) return [];

  const { data: myMemberships, error } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('profile_id', me);
  if (error) throw error;
  const convIds = (myMemberships ?? []).map(m => m.conversation_id);
  if (convIds.length === 0) return [];

  const [{ data: convs }, { data: memberRows }] = await Promise.all([
    supabase
      .from('conversations')
      .select('*')
      .in('id', convIds)
      .order('last_message_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('conversation_members')
      .select(
        'conversation_id, profile:profiles(id, first_name, display_name, avatar_path)',
      )
      .in('conversation_id', convIds),
  ]);

  const membersByConv: Record<string, any[]> = {};
  (memberRows ?? []).forEach((r: any) => {
    (membersByConv[r.conversation_id] ??= []).push(r.profile);
  });

  // last message per conversation (one bounded query)
  const { data: lastMsgs } = await supabase
    .from('messages')
    .select(
      'id, conversation_id, body, created_at, sender:profiles(id, first_name, display_name)',
    )
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })
    .limit(200);
  const lastByConv: Record<string, any> = {};
  (lastMsgs ?? []).forEach((m: any) => {
    if (!lastByConv[m.conversation_id])
      lastByConv[m.conversation_id] = {
        message: m.body ?? '',
        createdAt: new Date(m.created_at).getTime(),
        sender: senderFromProfile(m.sender),
      };
  });

  return (convs ?? []).map(c =>
    conversationToChannel(c, membersByConv[c.id] ?? [], me, lastByConv[c.id] ?? null),
  );
}

/** Find (or create) the 1:1 conversation with another profile. */
export async function findOrCreateDirectConversation(otherProfileId: string) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');

  // Existing direct conversation containing BOTH of us?
  const { data: mine } = await supabase
    .from('conversation_members')
    .select('conversation_id, conversations!inner(is_group)')
    .eq('profile_id', me)
    .eq('conversations.is_group', false);
  const myConvIds = (mine ?? []).map((r: any) => r.conversation_id);

  if (myConvIds.length > 0) {
    const { data: shared } = await supabase
      .from('conversation_members')
      .select('conversation_id')
      .eq('profile_id', otherProfileId)
      .in('conversation_id', myConvIds)
      .limit(1);
    if (shared && shared.length > 0) return shared[0].conversation_id as string;
  }

  // Create conversation + both memberships (RLS: creator may add members).
  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({ is_group: false, created_by: me })
    .select()
    .single();
  if (error) throw error;

  const { error: memberError } = await supabase
    .from('conversation_members')
    .insert([
      { conversation_id: conv.id, profile_id: me },
      { conversation_id: conv.id, profile_id: otherProfileId },
    ]);
  if (memberError) throw memberError;

  return conv.id as string;
}

/**
 * Messages for a conversation — NEWEST FIRST (the chat screen renders an
 * inverted FlatList, matching the old Sendbird reverse:true query).
 */
export async function getConversationMessages(conversationId: string, limit = 100) {
  const { data, error } = await supabase
    .from('messages')
    .select(
      '*, sender:profiles!messages_sender_id_fkey(id, first_name, display_name, avatar_path)',
    )
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(m => msgShape(m, m.sender));
}

export async function sendChatMessage(conversationId: string, body: string) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: me, body })
    .select(
      '*, sender:profiles!messages_sender_id_fkey(id, first_name, display_name, avatar_path)',
    )
    .single();
  if (error) throw error;
  return msgShape(data, data.sender);
}

/**
 * Live delivery: subscribe to new messages in a conversation.
 * Returns an unsubscribe function. The callback receives a legacy-shaped
 * message (sender profile fetched lazily).
 */
export function subscribeToConversation(
  conversationId: string,
  onMessage: (msg: any) => void,
) {
  const channel = supabase
    .channel(`conv-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async payload => {
        const row: any = payload.new;
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, first_name, display_name, avatar_path')
          .eq('id', row.sender_id)
          .single();
        onMessage(msgShape(row, sender));
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
