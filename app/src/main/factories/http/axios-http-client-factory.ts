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

export const cometChatClient = axios.create({
  baseURL: `https://${appConfig.cometChatAppId}.api-us.cometchat.io/v3`,
  headers: {
    apiKey: '731e95126c81034804d76316e5f84c52bd61fec4',
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
