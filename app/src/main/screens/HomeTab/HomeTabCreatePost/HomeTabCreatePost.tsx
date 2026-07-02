import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSendbirdChat } from '@sendbird/uikit-react-native';

// types
import { RootHomeTabParamList } from 'main/navigators/HomeTabStacks/HomeTabStacks.types';

// providers
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useDBProvider } from 'providers/DBProvider/DBProvider';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';

// backend v2
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { createPost } from 'services/supabase/supabase.social';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import AvatarMessagesTab from 'main/screens/MessagesTab/components/AvatarMessagesTab/AvatarMessagesTab';
import VisibilitySelector from '../components/VisibilitySelector/VisibilitySelector';

// utils
import { customShowError } from 'utils/other';

// icons
import {
  IconAddImage,
  IconClose,
  IconWorld,
} from 'assets/icons-auto/components';

// constants
import { PATHS_HOME_TAB } from 'main/navigators/paths';

// styles
import styles from './HomeTabCreatePost.styles';
import colors from 'styles/colors';
import PostImageModal, {
  ImageUploadItem,
} from '../components/PostImageModal/PostImageModal';

import { makeAxiosHttpClient } from 'main/factories/http';
import axios from 'axios';
import { getSizedImageUrls } from 'utils/imageUrlUtils';

type HomeTabCreatePostProps = {
  navigation: NativeStackNavigationProp<RootHomeTabParamList>;
};

