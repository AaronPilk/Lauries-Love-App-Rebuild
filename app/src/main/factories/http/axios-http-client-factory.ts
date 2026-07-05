import { AxiosHttpClient } from 'infra/http/axios-http-client';
import axios from 'axios';
import { appConfig } from '../../config/app.config';
import { MOCK_ENABLED } from 'mocks/mock.config';
import { mockAxiosAdapter } from 'mocks/mock.adapter';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { supabaseAxiosAdapter } from 'services/supabase/supabase.adapter';

export const client = axios.create({
  baseURL: appConfig.apiUrl,
  // Mock mode: fake data. Supabase mode: Backend V2. Legacy REST otherwise.
  ...(MOCK_ENABLED
    ? { adapter: mockAxiosAdapter as any }
    : SUPABASE_ENABLED
      ? { adapter: supabaseAxiosAdapter as any }
      : {}),
});

export const makeAxiosHttpClient = (): AxiosHttpClient => {
  return new AxiosHttpClient(client);
};

// Legacy dead chat-service client removed (nothing imported it).
// Legacy Amplify auth interceptor removed too: in mock mode there is no
// session to attach and in supabase mode the adapter handles auth itself,
// so the interceptor was a no-op for every reachable code path.
