import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';
import {
  GroupChannelSendBirdType,
  MemberSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { BaseMessage } from '@sendbird/chat/message';

// providers
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabMain from 'components/HeaderTabMain/HeaderTabMain';
import InputSearch from 'components/InputSearch/InputSearch';
import AvatarMessagesTab from '../components/AvatarMessagesTab/AvatarMessagesTab';

// images
import defaultAvatar from 'assets/images/avatar-empty.png';

// icons
import {
  IconChat,
  IconEdit,
  IconMessagesNotGroup,
  IconUsers,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// styles
import styles from './MessagesTabMain.styles';
import colors from 'styles/colors';
import { toLocalizedTimeString } from 'utils/formatDate';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useDebouncedValue } from 'utils/useDebouncedValue';
import LoadingLine from 'components/LoadingLine/LoadingLine';
import { useSendbirdChat } from '@sendbird/uikit-react-native';

type MessagesTabMainProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const HighlightedText: FunctionComponent<{
  text: string;
  highlight: string;
}> = ({ text, highlight }) => {
  if (!highlight) return <Text>{text}</Text>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <Text>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Text key={i} style={styles.highlight}>
            {part}
          </Text>
        ) : (
          <Text key={i}>{part}</Text>
        ),
      )}
    </Text>
  );
};

type LocalSearchResult = {
  channel: GroupChannelSendBirdType;
  matchedMessages: BaseMessage[];
  nameMatched: boolean;
};

