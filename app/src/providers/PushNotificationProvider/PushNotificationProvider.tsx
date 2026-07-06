import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert, Linking, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { PermissionStatus } from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';

// providers
import { usePermissionsProvider } from 'providers/PermissionsProvider/PermissionsProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

type NotificationTrigger = {
  payload?: {
    redirect?: string;
    [key: string]: any;
  };
};

type PushNotificationContext = {
  sendPushNotification: (
    props?: Notifications.NotificationRequestInput,
  ) => void;
  sendPushNotificationToServer: (value: {
    content?: string;
    redirect?: string;
    notifierIds: string[];
    senderId?: string;
  }) => Promise<boolean>;
};

type PushNotificationProviderProps = {
  children: JSX.Element;
};

export const pushNotificationContext = React.createContext(
  {} as PushNotificationContext,
);

const PushNotificationProvider: FunctionComponent<
  PushNotificationProviderProps
> = ({ children }) => {
  const navigation = useNavigation();
  const { api } = useApiProvider();
  const { userDB, updateUserDB } = useUserDBProvider();
  const { userChat } = useSendbirdChatProvider();
  const { permissions, requestPermissionsNotificationFirebase } =
    usePermissionsProvider();
  const [token, setToken] = useState<string | null>(null);

  //TODO: TESTING version
  const sendPushNotification = async (
    props?: Notifications.NotificationRequestInput,
  ) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'My first local notification',
          body: 'This is the body of the notification',
        },
        trigger: null,
        ...props,
      });
    } catch (error) {
      if (__DEV__) console.warn('Error in sendPushNotification', error);
      return false;
    }
  };

  const sendPushNotificationToServer = async (value: {
    content?: string;
    redirect?: string;
    notifierIds: string[];
    senderId?: string;
  }) => {
    try {
      const result = await api('/notifications/send-push-notification', {
        config: {
          method: 'POST',
          data: {
            ...value,
            senderId: value.senderId || userDB?.id || '',
          },
        },
      });
      if (__DEV__)
        console.warn('Result-sendPushNotificationToServer: ', result);
      return true;
    } catch (error) {
      if (__DEV__)
        console.warn('Error in sendPushNotificationOtherDevice', error);
      return false;
    }
  };

  const checkPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        if (
          permissions.notificationFirebaseIOS &&
          permissions.notificationFirebaseIOS >= 1
        )
          return true;

        const { notificationFirebaseIOS } =
          await requestPermissionsNotificationFirebase();
        if (notificationFirebaseIOS && notificationFirebaseIOS >= 1)
          return true;

        Alert.alert(
          'Permission required',
          'Please allow notification permission to receive push notifications',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
        return false;
      } else {
        if (
          permissions.notificationFirebaseAndroid &&
          permissions.notificationFirebaseAndroid === PermissionStatus.GRANTED
        )
          return true;

        const { notificationFirebaseAndroid } =
          await requestPermissionsNotificationFirebase();
        if (notificationFirebaseAndroid === PermissionStatus.GRANTED)
          return true;

        Alert.alert(
          'Permission required',
          'Please allow notification permission to receive push notifications',
          [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              },
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ],
        );
        return false;
      }
    } catch (error) {
      if (__DEV__) console.warn('Error in checkPermission', error);
      return false;
    }
  };

  const getToken = async () => {
    try {
      const hasPermission = await checkPermission();
      if (!hasPermission) return false;

      const resultToken = await messaging().getToken();
      if (!resultToken) return false;

      setToken(resultToken);

      if (userDB?.config?.notifications?.notificationToken !== resultToken)
        updateUserDB({
          config: {
            notifications: {
              notificationToken: resultToken,
              active: true,
              deviceType: Platform.OS,
            },
          },
        });

      if (__DEV__) console.warn('Token:', resultToken);
      //TODO: TESTING sendPushNotification
      //await sendPushNotification();
      if (!userChat?.userId) return false;

      // The FCM token is saved on the profile above (updateUserDB) for the
      // push edge function. There is no legacy chat SDK to register with.
      return true;
    } catch (error) {
      if (__DEV__) console.warn('Error in getToken', error);
      return false;
    }
  };

  useEffect(() => {
    if (userChat?.userId) getToken();
  }, [userChat?.userId]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      response => {
        const { payload } = response.notification.request
          .trigger as NotificationTrigger;

        const isGroup = payload?.aps?.alert?.body?.includes('group');

        const redirectTo = isGroup
          ? PATHS_MESSAGES_TAB.messagesTabChatGroup
          : PATHS_MESSAGES_TAB.messagesTabChat;

        if (payload?.redirect) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: 'Messages',
                  state: {
                    routes: [
                      {
                        name: PATHS_MESSAGES_TAB.messagesTabMain,
                      },
                      {
                        name: redirectTo,
                        params: {
                          channelUrl: payload.redirect,
                        },
                      },
                    ],
                  },
                },
              ],
            }),
          );
        } else {
          console.warn('No redirect URL found in payload.');
        }
      },
    );

    return () => subscription.remove();
  }, []);

  const value = useMemo(
    () => ({ sendPushNotification, sendPushNotificationToServer }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, userDB],
  );

  return (
    <pushNotificationContext.Provider value={value}>
      {children}
    </pushNotificationContext.Provider>
  );
};

export const usePushNotificationProvider = () =>
  useContext(pushNotificationContext);

export default PushNotificationProvider;
