import { useEffect, useState } from 'react';
import { supabase } from './supabase';

// Reads the platform_features toggle table (ships in the pending admin
// migration). Every surface gates modules on these. Until the table is
// applied, this defaults to "everything on" so nothing breaks.
export type FeatureKey =
  | 'community_wall'
  | 'groups'
  | 'messaging'
  | 'community_map'
  | 'donations'
  | 'sponsorships'
  | 'notifications'
  | 'ai_moderation'
  | 'support_center'
  | 'friends'
  | 'media_library';

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from('platform_features')
      .select('feature_key, enabled')
      .then(({ data, error }) => {
        if (!error && data) {
          const map: Record<string, boolean> = {};
          data.forEach((r: { feature_key: string; enabled: boolean }) => {
            map[r.feature_key] = r.enabled;
          });
          setFlags(map);
        }
        setLoaded(true);
      });
  }, []);

  // Default ON when a flag is absent (table not applied yet, or key missing).
  const isEnabled = (key: FeatureKey) => flags[key] ?? true;
  return { isEnabled, loaded };
}
