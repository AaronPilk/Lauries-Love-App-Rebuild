import { appConfig } from 'main/config/app.config';

export const makeApiUrl = (path: string): string => {
  let apiUrl = appConfig.apiUrl;
  if (!apiUrl) {
    apiUrl = 'http://localhost';
  }
  if (path.startsWith('/')) {
    return `${apiUrl}${path}`;
  }
  return `${apiUrl}/${path}`;
};
