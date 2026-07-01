import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
} from 'react';
import PostHog, { PostHogProvider } from 'posthog-react-native';

// types
import { PosthogEventType } from './PosthogProvider.types';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';

type PosthogContext = {
  onCapture: (values: PosthogEventType) => void;
};

type PosthogProviderProps = {
  children: JSX.Element;
};

export const posthogContext = createContext({} as PosthogContext);
export const posthog = new PostHog(
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '',
);

const PosthogProvider: FunctionComponent<PosthogProviderProps> = ({
  children,
}) => {
  const { userDB } = useUserDBProvider();

  const identifyUser = async () => {
    if (!userDB) return;

    posthog.identify(userDB?.cognitoId, {
      loginId: userDB?.cognitoId,
      email: userDB?.email,
      name: userDB?.firstName,
    });
  };

  const onCapture = (values: PosthogEventType) => {
    const user_id = userDB?.cognitoId || values.properties?.userId;
    if (!user_id) return;

    const properties = {
      ...values.properties,
      user_id,
      email: userDB?.email || values.properties?.email,
      distinct_id: user_id,
    };
    posthog.capture(values.typeEvent, properties);
  };

  useEffect(() => {
    if (userDB?.cognitoId) identifyUser();
  }, [userDB?.cognitoId]);

  return (
    <posthogContext.Provider value={{ onCapture }}>
      <PostHogProvider
        client={posthog}
        options={{
          host: 'https://us.i.posthog.com',
          enableSessionReplay: true,
          sessionReplayConfig: {
            maskAllTextInputs: true,
            maskAllImages: true,
            maskAllSandboxedViews: true,
            captureLog: true,
            captureNetworkTelemetry: true,
            androidDebouncerDelayMs: 1000,
            iOSdebouncerDelayMs: 1000,
          },
        }}
        autocapture
      >
        {children}
      </PostHogProvider>
    </posthogContext.Provider>
  );
};

export const usePosthogProvider = () => useContext(posthogContext);

export default PosthogProvider;
