import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { useNavigation } from '@react-navigation/native';
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import colors from 'styles/colors';
import styles from './PostHomeTab.styles';
import { setMetadata } from 'services/sendbirdMetadata';
import defaultAvatar from 'assets/images/avatar-empty.png';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useGetUsersReq } from 'presentation/services/react-query/user.query';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';
import AvatarMessagesTab from 'main/screens/MessagesTab/components/AvatarMessagesTab/AvatarMessagesTab';
import {
  GroupChannelSendBirdType,
  MetaDataUserSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { toLocalizedDateString } from 'utils/formatDate';

import { IconArrowRight } from 'assets/icons-auto/components';
import PostReadMoreButton from '../PostReadMoreButton/PostReadMoreButton';
import PostFooter from '../PostFooter/PostFooter';
import { PostImageWithLoading } from '../PostImageWithLoading/PostImageWithLoading';
import { getOriginalImageUrl } from 'utils/imageUrlUtils';

// backend v2
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { toggleReactionOn } from 'services/supabase/supabase.social';

type PostHomeTabProps = {
  post: GroupChannelSendBirdType;
  onPressPost: (channelUrl: string, isNowOpenKeyboard?: boolean) => void;
  isSearchMode?: boolean;
};

const PostHomeTab: FunctionComponent<PostHomeTabProps> = ({
  post,
  onPressPost,
  isSearchMode = false,
}) => {
  const { sdk } = useSendbirdChat();
  const { userDB } = useUserDBProvider();
  const navigation = useNavigation();
  const { showToast } = useToastProvider();
  const { data: usersData } = useGetUsersReq();
  const { sendNotification, comments: comment } = useSendBirdPostsProvider();

  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const userID = useMemo(
    () => sdk.currentUser?.userId,
    [sdk.currentUser?.userId],
  );

  // Parse post.data once per data change instead of on every focus/render
  const postData = useMemo(() => {
    try {
      return JSON.parse(post.data || '{}');
    } catch (error) {
      return {};
    }
  }, [post.data]);

  const message = postData.firstMessage;
  const comments = postData.commentQty || 0;
  const postImage: string = postData.image_sm ?? '';

  useEffect(() => {
    const likesArray = postData.likes;
    setLikes(likesArray?.length || 0);
    setIsLiked(likesArray?.includes(userID || ''));
  }, [postData, userID]);

  const goToUserProfile = async () => {
    const userFilter =
      usersData?.data?.filter(
        userById => userById.cognitoId === post.creator?.userId,
      ) || [];

    if (userFilter.length === 0) {
      showToast({
        type: 'error',
        message:
          'User profile not available. This account may have been deleted.',
      });
      return;
    }

    const userCatch = userFilter[0];
    if (!post.creator?.plainProfileUrl) {
      userCatch.profilePicture = defaultAvatar;
    }

    navigation.navigate('Connect', {
      screen: 'DetailView',
      params: {
        user: userCatch,
        fromExternal: true,
      },
    });
    return;
  };

  const handlePressPost = useCallback(() => {
    onPressPost(post.url);
  }, [onPressPost, post.url]);

  const handlePressComment = useCallback(() => {
    setMetadata(sdk, comment, post.url);
  }, [sdk, comment, post.url]);

  const toggleReactionUserMessage = useCallback(async () => {
    if (SUPABASE_ENABLED) {
      if (!post) return;
      const myId = userDB?.cognitoId || userID || '';
      if (!myId) return;

      try {
        const likers = await toggleReactionOn('post', post.url);
        setLikes(likers.length);
        setIsLiked(likers.includes(myId));

        const notifierId = post.creator?.userId;
        const senderId = myId;
        if (notifierId && senderId && notifierId !== senderId) {
          sendNotification({
            notifierId,
            senderId,
            entityType: 'NEW_LIKE',
            type: 'post',
            content: message,
            meta: {
              id: post.url,
              redirectUrl: `sendbird/${post.url}`,
            },
          });
        }
      } catch (error) {
        if (__DEV__) console.warn('Error toggling reaction:', error);
      }
      return;
    }

    if (!post || !userID) return;

    try {
      const channel = await sdk.groupChannel.getChannel(post.url);

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

      const notifierId = (
        post.lastMessage?.sender?.metaData as MetaDataUserSendBirdType
      )?.id;
      const currentUser = sdk.currentUser as UserSendBirdType;
      const senderId = currentUser.metaData.id;
      const isFounder = channel.creator?.userId === userID;

      if (!isFounder && notifierId && senderId) {
        sendNotification({
          notifierId,
          senderId,
          entityType: 'NEW_LIKE',
          type: 'post',
          content: message,
          meta: {
            id: post.url,
            redirectUrl: `sendbird/${post.url}`,
          },
        });
      }
    } catch (error) {
      if (__DEV__) console.warn('Error toggling reaction:', error);
    }
  }, [post, userID, sdk, message, sendNotification, userDB?.cognitoId]);

  // useEffect(() => {
  //   setMetadata(sdk, comment, post.url);
  // }, []);
  if (isSearchMode) {
    return (
      <View style={[styles.searchTitleContainer]}>
        <Text style={styles.searchHeaderText} numberOfLines={1}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={handlePressPost}
          style={styles.searchReadMoreButton}
        >
          <Text style={styles.searchReadMoreText}>Read full story</Text>
          <IconArrowRight
            width={19}
            height={19}
            stroke={colors.primary[600]}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    );
  }

  if (postImage && postImage.length > 0)
    return (
      <View style={styles.withImageContainer}>
        <TouchableOpacity onPress={handlePressPost}>
          <PostImageWithLoading
            key={postImage}
            uri={postImage}
            backupUri={getOriginalImageUrl(postImage)}
            style={styles.image}
            resizeMode="cover"
            containerStyle={styles.imageContainer}
          />
        </TouchableOpacity>
        <View style={styles.withImageContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.withImageHeaderText} numberOfLines={1}>
              {message}
            </Text>
            <PostReadMoreButton onPress={handlePressPost} text="Read More" />
          </View>
          <Text
            style={[styles.contentText, { paddingRight: 12 }]}
            numberOfLines={2}
          >
            {message}
          </Text>
        </View>
        <PostFooter
          footerStyles={styles.withImageFooter}
          likes={likes}
          isLiked={isLiked}
          onPressLike={toggleReactionUserMessage}
          comments={comments}
          onPressComment={handlePressComment}
        />
      </View>
    );

  return (
    <View style={styles.mainContainer}>
      <TouchableOpacity onPress={handlePressPost}>
        <LinearGradient
          colors={[colors.quaternary10018, colors.quaternary20018]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.container}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.headerLeft,
                { flexDirection: 'row', alignItems: 'center', flex: 1 },
              ]}
            >
              <TouchableOpacity onPress={goToUserProfile}>
                <AvatarMessagesTab
                  imageUrl={
                    post.creator?.plainProfileUrl || defaultAvatar || ''
                  }
                  width={35}
                  height={35}
                  name={post.creator?.nickname || ''}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToUserProfile}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={[styles.headerText]} numberOfLines={1}>
                  {post.creator?.nickname || ''}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.headerTime}>
              {toLocalizedDateString(post.createdAt, userDB?.country ?? '', {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.contentText} numberOfLines={4}>
              {message}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <PostFooter
        likes={likes}
        isLiked={isLiked}
        onPressLike={toggleReactionUserMessage}
        comments={comments}
        onPressComment={handlePressComment}
      />
    </View>
  );
};

export default React.memo(PostHomeTab);
