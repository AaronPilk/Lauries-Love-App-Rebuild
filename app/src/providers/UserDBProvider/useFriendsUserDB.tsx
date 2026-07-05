import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useSendbirdChat } from 'services/legacy-chat.shim';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { z } from 'zod';

// types
import {
  MetaDataUserSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { UserDBType } from './UserDBProvider.types';

// providers
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { useUserDBProvider } from './UserDBProvider';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

// utils
import { getFileStorageAmplify } from 'utils/amplify-storage';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { publicUrlFor } from 'services/supabase/supabase.storage';

// constants
import { DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD } from 'providers/SendbirdChatProvider/SendbirdChatProvider.constants';

type FriendsUserDBProps = {
  friendId: string;
  friendCognitoId: string;
  navigation?: NativeStackNavigationProp<any>;
};

const useFriendsUserDB = ({
  friendId,
  friendCognitoId,
  navigation,
}: FriendsUserDBProps) => {
  const { api } = useApiProvider();
  const { sdk } = useSendbirdChat();
  const { userDB, getOnlyUserDBById } = useUserDBProvider();
  const { getFriends } = useSendbirdChatProvider();
  const { sendNotification } = useSendBirdPostsProvider();
  const [selectUserSendbird, setSelectUserSendbird] =
    useState<UserSendBirdType | null>(null);
  const [selectUserDB, setSelectUserDB] = useState<UserDBType | null>(null);
  const [status, setStatus] = useState<'pending' | 'accepted' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  const isPending = useMemo(() => status === 'pending', [status]);
  const isAccepted = useMemo(() => status === 'accepted', [status]);
  const isCurrentUser = useMemo(
    () => userDB?.id === friendId,
    [userDB, friendId],
  );

  const sendFriendNotification = async () => {
    if (!userDB || !friendId) return null;

    setIsLoading(true);
    try {
      const response = await sendNotification({
        notifierId: friendId,
        senderId: userDB.id,
        entityType: 'NEW_FRIEND_REQUEST',
      });

      return response;
    } catch (error) {
      if (__DEV__) console.warn('Error sending notification', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDB = async (id: string) => {
    try {
      const userDB = await getOnlyUserDBById(id);
      return userDB;
    } catch (error) {
      if (__DEV__) console.warn('getUser error', error);
      return null;
    }
  };

  const getIsFriend = async (userId: string) => {
    try {
      const query = sdk.createFriendListQuery();
      const friends = await query.next();
      setIsFriend(friends.some(friend => friend.userId === userId));
    } catch (error) {
      if (__DEV__) console.warn('getIsFriend error', error);
    }
  };

  const getUserSendbird = async () => {
    try {
      const query = sdk.createApplicationUserListQuery({
        userIdsFilter: [friendCognitoId],
      });
      const users = await query.next();
      if (users.length === 0)
        Alert.alert('Error', DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD, [
          {
            text: 'OK',
            onPress: () => navigation?.goBack(),
          },
        ]);
      const firstUser = users[0] as UserSendBirdType;
      const metaData = firstUser.metaData.userInfo
        ? (JSON.parse(
            firstUser.metaData.userInfo,
          ) as MetaDataUserSendBirdType | null)
        : null;
      const rightUser = {
        ...firstUser,
        metaData: {
          ...firstUser.metaData,
          ...metaData,
        },
      };
      const userDB = rightUser.metaData.id
        ? await getUserDB(rightUser.metaData.id)
        : null;
      await getIsFriend(rightUser.userId);
      setSelectUserSendbird(rightUser as UserSendBirdType);
      // Supabase avatars are public-bucket paths; Amplify signed urls are
      // legacy-mode only (they fail silently in Supabase mode).
      const profileImgUrl = userDB?.profilePicture
        ? SUPABASE_ENABLED
          ? publicUrlFor('avatars', userDB.profilePicture)
          : (await getFileStorageAmplify(userDB.profilePicture))?.href || null
        : null;
      if (userDB)
        setSelectUserDB({
          ...userDB,
          profileImgUrl,
        });
    } catch (error) {
      if (__DEV__) console.warn('getUser error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestedFriend = async () => {
    if (!friendId || isCurrentUser) return;

    try {
      const result = await api(`/users/${friendId}/friend-requests`, {
        config: {
          method: 'GET',
        },
        schema: z.array(z.object({ status: z.string() })),
      });
      if (!result || result.length === 0) {
        setStatus(null);
        return;
      }

      const { status } = result[0];
      setStatus(status as 'pending' | 'accepted');
    } catch (error) {
      if (__DEV__) console.warn('Error getting requested friend', error);
    } finally {
      getUserSendbird();
    }
  };

  const addFriend = async () => {
    setIsLoading(true);
    try {
      const response = await api(`/users/${friendId}/friend-requests`, {
        config: {
          method: 'POST',
          data: {
            id: friendId,
          },
        },
        schema: z.object({
          id: z.string(),
          active: z.boolean(),
          status: z.enum(['pending', 'accepted']),
          sender: z
            .object({
              id: z.string(),
            })
            .optional(),
        }),
      });
      if (!response) return { statusCode: 400 };

      if (selectUserSendbird) await sdk.addFriends([selectUserSendbird.userId]);

      setStatus(response.status);
      return { statusCode: 201 };
    } catch (error) {
      if (__DEV__) console.warn('Error adding friend', error);
      return { statusCode: 400 };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmFriend = async () => {
    if (selectUserSendbird) await sdk.addFriends([selectUserSendbird.userId]);
  };

  const removeFriend = async () => {
    setIsLoading(true);
    try {
      const response = await api(`/users/${friendId}/friend-requests`, {
        config: {
          method: 'DELETE',
        },
        schema: z.any(),
      });
      if (!response) return { statusCode: 400 };

      return { statusCode: 204 };
    } catch (error) {
      if (__DEV__) console.warn('Error removing friend', error);
      return { statusCode: 400 };
    } finally {
      setIsLoading(false);
    }
  };

  const handleFriend = async () => {
    setIsLoading(true);
    try {
      if (!isAccepted && !isFriend) {
        const { statusCode } = await addFriend();
        if (statusCode !== 201) return;

        await getRequestedFriend();
        await sendFriendNotification();
        return;
      }
      if (isFriend) await sdk.deleteFriend(friendCognitoId);

      const { statusCode } = await removeFriend();
      if (statusCode !== 204) return;

      await getUserSendbird();
      return;
    } catch (error) {
      if (__DEV__) console.warn('Error handling friend', error);
    } finally {
      setIsLoading(false);
      getRequestedFriend();
      getFriends();
    }
  };

  useEffect(() => {
    if (friendId.length > 0) getRequestedFriend();
  }, [friendId]);

  return {
    status,
    isLoading,
    isPending,
    isFriend,
    isAccepted,
    isCurrentUser,
    selectUserSendbird,
    selectUserDB,
    handleFriend,
    confirmFriend,
  };
};

export default useFriendsUserDB;
