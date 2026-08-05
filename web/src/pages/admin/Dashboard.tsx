import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// Live counts straight from Postgres. Retention / DAU / MAU / session duration
// come from PostHog once its key is wired (SOW analytics) — those land as a
// fast-follow; this proves the admin data path end-to-end today.
async function fetchCounts() {
  const tables = ['profiles', 'posts', 'groups', 'conversations'] as const;
  const results = await Promise.all(
    tables.map((t) =>
      supabase.from(t).select('id', { count: 'exact', head: true }),
    ),
  );
  const out: Record<string, number> = {};
  tables.forEach((t, i) => (out[t] = results[i].count ?? 0));
  return out;
}

function Card({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
      <div className="text-2xl font-bold text-brand-500">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { data } = useQuery({ queryKey: ['admin-counts'], queryFn: fetchCounts });
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-700">Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">
        Platform overview. Retention & active-user metrics arrive with the
        PostHog integration.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card label="Members" value={data?.profiles ?? '—'} />
        <Card label="Posts" value={data?.posts ?? '—'} />
        <Card label="Groups" value={data?.groups ?? '—'} />
        <Card label="Conversations" value={data?.conversations ?? '—'} />
        <Card label="DAU" value="—" />
        <Card label="MAU" value="—" />
        <Card label="D7 retention" value="—" />
        <Card label="Avg session" value="—" />
      </div>
    </div>
  );
}
