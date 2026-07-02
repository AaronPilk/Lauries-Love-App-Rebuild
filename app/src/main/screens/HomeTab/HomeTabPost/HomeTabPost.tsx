import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  InteractionManager,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { Sender } from '@sendbird/chat/message';

// types
import { RootHomeTabParamList } from 'main/navigators/HomeTabStacks/HomeTabStacks.types';
import {
  BaseMessageSendBirdType,
  MetaDataUserSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { useKeyboardProvider } from 'providers/KeyboardProvider/KeyboardProvider';
import { useGetUsersReq } from 'presentation/services/react-query/user.query';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import AvatarMessagesTab from 'main/screens/MessagesTab/components/AvatarMessagesTab/AvatarMessagesTab';
import LoadingLine from 'components/LoadingLine/LoadingLine';

// utils
import { customShowError } from 'utils/other';

// images
import defaultAvatar from 'assets/images/avatar-empty.png';

// icons
import {
  IconArrowLeft,
  IconSend,
  IconTabHeart,
} from 'assets/icons-auto/components';

// constants
import { DEFAULT_COMMENT_POST } from './HomeTabPost.constants';

// styles
import styles from './HomeTabPost.styles';
import colors from 'styles/colors';
import { User } from 'main/screens/Connect/Map/map.screen';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { toLocalizedDateString } from 'utils/formatDate';
import { PostImageWithLoading } from '../components/PostImageWithLoading/PostImageWithLoading';
import { getOriginalImageUrl } from 'utils/imageUrlUtils';

// backend v2
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { sendComment, toggleReactionOn } from 'services/supabase/supabase.social';

type HomeTabPostProps = {
  navigation: NativeStackNavigationProp<RootHomeTabParamList>;
};

const HomeTabPost: FunctionComponent<HomeTabPostProps> = ({ navigation }) => {
  const route = useRoute<RouteProp<RootHomeTabParamList, 'home-tab-post'>>();
  const navigationRedirect = useNavigation();
  const { data: usersData } = useGetUsersReq();
  const { showKeyboard } = useKeyboardProvider();
  const { userDB } = useUserDBProvider();
  const {
    comments: allComments,
    loadingServer,
    toggleReaction,
    getPost,
    getPosts,
    posts,
    sendNotification,
  } = useSendBirdPostsProvider();
  const { sdk } = useSendbirdChat();
  const { showToast } = useToastProvider();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [postText, setPostText] = useState('');
  const [comments, setComments] = useState<BaseMessageSendBirdType[]>([]);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const [postImage, setPostImage] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const widthButtonSendRef = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const oldComments = useMemo(
    () => allComments[route.params?.channelUrl || ''] || [],
    [allComments, route.params?.channelUrl],
  );
  const isNewComment = useMemo(
    () =>
      oldComments.some(
        comment =>
          !comments.some(
            oldComment => oldComment.messageId === comment.messageId,
          ),
      ),
    [comments, oldComments],
  );

  const isActionButtonActive = useMemo(() => postText.length > 0, [postText]);

  const userID = useMemo(
    () => sdk.currentUser?.userId,
    [sdk.currentUser?.userId],
  );

  const [userPost, ...restComments] = useMemo(() => comments, [comments]);

  const isReactionUserPost = useMemo(
    () => reactions[userPost?.messageId]?.some(reaction => reaction === userID),
    [reactions, userPost?.messageId],
  );

  const toggleAnimation = () => {
    Animated.timing(widthButtonSendRef, {
      toValue: postText.length > 0 ? 48 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const lastMeasuredImageUrlRef = useRef<string | null>(null);

  async function getChannel() {
    if (!posts || !posts.length || !userPost) return;

    const userDetailPost = posts.find(post => post.url === userPost.channelUrl);
    const postData = JSON.parse(userDetailPost?.data || '{}');

    const likesArray = postData.likes;
    const postImageUrl = postData.image_md ?? '';
    // Only measure when the URL actually changes — Image.getSize on every
    // focus/posts update triggers redundant network work
    if (postImageUrl && lastMeasuredImageUrlRef.current !== postImageUrl) {
      lastMeasuredImageUrlRef.current = postImageUrl;
      Image.getSize(
        postImageUrl,
        (width, height) => {
          setAspectRatio(width / height);
        },
        error => {
          if (__DEV__) console.warn('Failed to get image size', error);
          setAspectRatio(null);
        },
      );
    }

    setLikes(likesArray?.length || 0);
    setIsLiked(likesArray?.includes(userID || ''));
    setPostImage(postImageUrl);
  }

  const getComments = () => {
    if (!route.params?.channelUrl) return;

    const oldComments = allComments[route.params?.channelUrl] || [];
    const oldReactionsIds = oldComments.reduce<Record<string, string[]>>(
      (acc, comment) => {
        const ids =
          comment.reactions.find(reaction => reaction.key === 'smile')
            ?.sampledUserIds || [];

        return {
          ...acc,
          [comment.messageId]: ids,
        };
      },
      {},
    );
    setComments(oldComments);
    setReactions(oldReactionsIds);
    getPost(route.params?.channelUrl);
  };

  const onCreateComment = async () => {
    if (!route.params?.channelUrl) return;

    if (SUPABASE_ENABLED) {
      const channelUrl = route.params.channelUrl;
      const text = postText;
      setPostText('');
      inputRef.current?.blur();
      try {
        const msg = (await sendComment(
          channelUrl,
          text,
        )) as unknown as BaseMessageSendBirdType;
        setComments(state => [...state, msg]);
        // comment counts come from the DB — no commentQty metadata update

        const senderId = userDB?.cognitoId || '';
        const notifierId = (
          userPost?.sender?.metaData as MetaDataUserSendBirdType
        )?.id;
        if (notifierId && senderId && notifierId !== senderId)
          sendNotification({
            notifierId,
            senderId,
            entityType: 'NEW_MESSAGE',
            type: 'post',
            content: text,
            meta: {
              id: channelUrl,
              redirectUrl: `sendbird/${channelUrl}`,
            },
          });
      } catch (error) {
        customShowError({
          error,
          showToast,
        });
      }
      return;
    }

    const tempComment = {
      ...DEFAULT_COMMENT_POST,
      messageId: new Date().getTime(),
      message: postText,
      createdAt: new Date().getTime(),
      sender: {
        ...DEFAULT_COMMENT_POST.sender,
        userId: userID || '',
        nickname: sdk.currentUser?.nickname || '',
        profileUrl: sdk.currentUser?.profileUrl || '',
      } as Sender,
    } as BaseMessageSendBirdType;

    setComments(state => [...state, tempComment]);
    setPostText('');
    inputRef.current?.blur();

    try {
      const channel = await sdk.groupChannel.getChannel(
        route.params?.channelUrl,
      );
      const isJoined = channel.members.some(member => member.userId === userID);
      if (!isJoined) await channel.join();

      channel
        .sendUserMessage({
          message: tempComment.message,
        })
        .onSucceeded(async () => {
          const notifierId = (
            userPost.sender?.metaData as MetaDataUserSendBirdType
          )?.id;

          const senderId = (sdk.currentUser as UserSendBirdType).metaData.id;
          const isFounder = channel.creator?.userId === userID;

          getPost(route.params?.channelUrl || '');

          const existingData = JSON.parse(channel.data || '{}');

          const updatedData = {
            ...existingData,
            commentQty: parseInt(existingData.commentQty) + 1,
          };

          await channel.updateChannel({
            data: JSON.stringify(updatedData),
          });

          if (!isFounder && notifierId && senderId && route.params?.channelUrl)
            sendNotification({
              notifierId,
              senderId,
              entityType: 'NEW_MESSAGE',
              type: 'post',
              content: tempComment.message,
              meta: {
                id: route.params.channelUrl,
                redirectUrl: `sendbird/${route.params.channelUrl}`,
              },
            });
        })
        .onFailed(error => {
          customShowError({
            error,
            showToast,
          });
        });
    } catch (error) {
      if (__DEV__) console.warn('Error creating comment', error);
    }
  };

  const toggleReactionUserMessage = async (
    message: BaseMessageSendBirdType,
    isPost = false,
  ) => {
    if (SUPABASE_ENABLED) {
      if (!route.params?.channelUrl) return;
      const channelUrl = route.params.channelUrl;
      const myId = userDB?.cognitoId || userID || '';
      if (!myId) return;

      if (isPost) {
        try {
          const likers = await toggleReactionOn('post', channelUrl);
          setLikes(likers.length);
          setIsLiked(likers.includes(myId));

          const notifierId = (
            userPost?.sender?.metaData as MetaDataUserSendBirdType
          )?.id;
          if (
            likers.includes(myId) &&
            notifierId &&
            notifierId !== myId
          )
            sendNotification({
              notifierId,
              senderId: myId,
              entityType: 'NEW_LIKE',
              type: 'post',
              content: message.message,
              meta: {
                id: channelUrl,
                redirectUrl: `sendbird/${channelUrl}`,
              },
            });
        } catch (error) {
          if (__DEV__) console.warn('Error toggling post like', error);
        }
        return;
      }

      // Comment reaction: optimistic local toggle; the posts provider's
      // toggleReaction is already Supabase-aware (writes + refreshes).
      setReactions(state => {
        const ids = state[message.messageId] || [];
        return {
          ...state,
          [message.messageId]: ids.includes(myId)
            ? ids.filter(id => id !== myId)
            : [...ids, myId],
        };
      });
      toggleReaction(channelUrl, message);
      return;
    }

    if (!route.params?.channelUrl || !userID) return;

    const isReactionTemp = reactions[message.messageId]?.some(
      reaction => reaction === userID,
    );
    setReactions(state => {
      const ids = state[message.messageId] || [];
      return {
        ...state,
        [message.messageId]: ids.includes(userID)
          ? ids.filter(id => id !== userID)
          : [...ids, userID],
      };
    });

    toggleReaction(route.params?.channelUrl, message);

    sdk.groupChannel
      .getChannel(route.params?.channelUrl)
      .then(async channel => {
        const isFounder = channel.creator?.userId === userID;

        const notifierId = (
          userPost.sender?.metaData as MetaDataUserSendBirdType
        )?.id;

        const senderId = (sdk.currentUser as UserSendBirdType).metaData.id;

        await channel.join();

        // Fetch current likes from metadata
        const currentLikes = JSON.parse(channel.data).likes || [];

        // Update likes array based on current reaction state
        const updatedLikes = currentLikes.includes(userID)
          ? // Remove userID if already liked
            currentLikes.filter((id: string) => id !== userID)
          : // Add userID if not liked yet
            [...currentLikes, userID];

        setLikes(updatedLikes.length);

        setIsLiked(state => !state);

        const existingData = JSON.parse(channel.data || '{}');

        const updatedData = {
          ...existingData,
          likes: updatedLikes,
        };

        await channel.updateChannel({
          data: JSON.stringify(updatedData),
        });

        if (
          !isReactionTemp &&
          !isFounder &&
          notifierId &&
          senderId &&
          route.params?.channelUrl
        )
          sendNotification({
            notifierId,
            senderId,
            entityType: 'NEW_LIKE',
            type: isPost ? 'post' : 'comment',
            content: message.message,
            meta: {
              id: route.params.channelUrl,
              commentId: isPost ? undefined : message.messageId.toString(),
              redirectUrl: `sendbird/${route.params.channelUrl}/${message.messageId}`,
            },
          });
      });
  };

  const goToUserProfile = async (sender: Sender) => {
    if (!usersData?.data) return;
    const userFilter = usersData.data.filter(
      userById => userById.cognitoId === sender?.userId,
    ) as User[];

    if (userFilter.length === 0) {
      showToast({
        type: 'error',
        message:
          'User profile not available. This account may have been deleted.',
      });
      return;
    }

    const userCatch = userFilter[0];
    if (!sender?.plainProfileUrl) {
      userCatch.profilePicture = defaultAvatar;
    }

    navigationRedirect.navigate('Connect', {
      screen: 'DetailView',
      params: {
        user: userCatch,
        fromExternal: true,
      },
    });
    return;
  };

  const onFocusInput = () => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () => clearTimeout(timeout);
  };

  useEffect(() => {
    toggleAnimation();
  }, [postText.length > 0]);

  // Refresh posts once per focus. Previously getChannel() called getPosts()
  // with [posts] as a dependency, so every posts update re-triggered another
  // fetch — a redundant request loop.
  useFocusEffect(
    useCallback(() => {
      getPosts();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  useEffect(() => {
    getChannel();
  }, [posts, userPost]);

  useEffect(() => {
    getComments();
  }, [route.params?.channelUrl, isNewComment]);

  useEffect(() => {
    if (showKeyboard) {
      const timeout = setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [showKeyboard]);

  useEffect(() => {
    if (route.params?.isNowOpenKeyboard) onFocusInput();
  }, [route.params?.isNowOpenKeyboard]);

  return (
    <>
      <BackgroundScreen type="home-post">
        <KeyboardAvoidingView
          style={styles.scroll}
          contentContainerStyle={styles.scroll}
          behavior="padding"
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <IconArrowLeft width={30} height={30} />
              </TouchableOpacity>
              {/* <Text style={styles.titleHeader}>Comment</Text> */}
              <TouchableOpacity
                disabled
                style={[styles.backButton, styles.backButtonHide]}
              >
                <IconArrowLeft width={30} height={30} />
              </TouchableOpacity>
            </View>

            {loadingServer ? (
              <LoadingLine />
            ) : (
              <View style={styles.loadingLine} />
            )}

            {!userPost ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator color={colors.primary[600]} />
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
              >
                <View style={styles.postContainer}>
                  <View style={styles.postHeader}>
                    <View
                      style={[
                        styles.postHeaderUser,
                        { flexDirection: 'row', alignItems: 'center', flex: 1 },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          goToUserProfile(userPost.sender as Sender)
                        }
                      >
                        <AvatarMessagesTab
                          imageUrl={
                            userPost.sender?.plainProfileUrl ||
                            defaultAvatar ||
                            ''
                          }
                          width={35}
                          height={35}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          goToUserProfile(userPost.sender as Sender)
                        }
                      >
                        <Text
                          style={[styles.postHeaderUserName]}
                          numberOfLines={1}
                        >
                          {userPost.sender?.nickname || 'No name'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.postHeaderDate}>
                      {toLocalizedDateString(
                        userPost.createdAt,
                        userDB?.country ?? '',
                        {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </Text>
                  </View>

                  {postImage && (
                    <PostImageWithLoading
                      key={postImage}
                      uri={postImage}
                      backupUri={getOriginalImageUrl(postImage)}
                      style={[
                        styles.image,
                        !!aspectRatio && {
                          aspectRatio: aspectRatio,
                        },
                      ]}
                      resizeMode="contain"
                      containerStyle={styles.imageContainer}
                    />
                  )}

                  <Text style={styles.postText}>{userPost.message}</Text>

                  <View style={styles.postFooter}>
                    <TouchableOpacity
                      style={styles.postFooterItem}
                      onPress={() => toggleReactionUserMessage(userPost, true)}
                    >
                      <IconTabHeart
                        width={24}
                        height={24}
                        stroke={
                          isLiked ? colors.primary[500] : colors.primary[600]
                        }
                        strokeWidth={2}
                        fill={
                          isLiked ? colors.primary[500] : colors.transparent
                        }
                      />
                      <Text style={styles.postFooterItemText}>{likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.commentsContainer}>
                  {restComments.length > 0 && (
                    <Text style={styles.commentsTitle}>Replies</Text>
                  )}
                  <View style={styles.commentsList}>
                    {restComments.map(comment => {
                      const reactionIds = reactions[comment.messageId] || [];
                      const isReaction = reactionIds.some(
                        reaction => reaction === userID,
                      );

                      return (
                        <View
                          key={`comment-${comment.messageId}`}
                          style={styles.commentContainer}
                        >
                          <View style={styles.commentContent}>
                            <View style={styles.commentUser}>
                              <TouchableOpacity
                                onPress={() =>
                                  goToUserProfile(comment.sender as Sender)
                                }
                              >
                                <AvatarMessagesTab
                                  imageUrl={
                                    comment.sender?.plainProfileUrl ||
                                    defaultAvatar ||
                                    ''
                                  }
                                  width={35}
                                  height={35}
                                />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.commentTextContainer}>
                              <View style={styles.commentHeader}>
                                <TouchableOpacity
                                  onPress={() =>
                                    goToUserProfile(comment.sender as Sender)
                                  }
                                >
                                  <Text style={styles.commentUserInfo}>
                                    {comment.sender?.nickname || 'No name'}
                                  </Text>
                                </TouchableOpacity>
                                <View
                                  style={[
                                    styles.dot,
                                    {
                                      backgroundColor: comment.sender?.isActive
                                        ? colors.primary[600]
                                        : colors.primary[200],
                                    },
                                  ]}
                                />
                                <Text style={styles.commentUserInfoDate}>
                                  {toLocalizedDateString(
                                    comment.createdAt,
                                    userDB?.country ?? '',
                                    {
                                      day: 'numeric',
                                      month: 'numeric',
                                      year: 'numeric',
                                    },
                                  )}
                                </Text>
                              </View>
                              <Text style={styles.commentText}>
                                {comment.message}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.commentFooter}>
                            <TouchableOpacity
                              style={styles.commentFooterItem}
                              onPress={() => toggleReactionUserMessage(comment)}
                            >
                              <IconTabHeart
                                width={24}
                                height={24}
                                stroke={
                                  isReaction
                                    ? colors.primary[500]
                                    : colors.primary[600]
                                }
                                strokeWidth={2}
                                fill={
                                  isReaction
                                    ? colors.primary[500]
                                    : colors.transparent
                                }
                              />
                              {reactionIds.length > 0 && (
                                <Text style={styles.commentFooterItemText}>
                                  {reactionIds.length}
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            )}

            <Animated.View
              style={[
                styles.footer,
                {
                  backgroundColor: showKeyboard
                    ? colors.quaternary[100]
                    : colors.transparent,
                },
              ]}
            >
              <View style={styles.textInputContainer}>
                <TextInput
                  ref={inputRef}
                  placeholder="Write your reply"
                  placeholderTextColor={colors.neutral[600]}
                  style={styles.textInput}
                  value={postText}
                  onChangeText={setPostText}
                  multiline
                />
              </View>
              <Animated.View
                style={[
                  styles.actionButtonContainer,
                  { width: widthButtonSendRef },
                ]}
              >
                <TouchableOpacity
                  disabled={!isActionButtonActive}
                  onPress={onCreateComment}
                  style={styles.commentButton}
                >
                  <IconSend width={24} height={24} />
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </BackgroundScreen>
    </>
  );
};

export default HomeTabPost;
