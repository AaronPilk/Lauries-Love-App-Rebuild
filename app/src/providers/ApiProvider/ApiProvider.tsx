import React, { FunctionComponent, useContext, useEffect } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

// providers
import { useUserAWSProvider } from 'providers/UserAWSProvider/UserAWSProvider';

// constants
import { DEFAULT_APP_CONFIG } from './ApiProvider.constants';

type ApiType = <T>(
  url: string,
  configurations?: {
    config?: AxiosRequestConfig | null;
    type?: 'api';
  },
) => Promise<T>;

type ApiContext = {
  api: ApiType;
};

type ApiProviderProps = {
  children: JSX.Element;
};

export const apiContext = React.createContext({} as ApiContext);

const ApiProvider: FunctionComponent<ApiProviderProps> = ({ children }) => {
  const { jwtTokenUser } = useUserAWSProvider();
  const api: ApiType = async (url, configurations = {}) => {
    const { config, type = 'api' } = configurations;
    const urlApi = DEFAULT_APP_CONFIG.baseURL;
    const queryParams = qs.stringify(
      {},
      {
        addQueryPrefix: !url.includes('?'),
      },
    );
    const currentUrl = url.includes('http')
      ? url
      : `${urlApi}${url}${url.includes('?') ? `&${queryParams}` : queryParams}`;

    try {
      const response = await axios(currentUrl, {
        ...config,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtTokenUser}`,
          ...config?.headers,
        },
      });

      return response.data;
    } catch (error: any) {
      if (__DEV__) {
        console.warn('currentUrl', currentUrl);
        console.warn('config', {
          ...config,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtTokenUser}`,
            ...config?.headers,
          },
        });
        if (error instanceof Error)
          console.warn('error-message', error.message);
      }
      throw error;
    }
  };

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      interruptionModeIOS: InterruptionModeIOS.DuckOthers,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  return <apiContext.Provider value={{ api }}>{children}</apiContext.Provider>;
};

export const useApiProvider = () => useContext(apiContext);

export default ApiProvider;
