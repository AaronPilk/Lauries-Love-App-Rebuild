import { z } from 'zod';
import { MMKV } from 'react-native-mmkv';
import { BaseMessage } from '@sendbird/chat/message';
import { captureException } from '@sentry/react-native';
import { GroupChannelHandler } from '@sendbird/chat/groupChannel';
import {
  SendbirdUIKitContainer,
  useConnection,
  useSendbirdChat,
} from '@sendbird/uikit-react-native';
import React, {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { customShowError } from 'utils/other';
import { appConfig } from 'main/config/app.config';
import { getFileStorageAmplify } from 'utils/amplify-storage';
import { platformServices } from './SendbirdChatProvider.config';
import { MOCK_ENABLED } from 'mocks/mock.config';
import { SUPABASE_ENABLED, SOCIAL_STUBBED } from 'services/supabase/backend.config';
import { getMyGroupChannels } from 'services/supabase/supabase.social';
import {
  getConversationMessages,
  getMyConversations,
  resolveThreadId,
} from 'services/supabase/supabase.chat';
import { supabase, currentUserId } from 'services/supabase/client';
import {
  getMockChatChannels,
  MOCK_CHAT_MESSAGES,
  MOCK_FRIENDS,
  MOCK_USER_CHAT,
} from 'mocks/mock.sendbird';
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import {
  BaseMessageSendBirdType,
  GroupChannelSendBirdType,
  MemberSendBirdType,
  UserSendBirdType,
} from './SendbirdChatProvider.types';

type SendbirdChatContext = {
  userChat: UserSendBirdType | null;
  groupChannels: GroupChannelSendBirdType[];
  messages: Record<string, BaseMessageSendBirdType[]>;
  members: Record<string, UserSendBirdType>;
  friends: UserSendBirdType[];
  blockedUsers: UserSendBirdType[];
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  getChannels: () => Promise<void>;
  loadMessages: (channelUrl: string, limit?: number) => Promise<BaseMessage[]>;
  getMember: (userId: string) => Promise<void>;
  addBlockedUser: (userId: string) => Promise<boolean>;
  removeBlockedUser: (userId: string) => Promise<boolean>;
  getFriends: () => Promise<UserSendBirdType[]>;
};

type SendbirdChatProviderProps = {
  children: React.ReactNode;
};

export type LocalSearchResult = {
  channel: GroupChannelSendBirdType;
  matchedMessages: BaseMessage[];
  nameMatched: boolean;
};

const mmkv = new MMKV();

export const sendbirdChatContext = createContext({} as SendbirdChatContext);

const SendbirdChatProvider: FunctionComponent<SendbirdChatProviderProps> = ({
  children,
}) => {
  const { api } = useApiProvider();
  const { connect, disconnect } = useConnection();
  const { showToast } = useToastProvider();
  const { sdk } = useSendbirdChat();
  const { userDB, updateUserDB } = useUserDBProvider();
  const [userChat, setUserChat] = useState<UserSendBirdType | null>(null);
  const [groupChannels, setGroupChannels] = useState<
    GroupChannelSendBirdType[]
  >([]);
  const [members, setMembers] = useState<Record<string, UserSendBirdType>>({});
  const [friends, setFriends] = useState<UserSendBirdType[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserSendBirdType[]>([]);
  const [limit, setLimit] = useState(40);
  const [messages, setMessages] = useState<
    Record<string, BaseMessageSendBirdType[]>
  >({});
  const userID = useMemo(() => userDB?.cognitoId || null, [userDB?.cognitoId]);

  // Pure fetch (no setState) so getChannels can run it in parallel with the
  // channels queries and commit everything in a single render pass.
  const fetchSupabaseFriends = async (): Promise<UserSendBirdType[]> => {
    try {
      const me = await currentUserId(); // cached session — no auth round-trip
      if (!me) return [];
      const { data } = await supabase
        .from('friendships')
        .select(
          'status, requester:profiles!friendships_requester_id_fkey(id, first_name, display_name), addressee:profiles!friendships_addressee_id_fkey(id, first_name, display_name)',
        )
        .eq('status', 'accepted')
        .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
      return (data ?? []).map((f: any) => {
        const other = f.requester?.id === me ? f.addressee : f.requester;
        return {
          userId: other?.id,
          nickname: other?.display_name || other?.first_name || 'Member',
          plainProfileUrl: '',
          isActive: true,
          metaData: { id: other?.id },
          status: 'accepted',
        } as unknown as UserSendBirdType;
      });
    } catch (error) {
      if (__DEV__) console.warn('supabase getFriends error', error);
      return [];
    }
  };

  const getFriends = async () => {
    if (SUPABASE_ENABLED) {
      const list = await fetchSupabaseFriends();
      setFriends(list);
      return list;
    }
    if (MOCK_ENABLED) {
      setFriends(MOCK_FRIENDS);
      return MOCK_FRIENDS as UserSendBirdType[];
    }
    const friendListQuery = sdk.createFriendListQuery({
      limit: 100,
    });
    try {
      const friends = (await friendListQuery.next()) as UserSendBirdType[];
      const confirmedFriends = (
        await Promise.all(
          friends.map(async friend => {
            try {
              const resultRequest = await api(
                `/users/${friend.metaData.id}/friend-requests`,
                {
                  config: {
                    method: 'GET',
                  },
                  schema: z.array(z.object({ status: z.string() })),
                },
              );
              if (!resultRequest || resultRequest.length === 0) {
                return {
                  ...friend,
                  status: null,
                };
              }

              const { status } = resultRequest[0];
              return {
                ...friend,
                status,
              };
            } catch (error) {
              if (__DEV__)
                console.warn(
                  `Error fetching friend request for ${friend.metaData.id}`,
                  error,
                );
              captureException(error);
              return {
                ...friend,
                status: null,
              };
            }
          }),
        )
      ).filter(friend => friend.status === 'accepted');

      setFriends(confirmedFriends as unknown as UserSendBirdType[]);

      return confirmedFriends as unknown as UserSendBirdType[];
    } catch (error) {
      if (__DEV__) console.warn('Error getting friends', error);
      captureException(error);
      return [];
    }
  };

  const getChannels = async () => {
    if (SUPABASE_ENABLED) {
      try {
        // Friends fetched IN PARALLEL with channels (was a sequential extra
        // round-trip after them), and all three states committed in the same
        // continuation so React 18 batches them into ONE provider update
        // instead of two/three consumer-tree re-renders.
        const [groups, conversations, friendList] = await Promise.all([
          getMyGroupChannels(),
          getMyConversations(userDB?.id),
          fetchSupabaseFriends(),
        ]);
        const channels = [...conversations, ...groups];
        const memberMap = channels.reduce<Record<string, UserSendBirdType>>(
          (acc: any, channel: any) => {
            (channel.members || []).forEach((m: any) => {
              if (m.userId !== userChat?.userId) acc[m.userId] = m;
            });
            return acc;
          },
          {},
        );
        setMembers(memberMap);
        setGroupChannels(channels as any);
        setFriends(friendList);
      } catch (error) {
        if (__DEV__) console.warn('supabase getChannels error', error);
      }
      return;
    }
    if (MOCK_ENABLED) {
      // Fake chat + JOINED group channels (joins during signup register via
      // joinMockGroup); members map keyed by userId.
      const channels = getMockChatChannels();
      const mockMembers = channels.reduce<Record<string, UserSendBirdType>>(
        (acc, channel) => {
          (channel.members || []).forEach((m: UserSendBirdType) => {
            if (m.userId !== MOCK_USER_CHAT.userId) acc[m.userId] = m;
          });
          return acc;
        },
        {},
      );
      setMembers(mockMembers);
      setMessages(MOCK_CHAT_MESSAGES as any);
      setGroupChannels(channels as any);
      setFriends(MOCK_FRIENDS);
      return;
    }
    const query = sdk.groupChannel.createMyGroupChannelListQuery({
      includeEmpty: true,
      limit,
      metadataKey: 'type',
      metadataValues: ['chat', 'group'],
    });

    try {
      const channels = (await query.next()) as GroupChannelSendBirdType[];
      const uniqueChannels = channels.reduce<GroupChannelSendBirdType[]>(
        (acc, channel, index) => {
          if (!channel.cachedMetaData.type) return acc;
          if (channel.cachedMetaData.type === 'delete') return acc;
          if (
            channel.members.length <= 1 &&
            !['post', 'group'].includes(channel.cachedMetaData.type)
          )
            return acc;
          if (acc.find(c => c.url === channel.url)) return acc;

          return [...acc, channel];
        },
        [],
      );
      const deletedChannels = channels.filter(
        channel => !uniqueChannels.find(c => c.url === channel.url),
      );
      if (deletedChannels.length > 0)
        await Promise.all(
          deletedChannels.map(channel => {
            if (!userChat?.userId) return;
            channel.leave();
          }),
        );
      const uniqueChannelsWithImageMembers = (await Promise.all(
        uniqueChannels.map(async channel => {
          const members = await Promise.all(
            channel.members.map(async (member: MemberSendBirdType) => {
              try {
                const allMetaData =
                  member.metaData && member.metaData.userInfo
                    ? JSON.parse(member.metaData.userInfo)
                    : {};

                return {
                  ...member,
                  metaData: {
                    ...member.metaData,
                    ...allMetaData,
                  },
                };
              } catch (error) {
                if (__DEV__) {
                  console.warn('Error getting member', error);
                  console.warn('member error:', member);
                }
                const allMetaData =
                  member.metaData && member.metaData.userInfo
                    ? JSON.parse(`${member.metaData.userInfo}"}`)
                    : {};
                captureException(error);
                return {
                  ...member,
                  metaData: {
                    ...member.metaData,
                    ...allMetaData,
                  },
                };
              }
            }),
          );
          return {
            ...channel,
            url: channel.url,
            name: channel.name,
            members,
            cachedMetaData: channel.cachedMetaData,
          };
        }),
      )) as GroupChannelSendBirdType[];

      const emptyMessages = uniqueChannelsWithImageMembers.reduce<
        Record<string, BaseMessage[]>
      >((acc, channel) => {
        return {
          ...acc,
          [channel.url]: [],
        };
      }, {});

      const uniqueMembers = uniqueChannelsWithImageMembers.reduce<
        UserSendBirdType[]
      >((acc, channel) => {
        const members = channel.members.filter(
          member => member.userId !== userChat?.userId,
        );
        const filteredMembers = members.filter(
          member => !acc.find(m => m.userId === member.userId),
        );
        return [...acc, ...filteredMembers];
      }, []);
      const updateMembers = uniqueMembers.reduce<
        Record<string, UserSendBirdType>
      >((acc, member) => {
        return {
          ...acc,
          [member.userId]: member,
        };
      }, {});

      setMembers(updateMembers);
      setMessages(emptyMessages);
      setGroupChannels(uniqueChannelsWithImageMembers);
      getFriends();
    } catch (error) {
      if (__DEV__) console.warn('getChannels error', error);
      captureException(error);
    }
  };

  const updateAvatarChat = async (
    user: UserSendBirdType,
  ): Promise<UserSendBirdType> => {
    if (!userDB?.profilePicture) {
      const newUser = await sdk.updateCurrentUserInfo({
        profileUrl: '',
      });
      return newUser as UserSendBirdType;
    }
    const type = userDB.profilePicture.split('.').pop();
    const name = userDB.profilePicture.split('/').pop();
    const uri = (await getFileStorageAmplify(userDB.profilePicture))?.href;
    const newUser =
      uri && name
        ? ((await sdk.updateCurrentUserInfo({
            profileImage: { name, uri, type: `image/${type}` },
          })) as UserSendBirdType)
        : user;

    return {
      ...newUser,
      metaData: {
        ...newUser.metaData,
        ...JSON.parse(newUser.metaData.userInfo || '{}'),
      },
    } as UserSendBirdType;
  };

  const updateUser = async (
    user: UserSendBirdType,
  ): Promise<UserSendBirdType> => {
    try {
      const isRemoveAvatar =
        user.plainProfileUrl &&
        user.plainProfileUrl.length > 0 &&
        !userDB?.profilePicture;
      const isNewAvatar =
        userDB?.profilePicture &&
        (!user.metaData?.profileUrlAWS ||
          user.metaData.profileUrlAWS !== userDB.profilePicture ||
          !user.plainProfileUrl ||
          user.plainProfileUrl.length === 0);
      const dataJSONMetaData = {
        ...(userDB?.age && { age: userDB.age }),
        ...(userDB?.gender && {
          gender: userDB.gender,
        }),
        ...(userDB?.country && {
          country: userDB.country,
        }),
        ...(userDB?.city && {
          city: userDB.city,
        }),
        ...(userDB?.state && {
          state: userDB.state,
        }),
        ...(userDB?.email && {
          email: userDB.email,
        }),
      };
      const newMetaData = {
        userInfo: JSON.stringify(dataJSONMetaData),
        ...(userDB?.profilePicture && { profileUrlAWS: userDB.profilePicture }),
        ...(userDB?.id && {
          id: userDB.id,
        }),
        ...(userDB?.cognitoId && {
          cognitoId: userDB.cognitoId,
        }),
      };
      const createMetaData = Object.keys(newMetaData).reduce<
        Record<string, string>
      >((acc, key) => {
        const valueNew = (newMetaData as Record<string, string>)[key];
        const valueOld = (user.metaData as Record<string, string>)[key];

        return !valueOld && valueNew ? { ...acc, [key]: valueNew } : acc;
      }, {});
      const updateMetaData = Object.keys(newMetaData).reduce<
        Record<string, string>
      >((acc, key) => {
        const valueNew = (newMetaData as Record<string, string>)[key];
        const valueOld = (user.metaData as Record<string, string>)[key];
        return valueNew && valueOld && valueOld !== valueNew
          ? { ...acc, [key]: valueNew }
          : acc;
      }, {});
      const deleteMetaData = Object.keys(user.metaData).filter(
        key => !(newMetaData as Record<string, string>)[key],
      );

      if (Object.keys(createMetaData).length > 0)
        try {
          await user.createMetaData(createMetaData);
        } catch (error) {
          if (__DEV__) console.warn('createMetaData error', error);
          captureException(error);
        }
      if (Object.keys(updateMetaData).length > 0)
        try {
          await user.updateMetaData(updateMetaData);
        } catch (error) {
          if (__DEV__) console.warn('updateMetaData error', error);
          captureException(error);
        }
      if (deleteMetaData.length > 0)
        try {
          await Promise.all(
            deleteMetaData.map(key => user.deleteMetaData(key)),
          );
        } catch (error) {
          if (__DEV__) console.warn('deleteMetaData error', error);
          captureException(error);
        }

      const updateAvatar =
        isNewAvatar || isRemoveAvatar ? await updateAvatarChat(user) : user;

      return {
        ...user,
        ...updateAvatar,
        metaData: newMetaData,
      } as UserSendBirdType;
    } catch (error) {
      if (__DEV__) console.warn('updateUser error', error);
      captureException(error);
      return user;
    }
  };

  const loginChat = async () => {
    const nickname = userDB
      ? `${userDB?.firstName}${
          userDB?.lastName && userDB.lastName.length > 0
            ? ` ${userDB?.lastName}`
            : ''
        }`
      : undefined;
    if (!userID) return;

    if (SUPABASE_ENABLED) {
      // Real identity, no Sendbird: chat user mirrors the Supabase profile.
      if (userDB?.id)
        setUserChat({
          userId: userDB.id,
          nickname: userDB.displayName || userDB.firstName || 'Me',
          plainProfileUrl: '',
          isActive: true,
          metaData: { id: userDB.id },
        } as unknown as UserSendBirdType);
      return;
    }
    // Mock mode: no real Sendbird app — skip connect and use the fake chat
    // user so chat/feed/groups screens render with mock data.
    if (MOCK_ENABLED) {
      setUserChat(MOCK_USER_CHAT);
      return;
    }

    try {
      const result =
        userChat && userChat.userId === userID
          ? (sdk.currentUser as UserSendBirdType | null)
          : ((await connect(userID, {
              accessToken: appConfig.DEFAULT_SENDBIRD_SETTINGS.apiToken,
              nickname,
            })) as UserSendBirdType | null);
      if (!result) return;

      const userWithMetaData = await updateUser(result);
      if (userDB?.sendBirdId !== userWithMetaData.userId)
        updateUserDB({ sendBirdId: userWithMetaData.userId });

      setUserChat(userWithMetaData);
    } catch (error) {
      customShowError({
        error: new Error(
          error + 'Error connecting to chat, posts and friends list',
        ),
        showToast,
      });
      captureException(error);
    }
  };

  const loadMessages = async (channelUrl: string, limit = 50) => {
    if (SUPABASE_ENABLED) {
      try {
        // Group urls resolve to their (auto-created) group thread.
        const threadId = await resolveThreadId(channelUrl);
        const msgs = (await getConversationMessages(
          threadId,
          limit,
        )) as unknown as BaseMessage[];
        // Key by the URL the screen asked for so it finds its messages.
        setMessages(prev => ({ ...prev, [channelUrl]: msgs as any }));
        return msgs;
      } catch (error) {
        if (__DEV__) console.log('loadMessages(supabase) empty:', channelUrl);
        setMessages(prev => ({ ...prev, [channelUrl]: [] }));
        return [];
      }
    }
    if (SOCIAL_STUBBED) {
      const mockMsgs = (MOCK_CHAT_MESSAGES[channelUrl] ?? []) as BaseMessage[];
      setMessages(prev => ({ ...prev, [channelUrl]: mockMsgs as any }));
      return mockMsgs;
    }
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);
      const messageQuery = channel.createPreviousMessageListQuery({
        limit,
        reverse: true,
      });
      const messages = await messageQuery.load();
      setMessages(prevMessages => ({
        ...prevMessages,
        [channelUrl]: messages,
      }));
      return messages;
    } catch (error) {
      if (__DEV__) console.warn('loadMessages error', error);
      captureException(error);
      return [];
    }
  };

  const getBlockedUsers = async () => {
    if (SOCIAL_STUBBED) return [];
    if (!userChat) return;

    const query = sdk.createBlockedUserListQuery();

    try {
      const blockedUsers = (await query.next()) as UserSendBirdType[];
      setBlockedUsers(blockedUsers);
      return blockedUsers;
    } catch (error) {
      if (__DEV__) console.warn('getBlockedUsers error', error);
      captureException(error);
      return [];
    }
  };

  const getMember = async (userId: string) => {
    if (SOCIAL_STUBBED) return; // members already seeded by getChannels
    const query = sdk.createApplicationUserListQuery({
      userIdsFilter: [userId],
    });

    const membersResult = (await query.next()) as UserSendBirdType[];
    const filteredMembers = membersResult.filter(
      member => members[member.userId] === undefined,
    );
    if (filteredMembers.length === 0) return;

    const membersWithImage = await Promise.all(
      filteredMembers.map(async member => {
        const allMetaData = JSON.parse(member.metaData.userInfo || '{}');

        return {
          ...member,
          metaData: {
            ...member.metaData,
            ...allMetaData,
          },
        } as UserSendBirdType;
      }),
    );

    const updateMembers = membersWithImage.reduce<
      Record<string, UserSendBirdType>
    >(
      (acc, member) => ({
        ...acc,
        [member.userId]: member,
      }),
      {},
    );

    getBlockedUsers();
    setMembers(prevMembers => ({
      ...prevMembers,
      ...updateMembers,
    }));
  };

  const addBlockedUser = async (userId: string) => {
    if (SOCIAL_STUBBED) return true;
    if (!userChat) return false;

    try {
      await sdk.blockUserWithUserId(userId);
      getBlockedUsers();
      return true;
    } catch (error) {
      if (__DEV__) console.warn('addBlockedUser error', error);
      captureException(error);
      return false;
    }
  };

  const removeBlockedUser = async (userId: string) => {
    if (SOCIAL_STUBBED) return true;
    if (!userChat) return false;

    try {
      await sdk.unblockUserWithUserId(userId);
      await getChannels();
      getBlockedUsers();
      return true;
    } catch (error) {
      if (__DEV__) console.warn('removeBlockedUser error', error);
      captureException(error);
      return false;
    }
  };

  const logoutChat = async () => {
    if (!userChat) return;
    if (SOCIAL_STUBBED) {
      setUserChat(null);
      return;
    }

    try {
      await disconnect();
      await sdk.disconnect();
      setUserChat(null);
    } catch (error) {
      if (__DEV__) console.warn('logoutChat error', error);
      captureException(error);
    }
  };

  useEffect(() => {
    if (userDB?.cognitoId) loginChat();
    else logoutChat();
  }, [userDB]);

  useEffect(() => {
    if (userChat) getChannels();
  }, [userChat?.userId, limit]);

  useEffect(() => {
    if (!userChat || SOCIAL_STUBBED) return;

    const channelHandler = new GroupChannelHandler();
    channelHandler.onChannelChanged = updatedChannel => {
      loadMessages(updatedChannel.url);
    };

    channelHandler.onChannelDeleted = channelUrl => {
      setGroupChannels(prevChannels =>
        prevChannels.filter(c => c.url !== channelUrl),
      );
    };

    sdk.groupChannel.addGroupChannelHandler(
      'GroupChannelHandler',
      channelHandler,
    );

    return () => {
      sdk.groupChannel.removeGroupChannelHandler('GroupChannelHandler');
    };
  }, [userChat]);

  const value = useMemo(
    () => ({
      userChat,
      groupChannels,
      messages,
      members,
      friends,
      blockedUsers,
      limit,
      getChannels,
      setLimit,
      loadMessages,
      getMember,
      addBlockedUser,
      removeBlockedUser,
      getFriends,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      userChat,
      groupChannels,
      messages,
      members,
      friends,
      blockedUsers,
      limit,
      userDB,
      api,
      sdk,
    ],
  );

  return (
    <sendbirdChatContext.Provider value={value}>
      {children}
    </sendbirdChatContext.Provider>
  );
};

export const useSendbirdChatProvider = () => useContext(sendbirdChatContext);

export default ({ children }: { children: React.ReactNode }) => (
  <SendbirdUIKitContainer
    appId={appConfig.DEFAULT_SENDBIRD_SETTINGS.appId}
    chatOptions={{ localCacheStorage: mmkv }}
    platformServices={platformServices}
  >
    <SendbirdChatProvider>{children}</SendbirdChatProvider>
  </SendbirdUIKitContainer>
);
