import { AxiosHttpClient } from 'infra/http/axios-http-client';
import axios from 'axios';
import { appConfig } from '../../config/app.config';
import * as Auth from 'aws-amplify/auth';
import { consoleCustom } from 'utils/other';
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

export const makeAxiosCometChatClient = (): AxiosHttpClient => {
  return new AxiosHttpClient(cometChatClient);
};

// NOTE (rebuild): CometChat is legacy/dead (replaced by Sendbird) and is slated
// for full removal. The hardcoded API key has been stripped — supply your own via
// env if you ever need this client, otherwise delete it in the P3 cleanup pass.
export const cometChatClient = axios.create({
  baseURL: `https://${appConfig.cometChatAppId}.api-us.cometchat.io/v3`,
  headers: {
    apiKey: process.env.EXPO_PUBLIC_COMETCHAT_API_KEY ?? '',
  },
});

client.interceptors.request.use(async (config: any) => {
  // Mock: no session to attach. Supabase: the adapter handles everything and
  // Amplify is not configured — calling fetchAuthSession would boot Cognito
  // machinery on EVERY request for nothing. Skip both.
  if (MOCK_ENABLED || SUPABASE_ENABLED) return config;
  try {
    const session = await Auth.fetchAuthSession();
    const jwtToken = session.tokens?.accessToken;
    if (!jwtToken) {
      return config;
    }

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${jwtToken}`,
      },
    };
  } catch (error) {
    return config;
  }
});
