import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  KeyboardAvoidingView,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImagePickerAsset } from 'expo-image-picker';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';
import {
  BaseMessageSendBirdType,
  GroupChannelSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// providers
import { useKeyboardProvider } from 'providers/KeyboardProvider/KeyboardProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { usePushNotificationProvider } from 'providers/PushNotificationProvider/PushNotificationProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import InputSearch from 'components/InputSearch/InputSearch';
import ShareMediaModal from '../components/ShareMediaModal/ShareMediaModal';
import ConfirmationPhotoModal from '../components/ConfirmationPhotoModal/ConfirmationPhotoModal';
import AvatarMessagesTab from '../components/AvatarMessagesTab/AvatarMessagesTab';
import OpenFileModal from '../components/OpenFileModal/OpenFileModal';

// icons
import {
  IconArrowLeft,
  IconInfo,
  IconPlus,
  IconSend,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// supabase (Backend V2) chat
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import {
  resolveThreadId,
  sendChatMessage,
  subscribeToConversation,
} from 'services/supabase/supabase.chat';

// styles
import styles from './MessagesTabChatGroup.styles';
import colors from 'styles/colors';

import avatarDefault from 'assets/images/avatar-empty.png';
import { useIntercom } from 'providers/IntercomProvider/IntercomProvider';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { toLocalizedDateString, toLocalizedTimeString } from 'utils/formatDate';

type MessagesTabChatGroupProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabChatGroup: FunctionComponent<MessagesTabChatGroupProps> = ({
  navigation,
}) => {
  const { bottom } = useSafeAreaInsets();
  const { showKeyboard } = useKeyboardProvider();
  const { trackIntercom } = useIntercom();
  const { sendPushNotificationToServer } = usePushNotificationProvider();
  const route =
    useRoute<RouteProp<RootMessagesTabParamList, 'messages-tab-chat-group'>>();
  const { sdk } = useSendbirdChat();
  const { userChat, groupChannels, messages, loadMessages } =
    useSendbirdChatProvider();
  const { userDB } = useUserDBProvider();

  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<
    (ImagePickerAsset & { name?: string }) | null
  >(null);
  const [channel, setChannel] = useState<GroupChannelSendBirdType | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showModals, setShowModals] = useState({
    shareMedia: false,
    confirmImage: false,
  });
  const [confirmImage, setConfirmImage] = useState<ImagePickerAsset | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const paddingFooterRef = useRef(
    new Animated.Value(showKeyboard ? 20 : bottom + 10),
  );

  const widthButtonSendRef = useRef(new Animated.Value(0));

  const flatListRef = useRef<FlatList<any>>(null);
  const hasScrollToTarget = useRef(false);

  const messagesChannel = useMemo(
    () => messages[route.params?.channelUrl || ''] || [],
    [messages, route.params?.channelUrl],
  );

  const fetchChannel = async () => {
    if (!route.params?.channelUrl) return;

    // Render immediately from the already-loaded channel list (same pattern
    // as MessagesTabChat); the fresh SDK fetch below replaces it when ready.
    // In mock mode channels are plain objects, so no SDK methods are called
    // on this cached instance.
    const findChannel = groupChannels.find(
      groupChannel => groupChannel.url === route.params?.channelUrl,
    );
    if (findChannel) setChannel(findChannel);

    if (SUPABASE_ENABLED) {
      // Supabase mode: the provider cache is the source of truth (group
      // channels are plain group-shaped objects). No Sendbird SDK fetch or
      // markAsRead.
      return;
    }

    try {
      const fetchedChannel = await sdk.groupChannel.getChannel(
        route.params.channelUrl,
      );
      fetchedChannel.markAsRead();
      setChannel(fetchedChannel);
    } catch (error) {
      if (__DEV__) console.warn('Error fetching channel:', error);
    }
  };

  const animated = () => {
    Animated.timing(paddingFooterRef.current, {
      toValue: showKeyboard ? 20 : bottom + 10,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const animatedButtonSend = () => {
    Animated.timing(widthButtonSendRef.current, {
      toValue: newMessage.length ? 40 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const getThumbnails = async () => {
    if (!route.params?.channelUrl || !messagesChannel.length) return;

    const thumbnailsVideosArray = messagesChannel.filter(
      file => file.type && file.type.includes('video'),
    );
    if (!thumbnailsVideosArray.length) return;
    try {
      const thumbnailsVideos = (
        await Promise.all(
          thumbnailsVideosArray.map(async file => {
            if (!file.url) return null;
            const thumbnails = await VideoThumbnails.getThumbnailAsync(
              file.url,
            );
            return {
              messageId: file.messageId,
              uri: thumbnails.uri,
            };
          }),
        )
      ).reduce<Record<string, string>>((acc, file) => {
        if (!file || !file.messageId) return acc;
        acc[file.messageId] = file.uri;
        return acc;
      }, {});
      setThumbnails(thumbnailsVideos);
    } catch (error) {
      if (__DEV__) console.warn('Error getting thumbnails:', error);
    }
  };

  const renderImageDocument = useCallback(
    (item: BaseMessageSendBirdType) => {
      if (item.messageType !== 'file' || !item.type || !item.url) return null;
      return (
        <TouchableOpacity
          onPress={() =>
            setOpen({
              width: 200,
              height: 200,
              uri: item.url || '',
              mimeType: item.type || '',
              name: item.name,
            })
          }
        >
          <Image
            source={{
              uri: item.type.includes('video')
                ? thumbnails[item.messageId]
                : item.url,
              cache: 'force-cache',
            }}
            style={styles.messageImage}
          />
        </TouchableOpacity>
      );
    },
    [thumbnails],
  );

  const renderItem: ListRenderItem<BaseMessageSendBirdType> = useCallback(
    ({ item, index }) => {
    const isUser = item.sender?.userId === userChat?.userId;
    const isPrevOtherUser =
      item.sender?.userId !== messagesChannel[index - 1]?.sender?.userId;
    const isPrevOtherDay =
      new Date(item.createdAt).getDate() !==
      new Date(messagesChannel[index - 1]?.createdAt).getDate();
    const isNextOtherDay =
      new Date(item.createdAt).getDate() !==
      new Date(messagesChannel[index + 1]?.createdAt).getDate();
    const isMinePrev =
      userChat?.userId === messagesChannel[index - 1]?.sender?.userId;
    const isMineNext =
      userChat?.userId === messagesChannel[index + 1]?.sender?.userId;

    return (
      <>
        <View
          style={[
            styles.messageContainer,
            isUser && styles.messageContainerMine,
            isMinePrev && styles.messageContainerMineNext,
            isPrevOtherUser && styles.messageContainerOtherUser,
            isNextOtherDay && styles.messageContainerOtherDay,
          ]}
        >
          {!isUser && (
            <View
              style={[
                styles.avatarContainer,
                isPrevOtherDay && !isPrevOtherUser && { bottom: 24 },
              ]}
            >
              <Image
                source={
                  item.sender?.profileUrl
                    ? {
                        uri: item.sender?.profileUrl,
                        cache: 'force-cache',
                      }
                    : avatarDefault
                }
                style={styles.avatar}
              />
            </View>
          )}
          <View
            style={[
              styles.message,
              isUser && styles.messageMine,
              !isPrevOtherDay &&
                isMinePrev &&
                isUser && {
                  borderBottomRightRadius: 6,
                },
              !isNextOtherDay &&
                isMineNext &&
                isUser && {
                  borderTopRightRadius: 6,
                },
            ]}
          >
            {renderImageDocument(item)}
            <Text
              style={[styles.messageText, isUser && styles.messageTextMine]}
            >
              {item.message}
            </Text>
            <Text
              style={[styles.messageDate, isUser && styles.messageDateMine]}
            >
              {toLocalizedTimeString(item.createdAt, userDB?.country ?? '', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
              })}
            </Text>
          </View>
        </View>
        {!isUser && (
          <Text style={styles.name}>
            {!isUser ? item.sender?.nickname || item.sender?.userId : ' '}
          </Text>
        )}
        {isNextOtherDay && (
          <Text style={styles.date}>
            {toLocalizedDateString(item.createdAt, userDB?.country ?? '', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        )}
      </>
    );
    },
    [messagesChannel, userChat?.userId, userDB?.country, renderImageDocument],
  );

  const keyExtractor = useCallback(
    (item: BaseMessageSendBirdType) =>
      `message-${item.type}-${item.messageId}`,
    [],
  );

  const sendImage = async (message: string) => {
    // Supabase mode: file attachments are not migrated yet — no-op silently
    // (close the modals so the UI never hangs), same as MessagesTabChat.
    if (SUPABASE_ENABLED) {
      setConfirmImage(null);
      setShowModals(state => ({ ...state, confirmImage: false }));
      return;
    }
    if (!channel || !confirmImage) return;
    setIsSending(true);
    try {
      const findChanel = await sdk.groupChannel.getChannel(channel.url);
      const format = confirmImage.uri.split('.').pop();
      const name = confirmImage.uri.split('/').pop();
      findChanel
        .sendFileMessage({
          message,
          file: {
            name: confirmImage.fileName || name || `image.${format}`,
            type: confirmImage.mimeType || 'image/jpg',
            uri: confirmImage.uri,
          },
        })
        .onSucceeded(() => {
          setIsSending(false);
          const userIdsAll = findChanel.members.map(
            (member: UserSendBirdType) => member.metaData.id,
          );
          const userIds = userIdsAll.filter(
            id => id && id !== userChat?.metaData.id,
          ) as string[];
          if (userIds.length > 0)
            sendPushNotificationToServer({
              content: 'New message in group',
              notifierIds: userIds,
              redirect: route.params?.channelUrl,
            });
        });

      setConfirmImage(null);
      setShowModals(state => ({
        ...state,
        confirmImage: false,
      }));
    } catch (error) {
      if (__DEV__) console.warn('Error sending image:', error);
    }
  };

  const sendMessage = async () => {
    if (!channel || !newMessage.length) return;
    if (SUPABASE_ENABLED) {
      const body = newMessage;
      setNewMessage('');
      try {
        // Group urls resolve to their (auto-created) conversation thread;
        // the provider keys messages by the ORIGINAL group url.
        const threadId = await resolveThreadId(channel.url);
        await sendChatMessage(threadId, body);
        await loadMessages(channel.url);

        const myId = userChat?.metaData?.id || userChat?.userId;
        const userIds = (channel.members || [])
          .map((member: UserSendBirdType) => member.metaData?.id)
          .filter(id => id && id !== myId) as string[];
        if (userIds.length > 0)
          sendPushNotificationToServer({
            content: 'New message in group',
            notifierIds: userIds,
            redirect: route.params?.channelUrl,
          });

        trackIntercom('send_message');
      } catch (error) {
        if (__DEV__) console.warn('Error sending message:', error);
      }
      return;
    }
    try {
      channel
        .sendUserMessage({
          message: newMessage,
        })
        .onSucceeded(() => {
          const userIdsAll = channel.members.map(
            (member: UserSendBirdType) => member.metaData.id,
          );

          const userIds = userIdsAll.filter(
            id => id !== userChat?.metaData.id,
          ) as string[];

          if (userIds.length > 0) {
            sendPushNotificationToServer({
              content: 'New message in group',
              notifierIds: userIds,
              redirect: route.params?.channelUrl,
            });
          }

          trackIntercom('send_message');
        });
    } catch (error) {
      if (__DEV__) console.warn('Error sending message:', error);
    } finally {
      setNewMessage('');
    }
  };

  useEffect(() => {
    animated();
  }, [showKeyboard]);

  useEffect(() => {
    animatedButtonSend();
  }, [newMessage]);

  useEffect(() => {
    getThumbnails();
  }, [messagesChannel]);

  useEffect(() => {
    fetchChannel();
    if (messagesChannel.length === 0 && route.params?.channelUrl)
      loadMessages(route.params?.channelUrl || '');
  }, []);

  useEffect(() => {
    hasScrollToTarget.current = false;
  }, []);

  // Supabase realtime: resolve the group url into its conversation thread
  // once, then refresh the provider thread (keyed by the ORIGINAL group url)
  // on every INSERT. Same in-flight guard as MessagesTabChat — event bursts
  // coalesce into at most one queued refetch instead of stacking a
  // loadMessages round-trip per incoming message.
  useEffect(() => {
    if (!SUPABASE_ENABLED || !route.params?.channelUrl) return;
    const channelUrl = route.params.channelUrl;
    let active = true;
    let inFlight = false;
    let queued = false;
    let unsubscribe: (() => void) | null = null;
    const refresh = async () => {
      if (inFlight) {
        queued = true;
        return;
      }
      inFlight = true;
      try {
        await loadMessages(channelUrl);
      } finally {
        inFlight = false;
        if (queued && active) {
          queued = false;
          refresh();
        }
      }
    };
    (async () => {
      try {
        const threadId = await resolveThreadId(channelUrl);
        if (!active) return;
        unsubscribe = subscribeToConversation(threadId, refresh);
      } catch (error) {
        if (__DEV__) console.warn('Error subscribing to group thread:', error);
      }
    })();
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [route.params?.channelUrl]);

  useEffect(() => {
    const targetMessageId = route.params?.targetMessageId ?? '';
    if (targetMessageId && flatListRef.current && !!messagesChannel.length) {
      const index = messagesChannel.findIndex(
        m => `${m.messageId}` === targetMessageId,
      );
      if (index >= 0) {
        flatListRef.current.scrollToIndex({ index, animated: true });
        hasScrollToTarget.current = true;
      }
    }
  }, [messagesChannel]);

  if (!channel) return null;
  return (
    <>
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboard}
        contentContainerStyle={styles.keyboard}
      >
        <BackgroundScreen type="messages">
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.popToTop()}
                style={styles.buttonHeader}
              >
                <IconArrowLeft
                  width={18}
                  height={18}
                  stroke={colors.black}
                  strokeWidth={1}
                />
              </TouchableOpacity>
              <View style={styles.userContainer}>
                <AvatarMessagesTab
                  imageUrl={channel.coverUrl}
                  width={47}
                  height={47}
                />
                <Text numberOfLines={1} style={styles.userName}>
                  {channel.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate(
                    PATHS_MESSAGES_TAB.messagesTabDetailsGroup,
                    {
                      channelUrl: channel.url,
                    },
                  )
                }
                style={styles.buttonHeader}
              >
                <IconInfo width={24} height={24} />
              </TouchableOpacity>
            </View>
            <FlatList
              ref={flatListRef}
              inverted
              data={messagesChannel}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              style={styles.messages}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
            />
            <Animated.View
              style={[
                styles.footer,
                {
                  paddingBottom: paddingFooterRef.current,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() =>
                  setShowModals(state => ({
                    ...state,
                    shareMedia: true,
                  }))
                }
              >
                <IconPlus
                  width={40}
                  height={40}
                  stroke={colors.neutral[700]}
                  strokeWidth={3.333}
                />
              </TouchableOpacity>
              <InputSearch
                search={newMessage}
                setSearch={setNewMessage}
                placeholder={'Message...'}
                styleContainer={styles.inputContainer}
                styleInput={styles.input}
                isHideIcon
              />
              <Animated.View
                style={{
                  width: widthButtonSendRef.current,
                  overflow: 'hidden',
                }}
              >
                <TouchableOpacity
                  disabled={!newMessage.length}
                  style={[
                    styles.buttonSend,
                    !newMessage.length && {
                      opacity: 0,
                    },
                  ]}
                  onPress={sendMessage}
                >
                  <IconSend width={20} height={20} />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
          {isSending && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={colors.primary[100]} />
            </View>
          )}
        </BackgroundScreen>
      </KeyboardAvoidingView>
      {showModals.shareMedia && (
        <ShareMediaModal
          onClose={() =>
            setShowModals(state => ({
              ...state,
              shareMedia: false,
            }))
          }
          onSubmittedImage={image => {
            setShowModals(state => ({
              ...state,
              shareMedia: false,
              confirmImage: true,
            }));
            setConfirmImage(image);
          }}
        />
      )}
      {showModals.confirmImage && confirmImage && channel && (
        <ConfirmationPhotoModal
          image={confirmImage}
          user={{
            id: channel.url,
            name: channel.name,
          }}
          onClose={() => setConfirmImage(null)}
          onSend={sendImage}
        />
      )}

      {open && <OpenFileModal file={open} onClose={() => setOpen(null)} />}
    </>
  );
};

export default MessagesTabChatGroup;
