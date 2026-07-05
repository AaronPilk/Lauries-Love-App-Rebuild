import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSendbirdChat } from 'services/legacy-chat.shim';
import { useIsFocused } from '@react-navigation/native';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';
import { UserSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// providers
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';
import InputSearch from 'components/InputSearch/InputSearch';
import ListFriendsMessageTab from '../components/ListFriendsMessageTab/ListFriendsMessageTab';

// icons
import {
  IconArrowRight,
  IconEmptyChats,
  IconUsersGroup,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// styles
import styles from './MessagesTabCreateChat.styles';
import colors from 'styles/colors';
import { useApiProvider } from 'providers/ApiProvider/ApiProvider';
import { z } from 'zod';

// supabase (Backend V2) chat
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { findOrCreateDirectConversation } from 'services/supabase/supabase.chat';

type MessagesTabCreateChatProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

type FriendWithStatus = UserSendBirdType & {
  status?: 'pending' | 'accepted' | undefined;
};

const MessagesTabCreateChat: FunctionComponent<MessagesTabCreateChatProps> = ({
  navigation,
}) => {
  const { api } = useApiProvider();
  const isFocused = useIsFocused();
  const { sdk } = useSendbirdChat();
  const { groupChannels, getChannels, getFriends: getFriendsProvider } =
    useSendbirdChatProvider();
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [limit, setLimit] = useState(100);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnd, setIsEnd] = useState(true);

  const getFriendStatus = async (friendId: string) => {
    try {
      const result = await api(`/users/${friendId}/friend-requests`, {
        config: {
          method: 'GET',
        },
        schema: z.array(z.object({ status: z.string() })),
      });
      if (!result || result.length === 0) {
        return;
      }

      const { status } = result[0];

      return status as 'pending' | 'accepted';
    } catch (error) {
      if (__DEV__) console.warn('Error getting requested friend', error);
    }
  };

  const getFriends = async () => {
    setIsLoading(true);
    if (SUPABASE_ENABLED) {
      // Supabase mode: accepted friends come from the provider (friendships
      // table) — the Sendbird friend-list query and per-friend status calls
      // don't apply.
      try {
        const list = await getFriendsProvider();
        setFriends(list as FriendWithStatus[]);
      } catch (error) {
        if (__DEV__) console.warn('Error getting friends', error);
      } finally {
        setIsEnd(false);
        setIsLoading(false);
      }
      return;
    }
    const friendListQuery = sdk.createFriendListQuery({
      limit,
    });
    try {
      const resultFriends =
        (await friendListQuery.next()) as UserSendBirdType[];

      const friendsWithStatus = await Promise.all(
        resultFriends.map(async friend => {
          const friendId = friend?.metaData?.id as string;

          const status = await getFriendStatus(friendId);
          return { ...friend, status } as FriendWithStatus;
        }),
      );

      setFriends(friendsWithStatus);
    } catch (error) {
      if (__DEV__) console.warn('Error getting friends', error);
    } finally {
      setIsEnd(false);
      setIsLoading(false);
    }
  };

  const onSelectFriend = async (userId: string) => {
    if (SUPABASE_ENABLED) {
      // Supabase mode: userId IS the profile id; the conversation id plays
      // the role of channel.url.
      try {
        const conversationId = await findOrCreateDirectConversation(userId);
        getChannels();
        return navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChat, {
          channelUrl: conversationId,
          userId,
        });
      } catch (error) {
        if (__DEV__) console.warn('Error creating channel', error);
      }
      return;
    }
    try {
      const findChannel = groupChannels.find(
        channel =>
          channel.members.length === 2 &&
          channel.members.find(member => member.userId === userId),
      );
      if (findChannel)
        return navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChat, {
          channelUrl: findChannel.url,
          userId,
        });

      const channel = await sdk.groupChannel.createChannelWithUserIds(
        [userId],
        true,
      );
      await channel.createMetaData({
        type: 'chat',
      });
      getChannels();
      return navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChat, {
        channelUrl: channel.url,
        userId,
      });
    } catch (error) {
      if (__DEV__) console.warn('Error creating channel', error);
    }
  };

  // Search filtering happens locally: fetching friends (plus one status
  // request per friend) on every keystroke is unnecessary network work.
  const filteredFriends = useMemo(
    () =>
      friends.filter(
        friend =>
          friend.nickname.toLowerCase().includes(search.toLowerCase()) &&
          friend.status !== 'pending',
      ),
    [friends, search],
  );

  const handleScrollDown = ({
    nativeEvent: { layoutMeasurement, contentOffset, contentSize },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const paddingToBottom = 20;
    const isEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (filteredFriends.length >= limit && isEnd) setLimit(limit + 20);
  };

  useEffect(() => {
    if (!isFocused) return;
    getFriends();
  }, [limit, isFocused]);

  return (
    <BackgroundScreen type="messages">
      <HeaderTabScreen
        title="New Chat"
        onPressLeft={() => navigation.goBack()}
      />
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <InputSearch
              search={search}
              setSearch={setSearch}
              placeholder={'Search friend'}
              styleContainer={styles.inputSearchContainer}
              styleInput={styles.inputSearch}
              iconProps={{ width: 24, height: 24, strokeWidth: 2.1 }}
              placeholderTextColor={colors.neutral[600]}
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
                style={styles.cancel}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() =>
              navigation.navigate(PATHS_MESSAGES_TAB.messagesTabCreateGroup)
            }
          >
            <View style={styles.iconCreateButton}>
              <IconUsersGroup width={24} height={24} />
            </View>
            <Text style={styles.titleCreateButton}>Create a group chat</Text>
            <IconArrowRight
              width={18}
              height={18}
              stroke={colors.primary[600]}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
        {isLoading && isEnd ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size={'large'} color={colors.primary[600]} />
          </View>
        ) : filteredFriends.length > 0 || search.length > 0 ? (
          <ListFriendsMessageTab
            title={'Suggested friends to message'}
            titleEmptyList={search.length > 0 ? 'No friends found' : null}
            friends={filteredFriends}
            onSelect={selectUser => onSelectFriend(selectUser.userId)}
            handleScrollDown={handleScrollDown}
          />
        ) : (
          <View style={styles.emptyListContainer}>
            <IconEmptyChats width={89} height={89} />
            <View style={styles.titlesEmptyList}>
              <Text style={styles.titleEmptyList}>No results found</Text>
              <Text style={styles.subtitleEmptyList}>
                Try searching for a friend or users
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </BackgroundScreen>
  );
};

export default MessagesTabCreateChat;
