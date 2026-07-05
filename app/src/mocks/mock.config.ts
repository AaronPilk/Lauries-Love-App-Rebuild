// Mock/demo mode flag — DERIVED from the single backend switch so the two
// can never disagree (an env typo used to make BOTH flags false and fall
// through into removed legacy code paths).
export { MOCK_ENABLED } from 'services/supabase/backend.config';
