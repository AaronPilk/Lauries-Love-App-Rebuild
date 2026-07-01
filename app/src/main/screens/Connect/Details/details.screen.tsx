import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import {
  CommonActions,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import { ConnectStackParamList } from 'types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QueryType } from '@sendbird/chat/groupChannel';

// types
import {
  GroupChannelSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { User } from '../Map/map.screen';

// providers
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';

// hooks
import { getFileStorageAmplify } from 'utils/amplify-storage';
import useFriendsUserDB from 'providers/UserDBProvider/useFriendsUserDB';

// icons
import {
  IconArrowLeft,
  IconChatBubbleLeft,
  IconMapPin,
  IconMiddleDot,
  IconUserMinus,
  IconUserPlus,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';
import { DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD } from 'providers/SendbirdChatProvider/SendbirdChatProvider.constants';

// hooks
import { useCountry } from 'presentation/hooks';

// styles
import colors from 'styles/colors';
import styles from './details.styles';

type DetailsScreenProps = {
  navigation: NativeStackNavigationProp<ConnectStackParamList>;
};

const DetailsScreen: FunctionComponent<DetailsScreenProps> = ({
  navigation: navigationProps,
}) => {
  const navigation = useNavigation();
  const { sdk } = useSendbirdChat();
  const { groupChannels, getChannels } = useSendbirdChatProvider();
  const { showToast } = useToastProvider();
  const route =
    useRoute<
      RouteProp<{ params: { user: User; fromExternal?: boolean } }, 'params'>
    >();
  const {
    isCurrentUser,
    isPending,
    isAccepted,
    isLoading,
    isFriend: isFriendSendbird,
    handleFriend,
  } = useFriendsUserDB({
    friendId: route.params?.user.id || '',
    friendCognitoId: route.params?.user.cognitoId || '',
    navigation: navigationProps,
  });

  const { allCountries } = useCountry();

  const [profilePicture, setProfilePicture] = useState<URL | undefined>();
  const [isLoadingSendMessage, setIsLoadingSendMessage] = useState(false);

  const { user } = useMemo(() => route.params, [route.params]);

  const country = useMemo(
    () =>
      allCountries.find(country => country.code === user.country)?.name ||
      'Unknown Country',
    [user.country],
  );

  async function getProfilePicture() {
    const profilePicture = await getFileStorageAmplify(user.profilePicture);
    setProfilePicture(profilePicture);
  }

  async function getUserId(id: string) {
    try {
      const queryFilter = sdk.createApplicationUserListQuery({
        metaDataKeyFilter: 'id',
        metaDataValuesFilter: [id],
        limit: 100,
      });
      const queryStandard = sdk.createFriendListQuery({
        limit: 100,
      });

      const users = (await queryFilter.next()) as UserSendBirdType[];
      const userList =
        users.length > 0
          ? users
          : ((await queryStandard.next()) as UserSendBirdType[]);

      const user = userList.find(user => {
        if (user.metaData?.userInfo) {
          const isCurrentJson = user.metaData.userInfo.endsWith('}');
          const userInfo = JSON.parse(
            isCurrentJson
              ? user.metaData.userInfo
              : `${user.metaData.userInfo}"}`,
          );
          return userInfo.id === id;
        }
      });
      if (!user) return null;

      return user.userId;
    } catch (error) {
      throw new Error(`Error getting user: ${error}`);
    }
  }

  function toChatUser(channelUrl: string, userId: string) {
    navigationProps.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Messages',
            state: {
              routes: [
                {
                  name: PATHS_MESSAGES_TAB.messagesTabMain,
                },
                {
                  name: PATHS_MESSAGES_TAB.messagesTabChat,
                  params: {
                    channelUrl,
                    userId,
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  }

  async function handleMessage() {
    try {
      setIsLoadingSendMessage(true);
      const userId = await getUserId(user.id);
      if (!userId && !user.cognitoId) {
        showToast({
          type: 'info',
          message: DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD,
        });
        return null;
      }

      const userSendBird = await sdk
        .createApplicationUserListQuery({
          userIdsFilter: [
            ...(userId ? [userId] : []),
            ...(user.cognitoId ? [user.cognitoId] : []),
          ],
        })
        .next();
      if (!userSendBird.length) {
        showToast({
          type: 'info',
          message: DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD,
        });
        return null;
      }

      const queryChannel = sdk.groupChannel.createMyGroupChannelListQuery({
        userIdsFilter: {
          userIds: [user.cognitoId],
          includeMode: false,
          queryType: QueryType.AND,
        },
        metadataKey: 'type',
        metadataValues: ['chat'],
      });
      const channels =
        (await queryChannel.next()) as GroupChannelSendBirdType[];

      const findChannel = [...channels, ...groupChannels].find(
        channel =>
          channel.members.length === 2 &&
          channel.members.find(member => member.userId === user.cognitoId) &&
          channel.cachedMetaData.type === 'chat',
      );
      if (findChannel) return toChatUser(findChannel.url, user.cognitoId);

      const channel = await sdk.groupChannel.createChannelWithUserIds(
        [user.cognitoId],
        true,
      );
      await channel.createMetaData({
        type: 'chat',
      });
      getChannels();
      return toChatUser(channel.url, user.cognitoId);
    } catch (error) {
      throw new Error(`Error sending message: ${error}`);
    } finally {
      setIsLoadingSendMessage(false);
    }
  }

  function handleMap() {
    if (
      !user ||
      !user.geoLocation ||
      !user.geoLocation.latitude ||
      !user.geoLocation.longitude
    )
      return Alert.alert('Error', 'User does not have location data');

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Connect',
          state: {
            routes: [
              {
                name: 'MapView',
                params: {
                  user: user,
                },
              },
            ],
          },
        },
      ],
    });
  }

  const gender =
    user?.gender === 'prefer-not-to-say'
      ? ''
      : user.gender.charAt(0).toUpperCase() + user.gender.slice(1);

  const imageSource = profilePicture
    ? { uri: profilePicture.toString() }
    : require('../../../../assets/images/image-not-found.png');

  useEffect(() => {
    getProfilePicture();
  }, [user?.profilePicture]);

  const handleBack = () => {
    if (route.params?.fromExternal) {
      navigation.getParent()?.goBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.secondary[200],
        colors.neutral[100],
        colors.tertiary[100],
      ]}
      locations={[0, 0.4, 1]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={handleBack}>
                <IconArrowLeft
                  width={30}
                  height={30}
                  stroke={colors.neutral[1000]}
                />
              </TouchableOpacity>

              <View style={styles.profileContainer}>
                <View style={styles.profileDetails}>
                  <Image source={imageSource} style={styles.profileImage} />
                  <Text style={styles.profileName}>{user.firstName}</Text>
                </View>
                <View style={styles.profileInfoRow}>
                  <Text style={styles.profileInfoText}>{gender}</Text>
                  {gender && (
                    <IconMiddleDot
                      width={8}
                      height={8}
                      fill={colors.neutral[700]}
                    />
                  )}
                  <Text style={styles.profileInfoText}>
                    {user.city}, {country}
                  </Text>
                  <IconMiddleDot
                    width={8}
                    height={8}
                    fill={colors.neutral[700]}
                  />
                  <Text style={styles.profileInfoDate}>{user.age}</Text>
                </View>
              </View>
            </View>

            <View style={{ gap: 16 }}>
              <TouchableOpacity
                onPress={handleFriend}
                disabled={isPending || isCurrentUser || isLoading}
                style={[
                  styles.buttonFriend,
                  {
                    backgroundColor:
                      isPending || isCurrentUser
                        ? colors.primary[300]
                        : isAccepted || isFriendSendbird
                        ? colors.neutral[400]
                        : colors.primary[500],
                  },
                ]}
              >
                {isAccepted || isFriendSendbird ? (
                  <IconUserMinus
                    width={16}
                    height={16}
                    stroke={colors.neutral[900]}
                  />
                ) : (
                  <IconUserPlus
                    width={16}
                    height={16}
                    stroke={colors.neutral[100]}
                  />
                )}

                <Text
                  style={[
                    {
                      color:
                        (isAccepted || isFriendSendbird) && !isLoading
                          ? colors.neutral[900]
                          : colors.neutral[100],
                    },
                    styles.textFriend,
                  ]}
                >
                  {isLoading
                    ? 'Loading...'
                    : isPending
                    ? 'Requested'
                    : isAccepted || isFriendSendbird
                    ? 'Remove friend'
                    : 'Add Friend'}
                </Text>
              </TouchableOpacity>
              <View style={styles.actionButtonRow}>
                <TouchableOpacity
                  disabled={isLoadingSendMessage}
                  onPress={handleMessage}
                  style={styles.actionButtonMessage}
                >
                  <Text style={styles.buttonText}>
                    {isLoadingSendMessage ? 'Connecting...' : 'Send message'}
                  </Text>
                  <IconChatBubbleLeft
                    width={19}
                    height={19}
                    stroke={colors.primary[500]}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleMap}
                  style={styles.actionButtonMap}
                >
                  <Text style={styles.buttonText}>View in map</Text>
                  <IconMapPin
                    width={19}
                    height={19}
                    stroke={colors.primary[500]}
                    fill="transparent"
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.detailsCard}>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Diagnosis Type</Text>
                  <Text numberOfLines={1} style={styles.detailsValue}>
                    {user.diagnosisTypes[0]?.description}
                  </Text>
                </View>

                {user.diagnosisSubTypes[0]?.description && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Diagnosis Sub Type</Text>
                    <Text numberOfLines={1} style={styles.detailsValue}>
                      {user.diagnosisSubTypes[0]?.description}
                    </Text>
                  </View>
                )}

                {user.diagnosisYear && (
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsLabel}>Diagnosis Date</Text>
                    <Text numberOfLines={1} style={styles.detailsDate}>
                      {user.diagnosisYear || ''}
                    </Text>
                  </View>
                )}

                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Role</Text>
                  <Text numberOfLines={1} style={styles.detailsValue}>
                    {user.role?.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default DetailsScreen;
