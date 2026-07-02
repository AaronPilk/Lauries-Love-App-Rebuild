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
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ImagePickerAsset } from 'expo-image-picker';
import { DocumentPickerAsset } from 'expo-document-picker';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';
import {
  BaseMessageSendBirdType,
  GroupChannelSendBirdType,
  MemberSendBirdType,
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
import ConfirmationPdfModal from '../components/ConfirmationPdfModal/ConfirmationPdfModal';
import AvatarMessagesTab from '../components/AvatarMessagesTab/AvatarMessagesTab';
import PhotoMediaMessagesTab from '../components/PhotoMediaMessagesTab/PhotoMediaMessagesTab';
import OpenFileModal from '../components/OpenFileModal/OpenFileModal';

// images
import defaultAvatar from 'assets/images/avatar-empty.png';

// icons
import {
  IconArrowLeft,
  IconInfo,
  IconPlus,
  IconSend,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// styles
import styles from './MessagesTabChat.styles';
import colors from 'styles/colors';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { toLocalizedDateString, toLocalizedTimeString } from 'utils/formatDate';

type MessagesTabChatProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabChat: FunctionComponent<MessagesTabChatProps> = ({
  navigation,
}) => {
  const isFocused = useIsFocused();
  const { bottom } = useSafeAreaInsets();
  const { showKeyboard } = useKeyboardProvider();
  const { sdk } = useSendbirdChat();
  const {
    userChat,
    groupChannels,
    messages,
    loadMessages,
    setLimit,
    getFriends,
  } = useSendbirdChatProvider();
  const { sendPushNotificationToServer } = usePushNotificationProvider();
  const { userDB } = useUserDBProvider();
  const route =
    useRoute<RouteProp<RootMessagesTabParamList, 'messages-tab-chat'>>();
  const [channel, setChannel] = useState<GroupChannelSendBirdType | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showModals, setShowModals] = useState({
    shareMedia: false,
    confirmImage: false,
    confirmDocument: false,
  });
  const [confirm, setConfirm] = useState<{
    image: ImagePickerAsset | null;
    document: DocumentPickerAsset | null;
  }>({ image: null, document: null });
  const [open, setOpen] = useState<{
    image: (ImagePickerAsset & { name?: string }) | null;
    document: DocumentPickerAsset | null;
  }>({ image: null, document: null });
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const paddingFooterRef = useRef(
    new Animated.Value(showKeyboard ? 20 : bottom + 10),
  );
  const [isSending, setIsSending] = useState(false);
  const widthButtonSendRef = useRef(new Animated.Value(0));

  const flatListRef = useRef<FlatList<any>>(null);
  const hasScrollToTarget = useRef(false);

  const messagesChannel = useMemo(
    () => messages[route.params?.channelUrl || ''] || [],
    [messages, route.params?.channelUrl],
  );

  const friend: MemberSendBirdType | null = useMemo(
    () =>
      channel?.members.find(
        member => member.userId !== sdk.currentUser?.userId,
      ) || null,
    [channel, sdk.currentUser?.userId],
  );

  const fetchChannel = async () => {
    if (!route.params?.channelUrl) return;

    const findChannel = groupChannels.find(
      channel => channel.url === route.params?.channelUrl,
    );
    if (findChannel) setChannel(findChannel);

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

  const sendImage = async (message: string) => {
    if (!channel || !confirm.image) return;
    setIsSending(true);
    try {
      const findChanel = await sdk.groupChannel.getChannel(channel.url);
      const format = confirm.image.uri.split('.').pop();
      const name = confirm.image.uri.split('/').pop();
      findChanel
        .sendFileMessage({
          message,
          file: {
            name: confirm.image.fileName || name || `image.${format}`,
            type: confirm.image.mimeType || 'image/jpg',
            uri: confirm.image.uri,
          },
        })
        .onSucceeded(() => {
          setIsSending(false);
          if (friend?.metaData?.id)
            sendPushNotificationToServer({
              content: '📷 Photo',
              notifierIds: [friend?.metaData?.id || ''],
              redirect: route.params?.channelUrl,
            });
        });

      setConfirm(state => ({
        ...state,
        image: null,
      }));
      setShowModals(state => ({
        ...state,
        confirmImage: false,
      }));
    } catch (error) {
      if (__DEV__) console.warn('Error sending image:', error);
    }
  };

  const sendDocument = async (message: string) => {
    if (!channel || !confirm.document) return;
    setIsSending(true);
    try {
      const findChanel = await sdk.groupChannel.getChannel(channel.url);
      findChanel
        .sendFileMessage({
          message,
          file: {
            name: confirm.document.name,
            type: confirm.document.mimeType || 'application/pdf',
            uri: confirm.document.uri,
          },
        })
        .onSucceeded(() => {
          setIsSending(false);
          if (friend?.metaData?.id)
            sendPushNotificationToServer({
              content: '📄 Document',
              notifierIds: [friend?.metaData?.id || ''],
              redirect: route.params?.channelUrl,
            });
        });

      setConfirm(state => ({
        ...state,
        document: null,
      }));
      setShowModals(state => ({
        ...state,
        confirmDocument: false,
      }));
    } catch (error) {
      if (__DEV__) console.warn('Error sending document:', error);
    }
  };

  const sendMessage = async () => {
    if (!channel || !newMessage.length) return;
    try {
      channel
        .sendUserMessage({
          message: newMessage,
        })
        .onSucceeded(() => {
          if (friend?.metaData?.id)
            sendPushNotificationToServer({
              content: newMessage,
              notifierIds: [friend?.metaData?.id || ''],
              redirect: route.params?.channelUrl,
            });
        });
    } catch (error) {
      if (__DEV__) console.warn('Error sending message:', error);
    } finally {
      setNewMessage('');
    }
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

  const renderImageDocument = useCallback((item: BaseMessageSendBirdType) => {
    if (item.messageType !== 'file' || !item.type || !item.url) return null;
    if (item.type.includes('image') || item.type.includes('video'))
      return (
        <PhotoMediaMessagesTab
          messageImage={
            {
              ...item,
              url: item.type.includes('video')
                ? thumbnails[item.messageId]
                : item.url,
            } as BaseMessageSendBirdType
          }
          setOpen={() => {
            setOpen({
              image: {
                width: 200,
                height: 200,
                uri: item.url || '',
                mimeType: item.type || '',
                name: item.name || '',
              },
              document: null,
            });
          }}
          isLoading={!thumbnails[item.messageId] && item.type.includes('video')}
          styleContainer={styles.messageImage}
        />
      );

    return (
      <TouchableOpacity
        onPress={() =>
          setOpen(state => ({
            ...state,
            document: {
              uri: item.url || '',
              mimeType: item.type || '',
              name: item.name || '',
            },
          }))
        }
      >
        <View style={styles.documentContainer}>
          <Text style={styles.documentName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [thumbnails]);

  const renderItem: ListRenderItem<BaseMessageSendBirdType> = useCallback(
    ({ item, index }) => {
    const isUser = item.sender?.userId === userChat?.userId;
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
            isNextOtherDay && styles.messageContainerOtherDay,
          ]}
        >
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
            <View>
              {renderImageDocument(item)}
              <Text
                style={[styles.messageText, isUser && styles.messageTextMine]}
              >
                {item.message}
              </Text>
            </View>
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
      `message-${item.messageId}-${item.sender?.userId}`,
    [],
  );

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
    if (!isFocused) return;

    fetchChannel();
    getFriends();
    if (messagesChannel.length === 0 && route.params?.channelUrl)
      loadMessages(route.params?.channelUrl || '');
  }, [isFocused]);

  useEffect(() => {
    hasScrollToTarget.current = false;
  }, []);

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
                onPress={() => {
                  setLimit(state => state + 1);
                  navigation.goBack();
                }}
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
                  imageUrl={
                    friend?.plainProfileUrl || defaultAvatar || channel.coverUrl
                  }
                  width={47}
                  height={47}
                />
                <Text numberOfLines={1} style={styles.userName}>
                  {friend?.nickname || friend?.userId || channel.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  friend?.userId &&
                  navigation.navigate(PATHS_MESSAGES_TAB.messagesTabDetails, {
                    cognitoId: friend.metaData.cognitoId || '',
                    userId: friend.metaData.id || '',
                    channelUrl: channel.url,
                  })
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
                disabled={friend?.isBlockedByMe || friend?.isBlockingMe}
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
                placeholder={
                  friend?.isBlockedByMe
                    ? `You have blocked ${friend?.nickname}`
                    : friend?.isBlockingMe
                    ? `You are blocked by ${friend?.nickname}`
                    : 'Message...'
                }
                styleContainer={styles.inputContainer}
                styleInput={styles.input}
                isHideIcon
                isDisabled={friend?.isBlockedByMe || friend?.isBlockingMe}
                multiline
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
            setConfirm(state => ({
              ...state,
              image,
            }));
          }}
          onSubmittedDocument={document => {
            setShowModals(state => ({
              ...state,
              shareMedia: false,
              confirmDocument: true,
            }));
            setConfirm(state => ({
              ...state,
              document,
            }));
          }}
        />
      )}
      {showModals.confirmImage && confirm.image && friend && (
        <ConfirmationPhotoModal
          image={confirm.image}
          user={{
            id: friend.userId,
            name: friend.nickname,
          }}
          onClose={() => setConfirm({ image: null, document: null })}
          onSend={sendImage}
        />
      )}
      {showModals.confirmDocument && confirm.document && friend && (
        <ConfirmationPdfModal
          document={confirm.document}
          user={{
            id: friend?.userId || '',
            name: friend?.nickname || '',
          }}
          onClose={() => setConfirm({ image: null, document: null })}
          onSend={sendDocument}
        />
      )}
      {open.image && (
        <OpenFileModal
          file={open.image}
          onClose={() => setOpen({ image: null, document: null })}
        />
      )}
      {open.document && (
        <OpenFileModal
          file={open.document}
          onClose={() => setOpen({ image: null, document: null })}
        />
      )}
    </>
  );
};

export default MessagesTabChat;
