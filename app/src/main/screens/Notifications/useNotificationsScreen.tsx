import { useEffect, useState } from 'react';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { z } from 'zod';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';

// types
import { Notification } from './notifications.screen';

// providers
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { customShowError } from 'utils/other';

const useNotificationsScreen = () => {
  const { sdk } = useSendbirdChat();
  const { api } = useApiProvider();
  const { showToast } = useToastProvider();
  const { getFriends, getChannels } = useSendbirdChatProvider();
  const [notificationSenders, setNotificationSenders] = useState<
    Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (notificationSenders.length === 0 || isLoading) return;

    const notificationSender = notificationSenders[0];
    if (!notificationSender) return;

    try {
      setIsLoading(true);
      // Sendbird is fully retired: friendship state lives in the friendships
      // table. Legacy sdk mirror kept only for the legacy backend mode.
      if (!SUPABASE_ENABLED) {
        try {
          const query = sdk.createApplicationUserListQuery({
            metaDataKeyFilter: 'id',
            metaDataValuesFilter: [notificationSender.senderId],
          });
          const users = await query.next();
          const user = users.length > 0 ? users[0] : null;
          if (user) await sdk.addFriends([user.userId]);
        } catch (sdkError) {
          if (__DEV__) console.warn('legacy sendbird addFriends', sdkError);
        }
      }

      const responseAccepted = await api(
        `/users/${notificationSender.senderId}/friend-requests`,
        {
          config: {
            method: 'put',
            data: { status: 'accepted' },
          },
          schema: z.object({
            status: z.enum(['accepted']),
          }),
        },
      );

      if (responseAccepted?.status === 'accepted') {
        await api(`/notifications/${notificationSender.id}`, {
          config: {
            method: 'put',
            data: { active: false },
          },
          schema: z.object({
            id: z.string(),
          }),
        });

        await getChannels();
        await getFriends();
      }
    } catch (error) {
      customShowError({
        error: new Error('Failed to accept friend request' + error),
        showToast,
      });
    } finally {
      setIsLoading(false);
      setNotificationSenders(prev => prev.slice(1));
    }
  };

  useEffect(() => {
    if (notificationSenders.length > 0 && !isLoading) handleConfirm();
  }, [notificationSenders, isLoading]);

  return { notificationSenders, setNotificationSenders };
};

export default useNotificationsScreen;
