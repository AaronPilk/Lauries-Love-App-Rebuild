import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, currentUserId } from '../lib/supabase';
import { useFeatureFlags } from '../lib/featureFlags';

type Conversation = {
  id: string;
  is_group: boolean;
  name: string | null;
  last_message_body: string | null;
  last_message_at: string | null;
  members: { profile: { id: string; display_name: string | null; first_name: string | null } }[];
};
type Message = {
  id: string;
  body: string | null;
  sender_id: string;
  created_at: string;
};

async function fetchConversations(): Promise<Conversation[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data: memberships } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('profile_id', me);
  const ids = (memberships ?? []).map((m) => m.conversation_id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from('conversations')
    .select(
      'id, is_group, name, last_message_body, last_message_at, members:conversation_members(profile:profiles(id, display_name, first_name))',
    )
    .in('id', ids)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  return (data ?? []) as unknown as Conversation[];
}

function convTitle(c: Conversation, meId: string | null) {
  if (c.name) return c.name;
  const others = c.members
    .map((m) => m.profile)
    .filter((p) => p.id !== meId)
    .map((p) => p.display_name || p.first_name || 'Member');
  return others.join(', ') || 'Conversation';
}

export function Messages() {
  const { isEnabled } = useFeatureFlags();
  const qc = useQueryClient();
  const [meId, setMeId] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Message[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentUserId().then(setMeId);
  }, []);

  const convos = useQuery({ queryKey: ['conversations'], queryFn: fetchConversations });

  // Load messages + subscribe to realtime for the open conversation.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    supabase
      .from('messages')
      .select('id, body, sender_id, created_at')
      .eq('conversation_id', active)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (!cancelled) setMsgs((data ?? []) as Message[]);
      });
    const channel = supabase
      .channel(`web-conv-${active}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${active}` },
        (payload) => setMsgs((prev) => [...prev, payload.new as Message]),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  async function send() {
    if (!text.trim() || !active) return;
    const me = await currentUserId();
    const body = text.trim();
    setText('');
    await supabase.from('messages').insert({ conversation_id: active, sender_id: me, body });
    qc.invalidateQueries({ queryKey: ['conversations'] });
  }

  if (!isEnabled('messaging'))
    return <p className="text-gray-500">Messaging is turned off.</p>;

  return (
    <div className="flex h-[70vh] gap-4">
      <aside className="w-64 shrink-0 overflow-y-auto rounded-2xl border border-brand-100 bg-white">
        <div className="border-b p-3 font-semibold text-brand-700">Messages</div>
        {(convos.data ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`block w-full border-b px-3 py-2 text-left text-sm ${
              active === c.id ? 'bg-brand-50' : ''
            }`}
          >
            <div className="font-medium">{convTitle(c, meId)}</div>
            <div className="truncate text-xs text-gray-400">
              {c.last_message_body ?? 'No messages yet'}
            </div>
          </button>
        ))}
      </aside>

      <section className="flex flex-1 flex-col rounded-2xl border border-brand-100 bg-white">
        {!active ? (
          <div className="grid flex-1 place-items-center text-gray-400">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    m.sender_id === meId
                      ? 'ml-auto bg-brand-700 text-white'
                      : 'bg-brand-50'
                  }`}
                >
                  {m.body}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="flex gap-2 border-t p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Message…"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                onClick={send}
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white"
              >
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
