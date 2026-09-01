import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, currentUserId } from '../lib/supabase';

// Member-facing support: open a ticket and see the status of your own tickets.
// Staff pick these up in the admin Support Inbox. RLS: a member can insert only
// their own ticket (user_id = auth.uid()) and read only their own.
type Ticket = {
  id: string;
  category: string | null;
  subject: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
};

const CATEGORIES = ['General question', 'Technical issue', 'Account', 'Report a concern', 'Other'];
const STATUS_LABEL: Record<Ticket['status'], string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};

async function fetchMyTickets(): Promise<Ticket[]> {
  const me = await currentUserId();
  if (!me) return [];
  const { data, error } = await supabase
    .from('support_tickets')
    .select('id, category, subject, description, status, created_at')
    .eq('user_id', me)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Ticket[];
}

export function Support() {
  const qc = useQueryClient();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: fetchMyTickets,
  });

  const submit = useMutation({
    mutationFn: async () => {
      const me = await currentUserId();
      if (!me) throw new Error('Not signed in');
      const { error } = await supabase.from('support_tickets').insert({
        user_id: me,
        category,
        subject: subject.trim(),
        description: description.trim(),
        status: 'open',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setSubject('');
      setDescription('');
      qc.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !submit.isPending;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-bold text-brand-700">Support</h1>
        <p className="text-sm text-gray-500">
          Need a hand? Send us a note and our team will follow up.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-gray-500">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-gray-500">Subject</span>
          <input
            value={subject}
            maxLength={200}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short summary"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-gray-500">How can we help?</span>
          <textarea
            value={description}
            maxLength={4000}
            rows={4}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell us what's going on…"
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </label>
        {submit.isError && (
          <p className="mb-3 text-sm text-red-600">Couldn’t send — please try again.</p>
        )}
        <button
          onClick={() => submit.mutate()}
          disabled={!canSubmit}
          className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
        >
          {submit.isPending ? 'Sending…' : 'Send to support'}
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Your tickets
        </h2>
        {isLoading && <p className="text-brand-700">Loading…</p>}
        {!isLoading && (tickets ?? []).length === 0 && (
          <p className="text-sm text-gray-500">No tickets yet.</p>
        )}
        <div className="space-y-2">
          {(tickets ?? []).map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-100 bg-white p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{t.subject}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    t.status === 'closed'
                      ? 'bg-gray-100 text-gray-500'
                      : t.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {STATUS_LABEL[t.status]}
                </span>
              </div>
              {t.category && <div className="text-xs text-gray-400">{t.category}</div>}
              {t.description && <p className="mt-1 text-gray-600">{t.description}</p>}
              <div className="mt-1 text-xs text-gray-400">
                {new Date(t.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
