// Axios adapter that routes requests through the mock API instead of the network.
// Installed on the factory axios client when MOCK_ENABLED.

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { mockApi } from './mock.api';

export async function mockAxiosAdapter(
  config: AxiosRequestConfig,
): Promise<AxiosResponse> {
  const base = config.baseURL || '';
  const url = `${config.url?.startsWith('http') ? '' : base}${config.url}`;
  const data = await mockApi(url, {
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
