import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, currentUserId } from '../lib/supabase';
import { useFeatureFlags } from '../lib/featureFlags';

// In-app notifications for the signed-in member. Reads the notifications table
// (RLS: recipient-only). Push delivery is a separate edge function (pending
// Firebase); this is the in-app inbox.
type Note = {
  id: string;
  entity_type: string;
  content: string | null;
  read_at: string | null;
  created_at: string;
};

async function fetchNotes(): Promise<Note[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('id, entity_type, content, read_at, created_at')
    .eq('recipient_id', me)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

const LABEL: Record<string, string> = {
  NEW_LIKE: 'liked your post',
  NEW_MESSAGE: 'sent you a message',
  NEW_FRIEND_REQUEST: 'sent you a friend request',
  WELCOME: 'Welcome to Laurie’s Love',
};

export function Notifications() {
  const { isEnabled } = useFeatureFlags();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: fetchNotes });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (!isEnabled('notifications'))
    return <p className="text-gray-500">Notifications are turned off.</p>;
  if (isLoading) return <p className="text-brand-700">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-xl font-bold text-brand-700">Notifications</h1>
      {data && data.length === 0 && (
        <p className="text-gray-500">You’re all caught up.</p>
      )}
      <div className="space-y-2">
        {(data ?? []).map((n) => (
          <button
            key={n.id}
            onClick={() => !n.read_at && markRead.mutate(n.id)}
            className={`block w-full rounded-xl border p-3 text-left text-sm ${
              n.read_at ? 'border-gray-100 bg-white' : 'border-brand-200 bg-brand-50'
            }`}
          >
            <div className="font-medium text-brand-700">
              {LABEL[n.entity_type] ?? n.entity_type}
            </div>
            {n.content && <div className="text-gray-600">{n.content}</div>}
            <div className="mt-1 text-xs text-gray-400">
              {new Date(n.created_at).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
