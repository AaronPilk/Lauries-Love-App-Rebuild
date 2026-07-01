import { Settings, AppEventsLogger } from 'react-native-fbsdk-next';

export const initFacebookSDK = () => {
  Settings.initializeSDK();
  AppEventsLogger.logEvent('AppLaunched');
  Settings.setAutoLogAppEventsEnabled(true);
  Settings.setAdvertiserTrackingEnabled(true);
  Settings.setAdvertiserIDCollectionEnabled(true);
};

export const trackEvent = (
  eventName: string,
  params: Record<string, any> = {},
): void => {
  AppEventsLogger.logEvent(eventName, params);
};
