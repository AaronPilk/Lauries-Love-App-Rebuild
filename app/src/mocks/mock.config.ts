// Central switch for mock/demo mode (local UI testing with no real backend).
// SINGLE SOURCE OF TRUTH: EXPO_PUBLIC_BACKEND. Mock is only on when the
// backend mode is explicitly 'mock' — it can never override supabase mode.
// (EXPO_PUBLIC_MOCK=true is honored only when EXPO_PUBLIC_BACKEND is unset,
// for backward compatibility with older .env files.)
const backend = process.env.EXPO_PUBLIC_BACKEND;
export const MOCK_ENABLED =
  backend === 'mock' ||
  (backend == null && process.env.EXPO_PUBLIC_MOCK === 'true');
