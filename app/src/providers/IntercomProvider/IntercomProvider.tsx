import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Intercom, {
  IntercomEvents,
  UserAttributes,
} from '@intercom/intercom-react-native';

import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { MOCK_ENABLED } from 'mocks/mock.config';

interface IntercomContextType {
  signInIntercom: (attributes: UserAttributes, token: string) => Promise<void>;
  updateIntercom: (attributes: UserAttributes) => void;
  signOutIntercom: () => void;
  trackIntercom: (event: string) => void;
  openIntercom: () => void;
  unreadCount: number;
}

const IntercomContext = createContext<IntercomContextType | undefined>(
  undefined,
);

export const IntercomProvider = ({ children }: { children: ReactNode }) => {
  const { api } = useApiProvider();
  const [unreadCount, setUnreadCount] = useState(0);

  async function signInIntercom(
    { userId, email }: UserAttributes,
    token: string,
  ) {
    if (MOCK_ENABLED) return; // no Intercom in mock mode
    try {
      const userHash: string | null = await api('/users/intercom/user-hash', {
        config: {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      if (!userHash) throw new Error('User hash not found');

      Intercom.setUserHash(userHash);
      Intercom.loginUserWithUserAttributes({ userId, email });
      Intercom.setLauncherVisibility('GONE');
    } catch (error) {
      console.error('Failed to register identified user:', error);
    }
  }

  function updateIntercom(attributes: UserAttributes) {
    if (MOCK_ENABLED) return;
    try {
      Intercom.updateUser(attributes);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  function signOutIntercom() {
    if (MOCK_ENABLED) return;
    try {
      Intercom.logout();
    } catch (error) {
      console.error('Failed to logout from Intercom:', error);
    }
  }

  function trackIntercom(event: string) {
    if (MOCK_ENABLED) return;
    try {
      Intercom.logEvent(event, { completed: true });
    } catch (error) {
      console.error('Failed to track checklist completion:', error);
    }
  }

  function openIntercom() {
    if (MOCK_ENABLED) return;
    try {
      Intercom.present();
    } catch (error) {
      console.error('Failed to open Intercom:', error);
    }
  }

  useEffect(() => {
    // Get initial unread count
    Intercom.getUnreadConversationCount().then(count => {
      setUnreadCount(count);
    });

    // Listen for unread count changes
    const listener = Intercom.addEventListener(
      IntercomEvents.IntercomUnreadCountDidChange,
      response => {
        setUnreadCount(response.count || 0);
      },
    );

    // Cleanup listener on component unmount
    return () => listener.remove();
  }, []);

  const value = useMemo(
    () => ({
      signInIntercom,
      updateIntercom,
      signOutIntercom,
      trackIntercom,
      openIntercom,
      unreadCount,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, unreadCount],
  );

  return (
    <IntercomContext.Provider value={value}>
      {children}
    </IntercomContext.Provider>
  );
};

export const useIntercom = () => {
  const context = useContext(IntercomContext);
  if (!context) {
    throw new Error('useIntercom must be used within an IntercomProvider');
  }
  return context;
};
