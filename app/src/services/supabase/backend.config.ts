// Which backend the app talks to — SINGLE SOURCE OF TRUTH for the whole app.
//   'mock'     — fake in-app data (local UI testing)
//   'supabase' — real Backend V2 (Supabase project: Lauries Love)
//
// Controlled by EXPO_PUBLIC_BACKEND in app/.env; falls back to legacy
// EXPO_PUBLIC_MOCK for compatibility. An INVALID value can never make both
// flags false (which would fall through into removed legacy code paths):
// anything unrecognized resolves to 'supabase' with a loud dev warning.
const explicit = process.env.EXPO_PUBLIC_BACKEND;

if (explicit != null && explicit !== 'supabase' && explicit !== 'mock') {
  // eslint-disable-next-line no-console
  console.warn(
    `[backend.config] Unrecognized EXPO_PUBLIC_BACKEND="${explicit}" — ` +
      `falling back to 'supabase'. Valid values: supabase | mock.`,
  );
}

export const BACKEND: 'mock' | 'supabase' =
  explicit === 'mock'
    ? 'mock'
    : explicit === 'supabase'
      ? 'supabase'
      : process.env.EXPO_PUBLIC_MOCK === 'true'
        ? 'mock'
        : 'supabase';

export const SUPABASE_ENABLED = BACKEND === 'supabase';
export const MOCK_ENABLED = BACKEND === 'mock';

// Feed/chat (formerly Sendbird) never talk to the legacy service in the
// rebuild — always true, kept for the guards that reference it.
export const SOCIAL_STUBBED = MOCK_ENABLED || SUPABASE_ENABLED;

// Official support account (fixed row in profiles/auth.users). Overridable
// per environment; the support-chat button verifies the profile exists and
// fails gracefully if it hasn't been seeded yet.
export const SUPPORT_PROFILE_ID =
  process.env.EXPO_PUBLIC_SUPPORT_PROFILE_ID ||
  'c0000000-0000-4000-8000-000000000001';
