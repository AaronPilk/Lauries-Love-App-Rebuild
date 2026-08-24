import { useEffect, useState } from 'react';
import { z } from 'zod';

// types
import { Notification } from './notifications.screen';

// providers
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { useChatProvider } from 'providers/ChatProvider/ChatProvider';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { customShowError } from 'utils/other';

const useNotificationsScreen = () => {
  const { api } = useApiProvider();
  const { showToast } = useToastProvider();
  const { getFriends, getChannels } = useChatProvider();
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
