import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, currentUserId } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

// Admin group management. Reads/writes the shared groups table. Writes are
// owner-gated at the DB (groups_owner_* policies) and in the UI.
type Group = {
  id: string;
  name: string;
  description: string | null;
  tags: string[] | null;
};

type GroupForm = {
  id: string | null;
  name: string;
  description: string;
  tags: string;
};

const EMPTY: GroupForm = { id: null, name: '', description: '', tags: '' };

async function fetchGroups(): Promise<Group[]> {
  const { data, error } = await supabase
    .from('groups')
    .select('id, name, description, tags')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

function parseTags(s: string): string[] {
  return s
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function AdminGroups() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<GroupForm>(EMPTY);
  const { data, isLoading } = useQuery({ queryKey: ['admin-groups'], queryFn: fetchGroups });

  const upsert = useMutation({
    mutationFn: async (f: GroupForm) => {
      const payload = {
        name: f.name.trim(),
        description: f.description.trim() || null,
        tags: parseTags(f.tags),
      };
      if (f.id) {
        const { error } = await supabase.from('groups').update(payload).eq('id', f.id);
        if (error) throw error;
      } else {
        const me = await currentUserId();
        const { error } = await supabase
          .from('groups')
          .insert({ ...payload, created_by: me });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('groups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-groups'] }),
  });

  if (!isAdmin)
    return (
      <p className="text-gray-500">Owner access is required to manage groups.</p>
    );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-700">Groups</h1>
      <p className="mb-6 text-sm text-gray-500">
        Create and manage community groups. Tags drive the recommendation
        matching on mobile.
      </p>

      {/* Editor */}
      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <div className="mb-3 text-sm font-semibold text-brand-700">
          {form.id ? 'Edit group' : 'New group'}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Group name"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="Tags (comma separated)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={2}
          className="mt-3 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
        />
        {upsert.isError && (
          <p className="mt-2 text-sm text-red-600">Couldn’t save — try again.</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => upsert.mutate(form)}
            disabled={!form.name.trim() || upsert.isPending}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {form.id ? 'Save changes' : 'Create group'}
          </button>
          {form.id && (
            <button
              onClick={() => setForm(EMPTY)}
              className="rounded-lg px-4 py-2 text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {isLoading && <p className="text-brand-700">Loading…</p>}
      <ul className="divide-y divide-brand-100">
        {(data ?? []).map((g) => (
          <li key={g.id} className="flex items-start justify-between gap-4 py-3">
            <div>
              <div className="font-medium">{g.name}</div>
              {g.description && (
                <div className="text-sm text-gray-500">{g.description}</div>
              )}
              {g.tags && g.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {g.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <button
                onClick={() =>
                  setForm({
                    id: g.id,
                    name: g.name,
                    description: g.description ?? '',
                    tags: (g.tags ?? []).join(', '),
                  })
                }
                className="text-brand-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete “${g.name}”?`)) remove.mutate(g.id);
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
