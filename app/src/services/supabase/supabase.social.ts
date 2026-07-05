// Social layer on Supabase (Phase B): feed posts, comments, likes, groups.
// Returns LEGACY Sendbird-channel/message shapes so the existing screens
// render unchanged — same trick as the mock layer, but backed by Postgres.

import { supabase, currentUserId } from './client';
import { publicUrlFor } from './supabase.storage';

// Local cached session read — no network round-trip per request.
const uid = currentUserId;

const senderFromProfile = (p: any) => {
  const avatar = publicUrlFor('avatars', p?.avatar_path) ?? '';
  return {
    userId: p?.id ?? 'unknown',
    nickname: p?.display_name || p?.first_name || 'Member',
    plainProfileUrl: avatar,
    profileUrl: avatar,
    isActive: true,
    metaData: { id: p?.id ?? 'unknown' },
  };
};

// ---------------------------------------------------------------------------
// FEED
// ---------------------------------------------------------------------------

/**
 * Posts shaped like the legacy Sendbird "post channels".
 * `before` is a created_at cursor (ISO string) for keyset pagination — pass
 * the oldest loaded post's created_at to fetch the next page (infinite
 * scroll plumbing; no UI wired yet).
 */
export async function getFeedPosts(limit = 50, before?: string) {
  let query = supabase
    .from('posts')
    .select(
      '*, author:profiles!posts_author_id_fkey(id, first_name, display_name, avatar_path), group:groups(name), comments(count)',
    );
  if (before) query = query.lt('created_at', before);
  const { data: posts, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map(p => p.id);
  const { data: likeRows } = await supabase
    .from('reactions')
    .select('entity_id, user_id')
    .eq('entity_type', 'post')
    .in('entity_id', postIds);

  const likesByPost: Record<string, string[]> = {};
  (likeRows ?? []).forEach(r => {
    (likesByPost[r.entity_id] ??= []).push(r.user_id);
  });

  return posts.map(p => ({
    url: p.id,
    name: `post-${p.id}`,
    createdAt: new Date(p.created_at).getTime(),
    creator: senderFromProfile(p.author),
    customType: 'post',
    cachedMetaData: { type: 'post' },
    memberCount: 1,
    lastMessage: {
      message: p.body,
      createdAt: new Date(p.created_at).getTime(),
      sender: senderFromProfile(p.author),
    },
    data: JSON.stringify({
      firstMessage: p.body,
      commentQty: p.comments?.[0]?.count ?? 0,
      likes: likesByPost[p.id] ?? [],
      image_sm: publicUrlFor('post-images', p.image_path) ?? '',
      visibility: p.visibility,
      groupId: p.group_id,
      groupName: p.group?.name ?? null,
      audienceTags: p.audience_tags ?? [],
    }),
  }));
}

export async function createPost(
  body: string,
  options?: {
    groupId?: string | null;
    imagePath?: string | null;
    /** legacy "My Groups" audience: role/diagnosis tag names, lowercased */
    audienceTags?: string[];
  },
) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');
  const isGroupAudience =
    !!options?.groupId || (options?.audienceTags?.length ?? 0) > 0;
  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: me,
      body,
      visibility: isGroupAudience ? 'group' : 'all',
      group_id: options?.groupId ?? null,
      image_path: options?.imagePath ?? null,
      audience_tags: (options?.audienceTags ?? []).map(t => t.toLowerCase()),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Comments shaped like legacy Sendbird messages (incl. 'smile' reactions).
 * IMPORTANT: legacy semantics — the POST ITSELF is the first "message"
 * (Sendbird stored posts as channels whose first message was the body), so
 * we prepend a post-shaped message; its reactions are the post's likes.
 */
export async function getPostComments(postId: string) {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select(
      '*, author:profiles!posts_author_id_fkey(id, first_name, display_name, avatar_path)',
    )
    .eq('id', postId)
    .single();
  if (postError) throw postError;

  const { data: postLikes } = await supabase
    .from('reactions')
    .select('user_id')
    .eq('entity_type', 'post')
    .eq('entity_id', postId);
  const likerIds = (postLikes ?? []).map(r => r.user_id);

  const postAsMessage = {
    messageId: `post-${post.id}`,
    message: post.body,
    createdAt: new Date(post.created_at).getTime(),
    messageType: 'user',
    sender: senderFromProfile(post.author),
    reactions:
      likerIds.length > 0
        ? [{ key: 'smile', sampledUserIds: likerIds, userIds: likerIds }]
        : [],
  };

  const { data: comments, error } = await supabase
    .from('comments')
    .select(
      '*, author:profiles!comments_author_id_fkey(id, first_name, display_name, avatar_path)',
    )
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (error) throw error;
  if (!comments || comments.length === 0) return [postAsMessage];

  const ids = comments.map(c => c.id);
  const { data: reactionRows } = await supabase
    .from('reactions')
    .select('entity_id, user_id')
    .eq('entity_type', 'comment')
    .in('entity_id', ids);

  const byComment: Record<string, string[]> = {};
  (reactionRows ?? []).forEach(r => {
    (byComment[r.entity_id] ??= []).push(r.user_id);
  });

  return [
    postAsMessage,
    ...comments.map(c => ({
      messageId: c.id,
      message: c.body,
      createdAt: new Date(c.created_at).getTime(),
      messageType: 'user',
      sender: senderFromProfile(c.author),
      reactions:
        (byComment[c.id] ?? []).length > 0
          ? [
              {
                key: 'smile',
                sampledUserIds: byComment[c.id],
                userIds: byComment[c.id],
              },
            ]
          : [],
    })),
  ];
}

export async function sendComment(postId: string, body: string) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: me, body })
    .select(
      '*, author:profiles!comments_author_id_fkey(id, first_name, display_name, avatar_path)',
    )
    .single();
  if (error) throw error;
  return {
    messageId: data.id,
    message: data.body,
    createdAt: new Date(data.created_at).getTime(),
    messageType: 'user',
    sender: senderFromProfile(data.author),
    reactions: [],
  };
}

