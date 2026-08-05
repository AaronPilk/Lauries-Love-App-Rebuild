import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Web app for Laurie's Love. Shares the same Supabase backend as the mobile
// apps (iOS/Android) — accounts, data, messages, groups all synced.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
