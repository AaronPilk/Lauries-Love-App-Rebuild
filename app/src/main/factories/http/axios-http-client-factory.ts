import { AxiosHttpClient } from 'infra/http/axios-http-client';
import axios from 'axios';
import { appConfig } from '../../config/app.config';
import * as Auth from 'aws-amplify/auth';
import { consoleCustom } from 'utils/other';

export const client = axios.create({
  baseURL: appConfig.apiUrl,
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