const MessagesTabMain: FunctionComponent<MessagesTabMainProps> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
  const { sdk } = useSendbirdChat();
  const { userChat, groupChannels, limit, setLimit, getChannels } =
    useSendbirdChatProvider();
  const { userDB } = useUserDBProvider();
  const [search, setSearch] = useState('');
  const [filterChannels, setFilterChannel] = useState<LocalSearchResult[]>([]);
  const [showResultList, setShowResultList] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 300);
  const searchIdRef = useRef(0);

  const searchMatchedGroups = async (
    channels: GroupChannelSendBirdType[],
    keyword: string,
    maxMessagesPerChannel = 30,
  ): Promise<LocalSearchResult[]> => {
    if (!keyword.trim()) return [];

    setIsSearching(true);
    const lowerKeyword = keyword.toLowerCase();
    const results: LocalSearchResult[] = [];

    for (const channel of channels) {
      let matchedMessages: BaseMessage[] = [];

      // 1. match name
      const isGroup =
        channel.cachedMetaData?.type === 'group' ||
        channel.cachedMetaData?.type === 'recommendation';
      const friend = channel.members.find(
        member => member.userId !== userChat?.userId,
      ) as MemberSendBirdType | undefined;
      const channelName = isGroup ? channel.name : friend?.nickname || '';

      if (
        channelName.toLowerCase().includes(lowerKeyword) &&
        (channel.cachedMetaData?.type === 'group' || channel.lastMessage)
      ) {
        results.push({
          channel,
          matchedMessages: [],
          nameMatched: true,
        });
        continue;
      }
      // 2. get latest message
      try {
        const fullChannel = await sdk.groupChannel.getChannel(channel.url);
        const messageQuery = fullChannel.createPreviousMessageListQuery?.({
          limit: maxMessagesPerChannel,
          reverse: true,
        });
        if (messageQuery) {
          const messages = await messageQuery.load();
          matchedMessages = messages.filter(msg => {
            if (msg.messageType === 'user') {
              return msg.message?.toLowerCase().includes(lowerKeyword);
            }
            // if (msg.messageType === 'file') {
            //   return msg.name?.toLowerCase().includes(lowerKeyword);
            // }
            return false;
          });
        }
      } catch (e) {
        console.warn('Failed to fetch messages for channel', channel.url, e);
      }

      if (matchedMessages.length > 0) {
        results.push({
          channel,
          matchedMessages,
          nameMatched: false,
        });
      }
    }

    setIsSearching(false);
    return results;
  };

  useEffect(() => {
    const currentSearchId = ++searchIdRef.current;

    if (!debouncedSearch.trim()) {
      setFilterChannel(
        groupChannels.map(channel => ({
          channel,
          matchedMessages: [],
          nameMatched: false,
        })),
      );
      setShowResultList(false);
      return;
    }
    searchMatchedGroups(groupChannels, debouncedSearch).then(result => {
      if (currentSearchId === searchIdRef.current) {
        setFilterChannel(result);
        setShowResultList(!!result.length);
      }
    });
  }, [groupChannels, debouncedSearch]);

  const onPressTo = (
    channelUrl: string,
    isGroup = false,
    targetMessageId?: string,
  ) => {
    const params = { channelUrl };
    if (targetMessageId) {
      Object.assign(params, { targetMessageId });
    }

    if (isGroup)
      navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChatGroup, params);
    else navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChat, params);
  };

  const handleScrollDown = ({
    nativeEvent: { layoutMeasurement, contentOffset, contentSize },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const paddingToBottom = 20;
    const isEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (groupChannels.length >= limit && isEnd) setLimit(limit + 20);
  };

  useEffect(() => {
    if (isFocused) getChannels();
  }, [isFocused]);

  if (!userChat) return null;

  return (
    <BackgroundScreen type="messages">
      <HeaderTabMain
        title="Chat"
        customRightElement={
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() =>
              navigation.navigate(PATHS_MESSAGES_TAB.messagesTabJoinGroup)
            }
          >
            <IconUsers width={17} height={11} />
            <Text style={styles.titleJoinButton}>Join group</Text>
          </TouchableOpacity>
        }
        containerStyle={styles.header}
      />
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.searchContainer}>
          <InputSearch
            search={search}
            setSearch={setSearch}
            placeholder={'Search conversation'}
            styleContainer={styles.inputSearchContainer}
            styleInput={styles.inputSearch}
            iconProps={{ width: 24, height: 24, strokeWidth: 2.1 }}
            placeholderTextColor={colors.neutral[600]}
            onClear={() => setSearch('')}
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
        {isSearching ? <LoadingLine /> : <View style={styles.loadingLine} />}
        {groupChannels.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            onScroll={handleScrollDown}
          >
            {showResultList && (
              <Text style={styles.infoContainerTitle}>Results</Text>
            )}
            {filterChannels.length > 0 ? (
              filterChannels.map((result, index) => {
                const item = result.channel;
                const isGroup =
                  item.cachedMetaData?.type === 'group' ||
                  item.cachedMetaData?.type === 'recommendation';

                // get message from result
                const infoMessage = !!result.matchedMessages?.length
                  ? result.matchedMessages[0]
                  : item.lastMessage;
                const lastMessage =
                  infoMessage?.messageType === 'file'
                    ? 'File'
                    : infoMessage?.message || '';
                const isHighlight =
                  !!result.matchedMessages?.length && !!search;

                const friend = item.members.find(
                  member => member.userId !== userChat.userId,
                ) as MemberSendBirdType | undefined;
                const imageUrl = isGroup
                  ? item.coverUrl
                  : friend?.plainProfileUrl || defaultAvatar || item.coverUrl;
                const name = isGroup
                  ? item.name
                  : friend?.nickname || 'No name';

                const matchMessageId = `${
                  result.matchedMessages[0]?.messageId ?? ''
                }`;

                return (
                  <TouchableOpacity
                    key={`chat-${item.url}`}
                    style={styles.itemContainer}
                    onPress={() => onPressTo(item.url, isGroup, matchMessageId)}
                  >
                    <AvatarMessagesTab imageUrl={imageUrl} />
                    <View
                      style={[
                        styles.infoContainer,
                        index === 0 && !showResultList && styles.infoTopBorder,
                      ]}
                    >
                      <View style={styles.titlesItem}>
                        <Text style={styles.titleItem}>{name}</Text>
                        <Text numberOfLines={1} style={styles.subtitleItem}>
                          {isHighlight ? (
                            <HighlightedText
                              text={lastMessage}
                              highlight={search.trim()}
                            />
                          ) : (
                            lastMessage
                          )}
                        </Text>
                      </View>
                      <View style={styles.dateContainer}>
                        <Text
                          style={[
                            styles.dateItem,
                            item.unreadMessageCount > 0 && styles.dataItemIsNew,
                          ]}
                        >
                          {infoMessage?.createdAt
                            ? toLocalizedTimeString(
                                infoMessage?.createdAt || 0,
                                userDB?.country ?? '',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )
                            : ''}
                        </Text>
                        <View
                          style={[
                            styles.newMessagesContainer,
                            item.unreadMessageCount === 0 && {
                              backgroundColor: 'transparent',
                            },
                          ]}
                        >
                          <Text style={styles.newMessages}>
                            {item.unreadMessageCount > 0
                              ? item.unreadMessageCount
                              : ''}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyListContainer,
                  styles.emptyListContainerNoResults,
                ]}
              >
                <IconMessagesNotGroup width={84} height={84} />
                <View style={styles.titlesEmptyList}>
                  <Text style={styles.titleEmptyList}>No Results</Text>
                  <Text style={styles.subtitleEmptyList}>
                    We couldn’t find anything for
                  </Text>
                  <Text style={styles.subtitleEmptyListBold}>
                    ”{search.trim()}”
                  </Text>
                  <Text style={styles.subtitleEmptyList}>
                    Try a different search.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        ) : (
          <View style={styles.emptyListContainer}>
            <IconChat width={84} height={84} />
            <View style={styles.titlesEmptyList}>
              <Text style={styles.titleEmptyList}>It's quiet here</Text>
              <Text style={styles.subtitleEmptyList}>
                Start chatting with friends or join a group{' '}
              </Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={styles.buttonNewChat}
          onPress={() =>
            navigation.navigate(PATHS_MESSAGES_TAB.messagesTabCreateChat)
          }
        >
          <IconEdit width={20} height={20} />
          <Text style={styles.titleButtonNewChat}>New chat</Text>
        </TouchableOpacity>
      </ScrollView>
    </BackgroundScreen>
  );
};

export default MessagesTabMain;
