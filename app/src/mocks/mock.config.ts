// Central switch for mock/demo mode (local UI testing with no real backend).
// Enabled via EXPO_PUBLIC_MOCK=true in app/.env (gitignored, local only).
export const MOCK_ENABLED = process.env.EXPO_PUBLIC_MOCK === 'true';