const HomeTabCreatePost: FunctionComponent<HomeTabCreatePostProps> = ({
  navigation,
}) => {
  const { sdk } = useSendbirdChat();
  const { showToast } = useToastProvider();
  const [focused, setFocused] = useState(false);
  const [postText, setPostText] = useState('');
  const [readyInput, setReadyInput] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'group'>('public');
  const bottomFooterRef = useRef(new Animated.Value(10)).current;
  const inputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { userDB } = useUserDBProvider();
  const { getPosts } = useSendBirdPostsProvider();
  const {
    db: { diagnosisType },
  } = useDBProvider();

  const isActionButtonActive = useMemo(() => postText.length > 0, [postText]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageUploadItem | null>(
    null,
  );

  const toggleAnimatedFooter = () => {
    Animated.timing(bottomFooterRef, {
      toValue: focused ? 0 : 10,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const onCreatePost = async () => {
    setIsLoading(true);
    try {
      if (SUPABASE_ENABLED) {
        // Backend V2: text post into the posts table. Group targeting is not
        // wired from this screen yet (no single group id available), so
        // 'group' visibility falls back to 'all'. Image upload lands with the
        // Supabase media pipeline.
        await createPost(postText, null);
        getPosts();
        navigation.navigate(PATHS_HOME_TAB.homeTabMain);
        setIsLoading(false);
        return;
      }

      const roleName = userDB?.role?.description?.toLowerCase();
      const cancerType = (userDB?.diagnosisTypes ?? [])
        .map(id => {
          const match = diagnosisType.find(d => d.id === id);
          return match?.description?.toLowerCase();
        })
        .filter(Boolean);

      // upload image if selected
      let smImageUrl = '';
      let mdImageUrl = '';
      if (selectedImage) {
        const ext = selectedImage.ext;
        const arrayBuffer = Uint8Array.from(atob(selectedImage.base64), c =>
          c.charCodeAt(0),
        );
        const urlResponse = await makeAxiosHttpClient().request({
          url: `/users/signed-url?ext=${ext}&userId=${userDB?.id}`,
          method: 'get',
        });
        if (urlResponse.statusCode !== 200)
          throw new Error('Failed to get signed URL');
        const { s3Url, uploadUrl } = urlResponse.body;
        const cleanAxios = axios.create();
        const contentType = selectedImage.mimeType;
        const uploadRes = await cleanAxios.put(uploadUrl, arrayBuffer, {
          headers: {
            'Content-Type': contentType,
          },
        });
        if (uploadRes.status >= 200 && uploadRes.status < 300) {
          const sizedUrls = getSizedImageUrls(s3Url);
          smImageUrl = sizedUrls.sm;
          mdImageUrl = sizedUrls.md;
        } else {
          throw new Error('Image upload failed');
        }
      }

      const channel = await sdk.groupChannel.createChannel({
        isPublic: true,
        isDiscoverable: true,
        isEphemeral: false,
        data: JSON.stringify({
          type: 'post',
          visibility: visibility,
          recommendedGroups: [roleName, cancerType[0]],
          likes: [],
          commentQty: 0,
          firstMessage: '',
          firstMessageId: '',
          image_sm: smImageUrl,
          image_md: mdImageUrl,
        }),
      });

      await channel.createMetaData({
        type: 'post',
      });

      channel
        .sendUserMessage({
          message: postText,
        })
        .onSucceeded(async message => {
          const existingData = JSON.parse(channel.data || '{}');

          const updatedData = {
            ...existingData,
            firstMessage: message.message.toString(),
            firstMessageId: message.messageId.toString(),
          };

          await channel.updateChannel({
            data: JSON.stringify(updatedData),
          });

          navigation.navigate(PATHS_HOME_TAB.homeTabMain);
          setIsLoading(false);
        })
        .onFailed(error => {
          setIsLoading(false);
          customShowError({
            error,
            showToast,
          });
        });
    } catch (error) {
      if (__DEV__) console.warn('Error creating post', error);
      setIsLoading(false);
      customShowError({
        error,
        showToast,
      });
    }
  };

  const handleImageSelect = (asset: ImageUploadItem) => {
    setSelectedImage(asset);
  };

  useEffect(() => {
    toggleAnimatedFooter();
  }, [focused]);

  useEffect(() => {
    if (readyInput) inputRef.current?.focus();
  }, [readyInput]);

  return (
    <>
      <BackgroundScreen type="home-create-post">
        <KeyboardAvoidingView
          style={styles.scroll}
          contentContainerStyle={styles.scroll}
          behavior="padding"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.postButtonContainer}>
              <TouchableOpacity
                disabled={!isActionButtonActive || isLoading}
                onPress={onCreatePost}
                style={[
                  styles.postButton,
                  isActionButtonActive && !isLoading && styles.postButtonActive,
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.neutral[100]} />
                ) : (
                  <Text
                    style={[
                      styles.postButtonText,
                      isActionButtonActive && styles.postButtonTextActive,
                    ]}
                  >
                    Post
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            scrollEnabled={false}
            style={styles.scroll}
            contentContainerStyle={styles.scroll}
          >
            <View
              style={[
                styles.container,
                selectedImage && styles.containerWithImage,
              ]}
            >
              <View style={styles.textInputContainer}>
                <View style={styles.avatarContainer}>
                  <AvatarMessagesTab
                    imageUrl={sdk.currentUser?.profileUrl || ''}
                    width={49}
                    height={49}
                  />
                </View>
                <TextInput
                  ref={inputRef}
                  multiline
                  placeholder="What’s happening?"
                  placeholderTextColor={colors.neutral[600]}
                  style={styles.textInput}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  value={postText}
                  onChangeText={setPostText}
                  onLayout={() => setReadyInput(true)}
                />
              </View>
              {selectedImage && (
                <View style={styles.imageCont}>
                  <View style={styles.imageShadow}>
                    <Image
                      source={{ uri: selectedImage.previewUri }}
                      style={styles.uploadedImage}
                      resizeMode="cover"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.clearImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <IconClose
                      width={14}
                      height={14}
                      stroke={colors.white}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.8}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <VisibilitySelector
                visibility={visibility}
                setVisibility={setVisibility}
              />
              <Animated.View
                style={[
                  styles.footer,
                  {
                    bottom: bottomFooterRef,
                  },
                ]}
              >
                <View style={styles.footerVisibilityCont}>
                  <IconWorld width={23} height={23} />
                  <Text style={styles.footerText}>Anyone can reply</Text>
                </View>
                <TouchableOpacity
                  disabled={
                    !isActionButtonActive || isLoading || !!selectedImage
                  }
                  onPress={() => setShowUploadModal(true)}
                  style={[
                    styles.uploadButton,
                    isActionButtonActive &&
                      !isLoading &&
                      !selectedImage &&
                      styles.uploadActiveButton,
                  ]}
                >
                  <View style={styles.imageButtonInner}>
                    <IconAddImage width={24} height={24} />
                    <Text
                      style={[
                        styles.imageButtonText,
                        isActionButtonActive && styles.imageButtonTextActive,
                      ]}
                    >
                      Add Photo
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </BackgroundScreen>
      {showUploadModal && (
        <PostImageModal
          onClose={() => setShowUploadModal(false)}
          onImageSelected={asset => handleImageSelect(asset)}
        />
      )}
    </>
  );
};

export default HomeTabCreatePost;
