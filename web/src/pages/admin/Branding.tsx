import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, currentOrgId } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

// Branding editor: app name, colors, logo. Writes branding_settings (owner-only
// at the DB). Public read means these can theme the login screen and mobile.
type Branding = {
  app_name: string | null;
  tagline: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  support_email: string | null;
};

type BrandingForm = {
  app_name: string;
  tagline: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  support_email: string;
};

const EMPTY: BrandingForm = {
  app_name: '',
  tagline: '',
  primary_color: '#a5257e',
  secondary_color: '#d84a9a',
  logo_url: '',
  support_email: '',
};

async function fetchBranding(): Promise<Branding | null> {
  const { data } = await supabase
    .from('branding_settings')
    .select('app_name, tagline, primary_color, secondary_color, logo_url, support_email')
    .maybeSingle();
  return (data as Branding) ?? null;
}

export function AdminBranding() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState<BrandingForm>(EMPTY);
  const { data, isLoading } = useQuery({ queryKey: ['branding'], queryFn: fetchBranding });

  useEffect(() => {
    if (data)
      setForm({
        app_name: data.app_name ?? '',
        tagline: data.tagline ?? '',
        primary_color: data.primary_color ?? '#a5257e',
        secondary_color: data.secondary_color ?? '#d84a9a',
        logo_url: data.logo_url ?? '',
        support_email: data.support_email ?? '',
      });
  }, [data]);

  const save = useMutation({
    mutationFn: async (f: BrandingForm) => {
      const orgId = await currentOrgId();
      if (!orgId) throw new Error('No org');
      const { error } = await supabase.from('branding_settings').upsert(
        {
          org_id: orgId,
          app_name: f.app_name.trim() || null,
          tagline: f.tagline.trim() || null,
          primary_color: f.primary_color.trim() || null,
          secondary_color: f.secondary_color.trim() || null,
          logo_url: f.logo_url.trim() || null,
          support_email: f.support_email.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'org_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['branding'] }),
  });

  if (!isAdmin)
    return <p className="text-gray-500">Owner access is required to edit branding.</p>;
  if (isLoading) return <p className="text-brand-700">Loading…</p>;

  const field = (
    label: string,
    key: keyof BrandingForm,
    type: 'text' | 'color' = 'text',
  ) => (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-500">{label}</span>
      {type === 'color' ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="h-9 w-12 rounded border border-gray-300"
          />
          <input
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
          />
        </div>
      ) : (
        <input
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
        />
      )}
    </label>
  );

  return (
    <div className="max-w-lg">
      <h1 className="mb-1 text-xl font-bold text-brand-700">Branding</h1>
      <p className="mb-6 text-sm text-gray-500">
        Name, colors, and logo. Applies across web and mobile.
      </p>
      <div className="space-y-4">
        {field('App name', 'app_name')}
        {field('Tagline', 'tagline')}
        {field('Primary color', 'primary_color', 'color')}
        {field('Secondary color', 'secondary_color', 'color')}
        {field('Logo URL', 'logo_url')}
        {field('Support email', 'support_email')}
      </div>
      {save.isError && (
        <p className="mt-3 text-sm text-red-600">Couldn’t save — try again.</p>
      )}
      {save.isSuccess && !save.isPending && (
        <p className="mt-3 text-sm text-green-600">Saved.</p>
      )}
      <button
        onClick={() => save.mutate(form)}
        disabled={save.isPending}
        className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
      >
        {save.isPending ? 'Saving…' : 'Save branding'}
      </button>
    </div>
  );
}
