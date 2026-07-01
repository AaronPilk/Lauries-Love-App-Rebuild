import { appConfig } from 'main/config/app.config';

export const DEFAULT_APP_CONFIG = {
  baseURL: appConfig.apiUrl,
};

export type ApiResponse<T> = {
  ok: boolean;
  msg: string;
  result: T;
};