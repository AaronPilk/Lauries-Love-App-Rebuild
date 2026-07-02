// Supabase client — Backend V2 (replaces Cognito + NestJS API + Sendbird).
// NOTE: not imported anywhere until @supabase/supabase-js is installed and
// EXPO_PUBLIC_BACKEND=supabase; Metro resolves imports at bundle time.

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

if (!url || !key) {
  // Fail loudly in dev: a silent empty client produces confusing auth errors.
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_KEY missing from .env',
  );
}

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native: no URL-based sessions
  },
});
