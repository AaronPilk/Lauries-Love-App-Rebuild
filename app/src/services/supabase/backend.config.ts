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

// Feed/chat (formerly Sendbird) still run on in-app demo data until the
// Phase-B migration onto posts/conversations tables. True whenever we are
// NOT talking to the legacy Sendbird service — i.e. always, in the rebuild.
import { MOCK_ENABLED } from 'mocks/mock.config';
export const SOCIAL_STUBBED = MOCK_ENABLED || SUPABASE_ENABLED;

// Official support account (fixed row in profiles/auth.users).
export const SUPPORT_PROFILE_ID = 'c0000000-0000-4000-8000-000000000001';
