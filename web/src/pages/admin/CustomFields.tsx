import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

// CRUD for admin-defined custom profile fields. Owner-gated at the DB
// (cpf_owner_write). org_id defaults server-side, so inserts don't carry it.
type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'date';
const FIELD_TYPES: FieldType[] = [
  'text',
  'textarea',
  'number',
  'select',
  'boolean',
  'date',
];

type CustomField = {
  id: string;
  field_key: string;
  label: string;
  field_type: FieldType;
  options: string[] | null;
  position: number;
  enabled: boolean;
};

type FieldForm = {
  id: string | null;
  field_key: string;
  label: string;
  field_type: FieldType;
  options: string;
  position: number;
  enabled: boolean;
};

const EMPTY: FieldForm = {
  id: null,
  field_key: '',
  label: '',
  field_type: 'text',
  options: '',
  position: 0,
  enabled: true,
};

async function fetchFields(): Promise<CustomField[]> {
  const { data, error } = await supabase
    .from('custom_profile_fields')
    .select('id, field_key, label, field_type, options, position, enabled')
    .order('position');
  if (error) throw error;
  return (data ?? []) as CustomField[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function AdminCustomFields() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<FieldForm>(EMPTY);
  const { data, isLoading } = useQuery({ queryKey: ['custom-fields'], queryFn: fetchFields });

  const upsert = useMutation({
    mutationFn: async (f: FieldForm) => {
      const options =
        f.field_type === 'select'
          ? f.options
              .split(',')
              .map((o) => o.trim())
              .filter(Boolean)
          : [];
      const payload = {
        field_key: f.field_key.trim() || slugify(f.label),
        label: f.label.trim(),
        field_type: f.field_type,
        options,
        position: f.position,
        enabled: f.enabled,
        updated_at: new Date().toISOString(),
      };
      if (f.id) {
        const { error } = await supabase
          .from('custom_profile_fields')
          .update(payload)
          .eq('id', f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('custom_profile_fields').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setForm(EMPTY);
      qc.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('custom_profile_fields').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-fields'] }),
  });

  if (!isAdmin)
    return (
      <p className="text-gray-500">Owner access is required to manage profile fields.</p>
    );

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-700">Custom Profile Fields</h1>
      <p className="mb-6 text-sm text-gray-500">
        Define extra fields members can fill in on their profile.
      </p>

      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <div className="mb-3 text-sm font-semibold text-brand-700">
          {form.id ? 'Edit field' : 'New field'}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Label</span>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Favorite quote"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">
              Key <span className="text-gray-400">(auto from label if blank)</span>
            </span>
            <input
              value={form.field_key}
              onChange={(e) => setForm({ ...form, field_key: e.target.value })}
              placeholder="favorite_quote"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Type</span>
            <select
              value={form.field_type}
              onChange={(e) =>
                setForm({ ...form, field_type: e.target.value as FieldType })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Position</span>
            <input
              type="number"
              value={form.position}
              onChange={(e) =>
                setForm({ ...form, position: Number(e.target.value) || 0 })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
            />
          </label>
        </div>
        {form.field_type === 'select' && (
          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-gray-500">Options (comma separated)</span>
            <input
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
              placeholder="Option A, Option B, Option C"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
            />
          </label>
        )}
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          <span className="text-gray-600">Enabled (visible to members)</span>
        </label>
        {upsert.isError && (
          <p className="mt-2 text-sm text-red-600">Couldn’t save — a key may already exist.</p>
        )}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => upsert.mutate(form)}
            disabled={!form.label.trim() || upsert.isPending}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {form.id ? 'Save changes' : 'Add field'}
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
        {(data ?? []).map((f) => (
          <li key={f.id} className="flex items-start justify-between gap-4 py-3">
            <div>
              <div className="font-medium">
                {f.label}{' '}
                {!f.enabled && (
                  <span className="text-xs font-normal text-gray-400">(disabled)</span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {f.field_key} · {f.field_type}
                {f.field_type === 'select' &&
                  f.options &&
                  f.options.length > 0 &&
                  ` · ${f.options.join(', ')}`}
              </div>
            </div>
            <div className="flex shrink-0 gap-3 text-sm">
              <button
                onClick={() =>
                  setForm({
                    id: f.id,
                    field_key: f.field_key,
                    label: f.label,
                    field_type: f.field_type,
                    options: (f.options ?? []).join(', '),
                    position: f.position,
                    enabled: f.enabled,
                  })
                }
                className="text-brand-700 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm(`Delete “${f.label}”? Member values are removed too.`))
                    remove.mutate(f.id);
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