/** Toggle like; returns the post's updated liker id list. */
export async function toggleReactionOn(
  entityType: 'post' | 'comment',
  entityId: string,
) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');

  const { data: existing, error: findError } = await supabase
    .from('reactions')
    .select('id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_id', me)
    .maybeSingle();
  if (findError) throw findError;

  if (existing) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({ entity_type: entityType, entity_id: entityId, user_id: me });
    // 23505 = already liked (double-tap race) — treat as success.
    if (error && error.code !== '23505') throw error;
  }

  const { data: rows } = await supabase
    .from('reactions')
    .select('user_id')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  return (rows ?? []).map(r => r.user_id);
}

// ---------------------------------------------------------------------------
// GROUPS
// ---------------------------------------------------------------------------

const groupToChannel = (g: any, members: any[] = [], joined = false) => ({
  url: g.id,
  name: g.name,
  coverUrl: '',
  memberCount: g.member_count ?? members.length,
  joinedMemberCount: g.member_count ?? members.length,
  createdAt: new Date(g.created_at).getTime(),
  customType: 'group',
  cachedMetaData: { type: 'group', recommendation: 'true' },
  members: members.map(senderFromProfile),
  creator: null,
  lastMessage: {
    message: g.description ?? 'Welcome to the group!',
    createdAt: new Date(g.created_at).getTime(),
    sender: { userId: 'system', nickname: g.name, metaData: { id: 'system' } },
  },
  unreadMessageCount: 0,
  data: JSON.stringify({ recommendation: true, joined }),
});

export async function getAllGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*, group_members(count)')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(g =>
    groupToChannel({ ...g, member_count: g.group_members?.[0]?.count ?? 0 }),
  );
}

/** Groups matched to the user's role/diagnosis via taxonomy tags. */
export async function getRecommendedGroups(terms: string[]) {
  const all = await getAllGroups();
  const wanted = terms.filter(Boolean).map(t => t.toLowerCase());
  if (wanted.length === 0) return all.slice(0, 4);
  const matches = all.filter((g: any) => {
    const name = g.name.toLowerCase();
    return wanted.some(t => name.includes(t.split(' ')[0]));
  });
  return matches.length > 0 ? matches : all.slice(0, 4);
}

export async function getMyGroupChannels() {
  const me = await uid();
  if (!me) return [];
  const { data: memberships, error } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('profile_id', me);
  if (error) throw error;
  const ids = (memberships ?? []).map(m => m.group_id);
  if (ids.length === 0) return [];

  const { data: groups } = await supabase
    .from('groups')
    .select('*')
    .in('id', ids);

  const { data: memberRows } = await supabase
    .from('group_members')
    .select('group_id, profile:profiles(id, first_name, display_name, avatar_path)')
    .in('group_id', ids);

  const membersByGroup: Record<string, any[]> = {};
  (memberRows ?? []).forEach(r => {
    (membersByGroup[r.group_id] ??= []).push(r.profile);
  });

  return (groups ?? []).map(g =>
    groupToChannel(
      { ...g, member_count: (membersByGroup[g.id] ?? []).length },
      membersByGroup[g.id] ?? [],
      true,
    ),
  );
}

export async function joinGroup(groupId: string) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, profile_id: me });
  if (error && error.code !== '23505') throw error; // ignore already-joined
  return true;
}

export async function leaveGroup(groupId: string) {
  const me = await uid();
  if (!me) throw new Error('Not authenticated');
  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('profile_id', me);
  return true;
}
