// Which backend the app talks to.
//   'mock'     — fake in-app data (current demo mode)
//   'supabase' — real Backend V2 (Supabase project: Lauries Love)
//
// Controlled by EXPO_PUBLIC_BACKEND in app/.env; falls back to legacy
// EXPO_PUBLIC_MOCK for compatibility.
const explicit = process.env.EXPO_PUBLIC_BACKEND;

export const BACKEND: 'mock' | 'supabase' =
  explicit === 'supabase'
    ? 'supabase'
    : explicit === 'mock'
      ? 'mock'
      : process.env.EXPO_PUBLIC_MOCK === 'true'
        ? 'mock'
        : 'supabase';

export const SUPABASE_ENABLED = BACKEND === 'supabase';
