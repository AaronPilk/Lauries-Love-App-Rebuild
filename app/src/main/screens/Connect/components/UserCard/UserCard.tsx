import { Region } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { QueryType } from '@sendbird/chat/groupChannel';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';

import colors from 'styles/colors';
import styles from './UserCard.styles';
import { User } from '../../Map/map.screen';
import { formatGender } from 'utils/formats';
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';
import { IconMiddleDot } from 'assets/icons-auto/components';
import { getFileStorageAmplify } from 'utils/amplify-storage';
import { useToastProvider } from 'providers/ToastProvider/ToastProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import { DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD } from 'providers/SendbirdChatProvider/SendbirdChatProvider.constants';
import {
  GroupChannelSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { useCountry } from 'presentation/hooks';

type Props = {
  user: User;
  setInitialRegion?: Dispatch<SetStateAction<Region>>;
};

export default function UserCard({ user, setInitialRegion }: Props) {
  const navigation = useNavigation();
  const { sdk } = useSendbirdChat();
  const { showToast } = useToastProvider();
  const { groupChannels, getChannels } = useSendbirdChatProvider();

  const { allCountries } = useCountry();

  const [profilePicture, setProfilePicture] = useState<URL | undefined>();
  const [isLoadingSendMessage, setIsLoadingSendMessage] = useState(false);

  const isFriend = useMemo(
    () => user.role?.description.toLowerCase().includes('friend') || false,
    [user.role],
  );

  useEffect(() => {
    getProfilePicture();
  }, [user.profilePicture]);

  async function getProfilePicture() {
    const profilePicture = await getFileStorageAmplify(user.profilePicture);
    setProfilePicture(profilePicture);
  }

  function toChatUser(channelUrl: string, userId: string) {
    navigation.dispatch(
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

  function handleDetails() {
    if (setInitialRegion) {
      setInitialRegion({
        latitude: user.geoLocation?.latitude || 0,
        latitudeDelta: 0.1,
        longitude: user.geoLocation?.longitude || 0,
        longitudeDelta: 0.1,
      });
    }

    navigation.navigate('Connect', {
      screen: 'DetailView',
      params: {
        user: user,
        // no fromExternal param needed here
        // as this is the main user card in the map
      },
    });
  }

  const imageSource = profilePicture
    ? { uri: profilePicture.toString() }
    : require('../../../../../assets/images/image-not-found.png');

  const country =
    allCountries.find(country => country.code === user.country)?.name ||
    'Unknown Country';

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.row}>
          <Image source={imageSource} style={styles.image} />
          <View style={{ flex: 1 }}>
            <View style={styles.headerRow}>
              <Text style={styles.headerText}>
                {user.firstName?.split(' ')[0]} ({user.age})
              </Text>
              <View style={styles.cityStateContainer}>
                <Text numberOfLines={1} style={styles.cityStateText}>
                  {user.city}, {country}
                </Text>
              </View>
            </View>

            <Text style={styles.detailsText}>
              {formatGender(user.gender)} {user.role?.description}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.userRow}>
        <Text numberOfLines={1} style={styles.userText}>
          {user?.diagnosisTypes[0]?.description}
        </Text>
        {!isFriend && (
          <>
            {user.diagnosisYear && (
              <IconMiddleDot width={8} height={8} fill={colors.primary[600]} />
            )}
            <Text style={styles.userText}>{user.diagnosisYear}</Text>
          </>
        )}
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          disabled={isLoadingSendMessage}
          onPress={handleMessage}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={['rgba(178, 93, 149, 1)', 'rgba(255, 162, 60, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonOutlinedContainer}
          >
            <View style={styles.buttonInnerContainer}>
              <Text style={styles.sendMessageText}>
                {isLoadingSendMessage ? 'Connecting...' : 'Send message'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDetails} style={{ flex: 1 }}>
          <LinearGradient
            colors={['rgba(178, 93, 149, 1)', 'rgba(255, 162, 60, 1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonContainer}
          >
            <Text style={styles.viewProfileText}>View profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
