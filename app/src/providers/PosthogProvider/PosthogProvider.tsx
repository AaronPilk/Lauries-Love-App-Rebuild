import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
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

// No key (local/mock dev) -> disable PostHog entirely instead of crashing.
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
export const posthog = POSTHOG_API_KEY ? new PostHog(POSTHOG_API_KEY) : null;

const PosthogProvider: FunctionComponent<PosthogProviderProps> = ({
  children,
}) => {
  const { userDB } = useUserDBProvider();

  const identifyUser = async () => {
    if (!userDB || !posthog) return;

    posthog.identify(userDB?.cognitoId, {
      loginId: userDB?.cognitoId,
      email: userDB?.email,
      name: userDB?.firstName,
    });
  };

  const onCapture = (values: PosthogEventType) => {
    if (!posthog) return;
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => ({ onCapture }), [userDB]);

  if (!posthog) {
    // Analytics disabled (no key): keep the context so consumers work, skip the SDK.
    return (
      <posthogContext.Provider value={value}>
        {children}
      </posthogContext.Provider>
    );
  }

  return (
    <posthogContext.Provider value={value}>
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
