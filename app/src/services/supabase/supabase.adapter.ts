// Axios adapter for the factory client: routes requests through supabaseApi
// (used by the react-query hooks that don't go through ApiProvider).

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { supabaseApi } from './supabase.api';

export async function supabaseAxiosAdapter(
  config: AxiosRequestConfig,
): Promise<AxiosResponse> {
  const base = config.baseURL || '';
  const url = `${config.url?.startsWith('http') ? '' : base}${config.url}`;
  const data = await supabaseApi(url, {
    method: config.method,
    data:
      typeof config.data === 'string' && config.data
        ? JSON.parse(config.data)
        : config.data,
  });

  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config as any,
  };
}
