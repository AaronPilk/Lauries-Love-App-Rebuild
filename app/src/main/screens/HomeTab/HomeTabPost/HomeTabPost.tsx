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
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { Sender } from 'services/legacy-chat.shim';

// types
import { RootHomeTabParamList } from 'main/navigators/HomeTabStacks/HomeTabStacks.types';
import {
  BaseMessageSendBirdType,
  MetaDataUserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { useKeyboardProvider } from 'providers/KeyboardProvider/KeyboardProvider';
import { useGetUsersReq } from 'presentation/services/react-query/user.query';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import AvatarMessagesTab from 'main/screens/MessagesTab/components/AvatarMessagesTab/AvatarMessagesTab';
import LoadingLine from 'components/LoadingLine/LoadingLine';
import RichText from 'components/RichText/RichText';

// constants
import { PATHS_HOME_TAB } from 'main/navigators/paths';

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
import {
  sendComment,
  toggleReactionOn,
  deletePost,
  reportContent,
} from 'services/supabase/supabase.social';

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

  // Identity from the REAL profile (reaction arrays store profile ids) —
  // sdk.currentUser is the dead Sendbird shim proxy.
  const userID = useMemo(
    () => userDB?.id ?? userDB?.cognitoId ?? '',
    [userDB?.id, userDB?.cognitoId],
  );

  const [userPost, ...restComments] = useMemo(() => comments, [comments]);

  // Post author id (Supabase mode: sender ids are profile ids). Drives the
  // author options menu — own post => Delete, someone else's => Report.
  const postAuthorId = useMemo(
    () => (userPost?.sender?.metaData as MetaDataUserSendBirdType)?.id ?? '',
    [userPost?.sender],
  );
  const isOwnPost = useMemo(
    () => !!postAuthorId && postAuthorId === userID,
    [postAuthorId, userID],
  );

  const handleDeletePost = useCallback(() => {
    const channelUrl = route.params?.channelUrl;
    if (!channelUrl) return;
    Alert.alert(
      'Delete post',
      'This permanently removes your post and its replies. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(channelUrl);
              showToast({ type: 'success', message: 'Post deleted' });
              getPosts();
              navigation.goBack();
            } catch (error) {
              customShowError({ error, showToast });
            }
          },
        },
      ],
    );
  }, [route.params?.channelUrl, showToast, getPosts, navigation]);

  const handleReportPost = useCallback(() => {
    const channelUrl = route.params?.channelUrl;
    if (!channelUrl) return;
    const submit = async (reason: string) => {
      try {
        await reportContent('post', channelUrl, reason);
        showToast({
          type: 'success',
          message: 'Thanks — our team will review this post.',
        });
      } catch (error) {
        customShowError({ error, showToast });
      }
    };
    Alert.alert('Report post', 'Why are you reporting this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Spam', onPress: () => submit('Spam') },
      { text: 'Harassment or bullying', onPress: () => submit('Harassment') },
      {
        text: 'Inappropriate content',
        onPress: () => submit('Inappropriate content'),
      },
    ]);
  }, [route.params?.channelUrl, showToast]);

  const handlePostOptions = useCallback(() => {
    if (!SUPABASE_ENABLED || !userPost) return;
    if (isOwnPost) {
      handleDeletePost();
    } else {
      handleReportPost();
    }
  }, [userPost, isOwnPost, handleDeletePost, handleReportPost]);

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

    const legacyLikes = postData.likes;
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

    setLikes(
      postData.likeCount ??
        (Array.isArray(legacyLikes) ? legacyLikes.length : 0),
    );
    setIsLiked(
      postData.likedByMe ??
        (Array.isArray(legacyLikes)
          ? legacyLikes.includes(userID || '')
          : false),
    );
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
          const { count, likedByMe } = await toggleReactionOn(
            'post',
            channelUrl,
          );
          setLikes(count);
          setIsLiked(likedByMe);

          const notifierId = (
            userPost?.sender?.metaData as MetaDataUserSendBirdType
          )?.id;
          if (likedByMe && notifierId && notifierId !== myId)
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

  // #hashtag tap -> community wall search for that tag. @mention tap -> that
  // member's profile (best-effort resolve by name against the loaded users).
  const onHashtagPress = useCallback(
    (tag: string) => {
      navigation.navigate(PATHS_HOME_TAB.homeTabMain, { initialSearch: tag });
    },
    [navigation],
  );

  const onMentionPress = useCallback(
    (handle: string) => {
      const norm = handle.replace(/[._]/g, '').toLowerCase();
      const match = (usersData?.data as User[] | undefined)?.find(u => {
        const dn = (u as any).displayName?.replace(/\s|[._]/g, '').toLowerCase();
        const fn = u.firstName?.replace(/\s|[._]/g, '').toLowerCase();
        return dn === norm || fn === norm;
      });
      if (match) {
        navigationRedirect.navigate('Connect', {
          screen: 'DetailView',
          params: { user: match, fromExternal: true },
        });
      }
    },
    [usersData?.data, navigationRedirect],
  );

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
              {SUPABASE_ENABLED && userPost ? (
                <TouchableOpacity
                  onPress={handlePostOptions}
                  style={styles.backButton}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text
                    style={{
                      fontSize: 26,
                      lineHeight: 30,
                      color: colors.neutral[900],
                    }}
                  >
                    {'⋯'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled
                  style={[styles.backButton, styles.backButtonHide]}
                >
                  <IconArrowLeft width={30} height={30} />
                </TouchableOpacity>
              )}
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

                  <RichText
                    text={userPost.message ?? ''}
                    style={styles.postText}
                    onHashtagPress={onHashtagPress}
                    onMentionPress={onMentionPress}
                  />


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
