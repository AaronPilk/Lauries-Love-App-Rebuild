import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Support inbox — reads Jeremy's support_tickets (staff can see all). Staff can
// move a ticket's status. Columns per his schema: user_id, category, subject,
// description, status, conversation_id.
type Ticket = {
  id: string;
  user_id: string;
  category: string | null;
  subject: string;
  description: string | null;
  status: string;
  created_at: string;
};

async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, user_id, category, subject, description, status, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

const STATUSES = ['open', 'pending', 'closed'];

export function AdminSupportInbox() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  });

  const setStatus = useMutation({
    mutationFn: async (v: { id: string; status: string }) => {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: v.status, updated_at: new Date().toISOString() })
        .eq('id', v.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tickets'] }),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-700">Support Inbox</h1>
      <p className="mb-4 text-sm text-gray-500">
        Member support tickets. Reply in the linked conversation; set status here.
      </p>
      {error && (
        <p className="text-red-600">Couldn’t load tickets (staff access required).</p>
      )}
      {isLoading && <p className="text-brand-700">Loading…</p>}
      {data && data.length === 0 && (
        <p className="text-gray-500">No support tickets.</p>
      )}
      <div className="space-y-3">
        {(data ?? []).map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{t.subject}</div>
                {t.category && (
                  <div className="text-xs text-gray-400">{t.category}</div>
                )}
                {t.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                    {t.description}
                  </p>
                )}
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(t.created_at).toLocaleString()}
                </div>
              </div>
              <select
                value={t.status}
                onChange={(e) =>
                  setStatus.mutate({ id: t.id, status: e.target.value })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
