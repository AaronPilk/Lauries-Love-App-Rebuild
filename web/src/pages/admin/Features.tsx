import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

// The feature-toggle admin UI. Reads/writes platform_features (pending admin
// migration). Every surface (iOS/Android/Web) gates its modules on these rows,
// which is the foundation for licensing the platform to other orgs.
type Feature = { feature_key: string; enabled: boolean; label: string | null };

async function fetchFeatures(): Promise<Feature[]> {
  const { data, error } = await supabase
    .from('platform_features')
    .select('feature_key, enabled, label')
    .order('feature_key');
  if (error) throw error;
  return data ?? [];
}

export function AdminFeatures() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['features'],
    queryFn: fetchFeatures,
  });

  const toggle = useMutation({
    mutationFn: async (f: Feature) => {
      const { error } = await supabase
        .from('platform_features')
        .update({ enabled: !f.enabled, updated_at: new Date().toISOString() })
        .eq('feature_key', f.feature_key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['features'] }),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-brand-700">Feature Toggles</h1>
      <p className="mb-6 text-sm text-gray-500">
        Turn platform modules on or off. Changes apply across mobile and web.
      </p>

      {error && (
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          The <code>platform_features</code> table isn’t applied to this project
          yet. Apply <code>supabase/pending-migrations/PENDING_admin_foundation_v1.sql</code>{' '}
          (once the Supabase connector is on the Laurie’s Love project) and this
          list populates.
        </div>
      )}

      {isLoading && <p className="text-brand-700">Loading…</p>}

      <ul className="divide-y divide-brand-100">
        {(data ?? []).map((f) => (
          <li
            key={f.feature_key}
            className="flex items-center justify-between py-3"
          >
            <div>
              <div className="font-medium">{f.label ?? f.feature_key}</div>
              <div className="text-xs text-gray-400">{f.feature_key}</div>
            </div>
            <button
              onClick={() => toggle.mutate(f)}
              disabled={toggle.isPending}
              className={`relative h-6 w-11 rounded-full transition ${
                f.enabled ? 'bg-brand-500' : 'bg-gray-300'
              }`}
              aria-pressed={f.enabled}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  f.enabled ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
