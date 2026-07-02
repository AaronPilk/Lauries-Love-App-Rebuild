import { z } from 'zod';
import { captureException } from '@sentry/react-native';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useDBProvider } from 'providers/DBProvider/DBProvider';
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { MOCK_ENABLED } from 'mocks/mock.config';
import {
  MOCK_COMMENTS,
  MOCK_GROUPS,
  MOCK_POSTS,
} from 'mocks/mock.sendbird';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { BaseMessageSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

type SendBirdPostsContext = {
  posts: GroupChannel[];
  comments: Record<string, BaseMessageSendBirdType[]>;
  loadingStorage: boolean;
  loadingServer: boolean;
  limit: number;
  setLimit: (limit: number) => void;
  getPosts: () => void;
  getFilteringUserInfo: () => Promise<GroupChannel[] | undefined>;
  getPost: (channelUrl: string) => Promise<BaseMessageSendBirdType[]>;
  toggleReaction: (
    postUrl: string,
    messagePost: BaseMessageSendBirdType,
  ) => void;
  sendNotification: (data: {
    notifierId: string;
    senderId: string;
    entityType: 'NEW_MESSAGE' | 'NEW_LIKE' | 'NEW_FRIEND_REQUEST';
    content?: string;
    type?: 'comment' | 'post';
    meta?: {
      id: string;
      commentId?: string;
      redirectUrl: string;
    };
  }) => Promise<{ ok: boolean; msg: string }>;
};

type SendBirdPostsProviderProps = {
  children: JSX.Element;
};

export const sendBirdPostsContext = createContext({} as SendBirdPostsContext);

const KEY_POSTS_STORAGE = 'KEY_POSTS_STORAGE';
const KEY_COMMENTS_STORAGE = 'KEY_COMMENTS_STORAGE';

const SendBirdPostsProvider: FunctionComponent<SendBirdPostsProviderProps> = ({
  children,
}) => {
  const { api } = useApiProvider();
  const { sdk } = useSendbirdChat();
  const { userChat } = useSendbirdChatProvider();
  const [posts, setPosts] = useState<GroupChannel[]>([]);
  const [comments, setComments] = useState<
    Record<string, BaseMessageSendBirdType[]>
  >({});
  const [loadingServer, setLoadingServer] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [limit, setLimit] = useState(100);
  const { userDB } = useUserDBProvider();
  const {
    db: { diagnosisType },
  } = useDBProvider();

  const getCommentsPosts = async (newPosts?: GroupChannel[]) => {
    const currentPosts = newPosts || posts;
    try {
      const promises = await Promise.all(
        currentPosts.map(async post => {
          try {
            const query = post.createPreviousMessageListQuery({
              reverse: false,
              includeReactions: true,
              limit: 100,
            });
            const messages = await query.load();
            return {
              url: post.url,
              messages,
            };
          } catch (error) {
            console.log(`Error fetching messages for post: ${post.url}`, error);
            captureException(error);
            return { url: post.url, messages: [] };
          }
        }),
      );

      const newMessages = promises.reduce(
        (acc, { url, messages }) => ({
          ...acc,
          [url]: messages,
        }),
        {},
      );

      setComments(newMessages);
      AsyncStorage.setItem(KEY_COMMENTS_STORAGE, JSON.stringify(newMessages));
    } catch (error) {
      if (__DEV__) console.warn('Error getting first message post', error);
      captureException(error);
    }
  };

  const getFilteringUserInfo = async () => {
    if (MOCK_ENABLED) {
      // Return recommendation groups matching the user's role/diagnosis the
      // same way the real Sendbird query would (name-contains, lowercase).
      const roleName = userDB?.role?.description?.toLowerCase() || '';
      const matches = MOCK_GROUPS.filter(
        g =>
          g.name.toLowerCase().includes(roleName) ||
          (userDB?.diagnosisTypes || []).some((d: any) =>
            g.name
              .toLowerCase()
              .includes((d?.description || '').toLowerCase().split(' ')[0]),
          ),
      );
      return (matches.length > 0 ? matches : MOCK_GROUPS.slice(0, 4)) as any;
    }
    try {
      const removeTrailingDots = (str: string) => {
        const index = str.indexOf('...');
        return index !== -1 ? str.slice(0, index) : str;
      };
      const roleName = userDB?.role?.description?.toLowerCase();
      const cancerType = (userDB?.diagnosisTypes || [])
        .map(diagnosis => {
          const diagnosisId = diagnosis?.id ? diagnosis?.id : diagnosis;
          const match = diagnosisType.find(d => d.id === diagnosisId);
          return match?.description
            ? removeTrailingDots(match.description.toLowerCase())
            : null;
        })
        .filter(Boolean);

      const searchParams = [roleName, cancerType[0]].filter(Boolean);
      if (searchParams.length === 0) {
        console.warn('There are no valid search parameters.');
        return;
      }
      const queries = searchParams
        .filter(
          (param): param is string => param !== null && param !== undefined,
        )
        .map(param =>
          sdk.groupChannel.createPublicGroupChannelListQuery({
            includeEmpty: true,
            limit: 2,
            metadataKey: 'recommendation',
            channelNameContainsFilter: param,
          }),
        );

      const results = await Promise.all(queries.map(query => query.next()));
      const allChannels = results.flat();
      return allChannels;
    } catch (error) {
      console.warn('Error fetching recommended groups:', error);
      captureException(error);
    }
  };

  const filterChannelsByUserPreferences = (posts?: GroupChannel[]) => {
    if (!posts || posts.length === 0) {
      console.warn('No posts to filter');
      return [];
    }

    const roleName = userDB?.role?.description?.toLowerCase();
    const diagnosisTypes = userDB?.diagnosisTypes ?? [];
    const cancerType = diagnosisTypes
      .map(id => {
        const match = diagnosisType.find(d => d.id === id);
        return match?.description?.toLowerCase();
      })
      .filter(Boolean);

    const filteredPosts = posts.filter(post => {
      const metadata = post.data ? JSON.parse(post.data) : {};
      const { visibility, recommendedGroups } = metadata;

      if (!visibility || visibility !== 'group') return true;
      if (visibility === 'group') {
        if (!recommendedGroups || recommendedGroups.length === 0) return false;

        const validGroups = recommendedGroups.filter(
          (group: null | undefined) => group !== null && group !== undefined,
        );
        const matches = validGroups.some((group: string) =>
          [roleName, cancerType[0]].includes(group?.toLowerCase()),
        );
        return matches;
      }
      return false;
    });

    return filteredPosts;
  };

  const getPosts = async () => {
    if (MOCK_ENABLED) {
      setPosts(MOCK_POSTS as any);
      setComments(MOCK_COMMENTS as any);
      setLoadingStorage(false);
      setLoadingServer(false);
      return;
    }
    setLoadingServer(true);
    const query = sdk.groupChannel.createPublicGroupChannelListQuery({
      limit,
      metadataKey: 'type',
      metadataValues: ['post'],
      // channelUrlsFilter: [
      //   'sendbird_group_channel_313225436_232182b3bc056d89b3e650fd210b2fa5b4e3ad50',
      // ],
    });

    try {
      const channels = await query.next();
      if (channels.length === 0) return;

      const filteredChannels = filterChannelsByUserPreferences(channels);
      // await getCommentsPosts(filteredChannels);
      setPosts(filteredChannels);
      AsyncStorage.setItem(KEY_POSTS_STORAGE, JSON.stringify(filteredChannels));
    } catch (error) {
      if (__DEV__) console.warn('getPosts error:', error);
      captureException(error);
    } finally {
      setLoadingServer(false);
    }
  };

  const storageDB = async () => {
    try {
      setLoadingStorage(true);
      const postsStorageJSON = await AsyncStorage.getItem(KEY_POSTS_STORAGE);
      const commentsStorageJSON = await AsyncStorage.getItem(
        KEY_COMMENTS_STORAGE,
      );
      const postsStorage = postsStorageJSON
        ? JSON.parse(postsStorageJSON)
        : null;
      const commentsStorage = commentsStorageJSON
        ? JSON.parse(commentsStorageJSON)
        : null;

      if (postsStorage) setPosts(postsStorage);
      if (commentsStorage) setComments(commentsStorage);
    } catch (error) {
      if (__DEV__) console.warn('Error getting storageDB', error);
      captureException(error);
    } finally {
      setLoadingStorage(false);
      setLoadingServer(true);
    }
  };

  const toggleReaction = async (
    postUrl: string,
    messagePost: BaseMessageSendBirdType,
  ) => {
    if (MOCK_ENABLED) return; // demo: reactions are local-only in components
    if (!postUrl || !userChat) return;
    setLoadingServer(true);

    try {
      const channel = await sdk.groupChannel.getChannel(postUrl);
      const isJoined = channel.members.some(
        member => member.userId === userChat.userId,
      );
      if (!isJoined) await channel.join();

      const hasReacted = messagePost.reactions.some(
        reaction =>
          reaction.key === 'smile' &&
          reaction.sampledUserIds.some(userId => userId === userChat.userId),
      );
      const reactionEvent = hasReacted
        ? await channel.deleteReaction(messagePost, 'smile')
        : await channel.addReaction(messagePost, 'smile');
      messagePost.applyReactionEvent(reactionEvent);
      const isFounder = channel.creator?.userId === userChat.userId;
      if (!isFounder) await channel.leave();

      // await getCommentsPosts();
    } catch (error) {
      if (__DEV__) console.warn('Error toggling reaction', error);
      captureException(error);
    } finally {
      setLoadingServer(false);
    }
  };

  const getPost = async (channelUrl: string) => {
    if (MOCK_ENABLED) {
      const mockMessages = (MOCK_COMMENTS[channelUrl] ??
        []) as BaseMessageSendBirdType[];
      setComments({ ...comments, [channelUrl]: mockMessages });
      return mockMessages;
    }
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);
      const query = channel.createPreviousMessageListQuery({
        reverse: false,
        includeReactions: true,
        limit: 100,
      });
      const messages = await query.load();
      setComments({ ...comments, [channelUrl]: messages });
      return messages as BaseMessageSendBirdType[];
    } catch (error) {
      if (__DEV__) console.warn('Error getting post', error);
      captureException(error);
      return [];
    }
  };

  const sendNotification = async (data: {
    notifierId: string; // string for NEW_FRIEND_REQUEST
    senderId: string;
    entityType: 'NEW_MESSAGE' | 'NEW_LIKE' | 'NEW_FRIEND_REQUEST';
    content?: string;
    type?: 'comment' | 'post';
    meta?: {
      id: string;
      commentId?: string;
      redirectUrl: string;
    };
  }) => {
    try {
      const response = await api('/notifications', {
        config: {
          method: 'POST',
          data,
        },
        schema: z.object({
          ok: z.boolean(),
          msg: z.string(),
        }),
      });
      if (!response) {
        if (__DEV__) {
          console.warn('data', data);
          console.warn('response', response);
        }
        return { ok: false, msg: 'Error sending notification' };
      }
      return response;
    } catch (error) {
      if (__DEV__) console.warn('Error sending notification', error);
      captureException(error);
      return { ok: false, msg: 'Error sending notification' };
    }
  };

  useEffect(() => {
    if (MOCK_ENABLED) {
      // Mock mode: inject fake posts/comments directly, skip storage + server.
      setPosts(MOCK_POSTS as any);
      setComments(MOCK_COMMENTS as any);
      setLoadingStorage(false);
      setLoadingServer(false);
      return;
    }
    if (userChat?.userId) storageDB().then(getPosts);
  }, [userChat?.userId, limit]);

  const value = useMemo(
    () => ({
      posts,
      comments,
      loadingStorage,
      loadingServer,
      limit,
      setLimit,
      getPosts,
      getFilteringUserInfo,
      getPost,
      toggleReaction,
      sendNotification,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      posts,
      comments,
      loadingStorage,
      loadingServer,
      limit,
      userChat,
      userDB,
      diagnosisType,
      api,
      sdk,
    ],
  );

  return (
    <sendBirdPostsContext.Provider value={value}>
      {children}
    </sendBirdPostsContext.Provider>
  );
};

export const useSendBirdPostsProvider = () => useContext(sendBirdPostsContext);

export default SendBirdPostsProvider;
