import { z } from 'zod';
import { captureException } from '@sentry/react-native';
import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { MOCK_ENABLED } from 'mocks/mock.config';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import {
  getFeedPosts,
  getPostComments,
  getRecommendedGroups,
  toggleReactionOn,
} from 'services/supabase/supabase.social';
import {
  MOCK_COMMENTS,
  MOCK_GROUPS,
  MOCK_POSTS,
} from 'mocks/mock.sendbird';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import {
  BaseMessageSendBirdType,
  GroupChannelSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// Structural stand-in for the removed @sendbird/chat GroupChannel type.
type GroupChannel = GroupChannelSendBirdType;

type SendBirdPostsContext = {
  posts: GroupChannel[];
  comments: Record<string, BaseMessageSendBirdType[]>;
  loadingStorage: boolean;
  loadingServer: boolean;
  limit: number;
  setLimit: (limit: number) => void;
  /**
   * Refresh the feed. `before` (supabase mode only) is a created_at ISO
   * cursor: when set, the next page is fetched and APPENDED — pagination
   * plumbing for infinite scroll; nothing passes it yet.
   */
  getPosts: (before?: string) => void;
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

const SendBirdPostsProvider: FunctionComponent<SendBirdPostsProviderProps> = ({
  children,
}) => {
  const { api } = useApiProvider();
  const { userChat } = useSendbirdChatProvider();
  const [posts, setPosts] = useState<GroupChannel[]>([]);
  const [comments, setComments] = useState<
    Record<string, BaseMessageSendBirdType[]>
  >({});
  const [loadingServer, setLoadingServer] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [limit, setLimit] = useState(100);
  const { userDB } = useUserDBProvider();

  const getFilteringUserInfo = async () => {
    if (SUPABASE_ENABLED) {
      const roleName = userDB?.role?.description?.toLowerCase() || '';
      const diagNames = (userDB?.diagnosisTypes || []).map(
        (d: any) => d?.description?.toLowerCase() || '',
      );
      try {
        return (await getRecommendedGroups([roleName, ...diagNames])) as any;
      } catch (error) {
        if (__DEV__) console.warn('getRecommendedGroups error', error);
        return [];
      }
    }
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
  };

  const getPosts = async (before?: string) => {
    if (SUPABASE_ENABLED) {
      try {
        setLoadingServer(true);
        const feed = await getFeedPosts(50, before);
        // Cursor page -> append (dedup by url); fresh load -> replace.
        setPosts(prev =>
          before
            ? ([
                ...prev,
                ...(feed as any[]).filter(
                  p => !prev.some((e: any) => e.url === p.url),
                ),
              ] as any)
            : (feed as any),
        );
      } catch (error) {
        if (__DEV__) console.warn('getFeedPosts error', error);
      } finally {
        setLoadingStorage(false);
        setLoadingServer(false);
      }
      return;
    }
    if (MOCK_ENABLED) {
      setPosts(MOCK_POSTS as any);
      setComments(MOCK_COMMENTS as any);
      setLoadingStorage(false);
      setLoadingServer(false);
      return;
    }
  };

  const toggleReaction = async (
    postUrl: string,
    messagePost: BaseMessageSendBirdType,
  ) => {
    if (SUPABASE_ENABLED) {
      try {
        await toggleReactionOn('comment', String(messagePost.messageId));
        await getPost(postUrl); // refresh reactions
      } catch (error) {
        if (__DEV__) console.warn('toggle comment reaction error', error);
      }
      return;
    }
    if (MOCK_ENABLED) return; // demo: reactions are local-only in components
  };

  const getPost = async (channelUrl: string) => {
    if (SUPABASE_ENABLED) {
      try {
        const msgs = (await getPostComments(
          channelUrl,
        )) as BaseMessageSendBirdType[];
        setComments(prev => ({ ...prev, [channelUrl]: msgs }));
        return msgs;
      } catch (error) {
        if (__DEV__) console.warn('getPostComments error', error);
        return [];
      }
    }
    if (MOCK_ENABLED) {
      const mockMessages = (MOCK_COMMENTS[channelUrl] ??
        []) as BaseMessageSendBirdType[];
      setComments({ ...comments, [channelUrl]: mockMessages });
      return mockMessages;
    }
    return [];
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
    if (SUPABASE_ENABLED) {
      getPosts();
      return;
    }
    if (MOCK_ENABLED) {
      // Mock mode: inject fake posts/comments directly, skip storage + server.
      setPosts(MOCK_POSTS as any);
      setComments(MOCK_COMMENTS as any);
      setLoadingStorage(false);
      setLoadingServer(false);
      return;
    }
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
      api,
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
