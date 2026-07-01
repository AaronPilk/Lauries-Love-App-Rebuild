import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { CommonActions, RouteProp, useRoute } from '@react-navigation/native';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native-paper';
import { QueryType } from '@sendbird/chat/groupChannel';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';
import {
  MetaDataUserSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { UserDBType } from 'providers/UserDBProvider/UserDBProvider.types';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

// hooks
import useFriendsUserDB from 'providers/UserDBProvider/useFriendsUserDB';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import Button from 'components/Button/Button';
import AvatarProfile from 'main/screens/ProfileTab/components/AvatarProfile/AvatarProfile';
import AvatarMessagesTab from '../components/AvatarMessagesTab/AvatarMessagesTab';

// utils
import { getFileStorageAmplify } from 'utils/amplify-storage';

// icons
import {
  IconArrowLeft,
  IconChatBubbleLeft,
  IconMapPin,
  IconUserMinus,
  IconUserPlus,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';
import { DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD } from 'providers/SendbirdChatProvider/SendbirdChatProvider.constants';

// hooks
import { useCountry } from 'presentation/hooks';

// styles
import styles from './MessagesTabProfile.styles';
import colors from 'styles/colors';
import { ScrollView } from 'react-native-gesture-handler';

type MessagesTabProfileProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabProfile: FunctionComponent<MessagesTabProfileProps> = ({
  navigation,
}) => {
  const { sdk } = useSendbirdChat();
  const { getChannels } = useSendbirdChatProvider();
  const { getOnlyUserDBById } = useUserDBProvider();
  const route =
    useRoute<RouteProp<RootMessagesTabParamList, 'messages-tab-profile'>>();
  const {
    isLoading: isLoadingFriends,
    isCurrentUser,
    isFriend: isFriendSendbird,
    isAccepted: isFriend,
    isPending,
    handleFriend,
  } = useFriendsUserDB({
    friendId: route.params?.userId || '',
    friendCognitoId: route.params?.cognitoId || '',
    navigation,
  });
  const { allCountries } = useCountry();

  const [selectUserSendbird, setSelectUserSendbird] =
    useState<UserSendBirdType | null>(null);
  const [selectUserDB, setSelectUserDB] = useState<UserDBType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showName = useMemo(() => {
    if (selectUserSendbird?.nickname) return selectUserSendbird?.nickname;
    if (selectUserDB?.firstName)
      return `${selectUserDB?.firstName}${
        selectUserDB?.lastName ? ` ${selectUserDB?.lastName}` : ''
      }`;
    return '';
  }, [
    selectUserSendbird?.nickname,
    selectUserDB?.firstName,
    selectUserDB?.lastName,
  ]);

  const allInfo = useMemo(() => {
    if (!selectUserSendbird && !selectUserDB) return null;
    if (!selectUserDB?.gender) return null;

    const gender =
      selectUserDB?.gender === 'prefer-not-to-say'
        ? ''
        : selectUserDB?.gender.charAt(0).toUpperCase() ||
          selectUserDB?.gender + selectUserDB?.gender.slice(1);
    const selectCity =
      selectUserSendbird?.metaData.city || selectUserDB?.state || null;
    const selectCountryCode =
      selectUserSendbird?.metaData.country || selectUserDB?.country || null;
    const selectCountry =
      allCountries.find(country => country.code === selectCountryCode)?.name ||
      'Unknown Country';
    const selectAge =
      selectUserSendbird?.metaData.age || selectUserDB?.age || null;
    const city = selectCity
      ? `${selectCity.slice(0, 1).toUpperCase()}${selectCity.slice(1)}`
      : null;
    const place =
      city || selectCountry
        ? `${city ? ` ${city}${selectCountry ? ', ' : ''}` : ''}${
            selectCountry ? `${selectCountry}` : ''
          }`
        : null;
    const age = selectAge;
    return `${gender && `${gender} • `}${place ? `${place}` : ''}${
      age ? ` • ${age}` : ''
    }`;
  }, [selectUserSendbird, selectUserDB]);

  const getUserDB = async (id: string) => {
    try {
      const userDB = await getOnlyUserDBById(id);
      return userDB;
    } catch (error) {
      if (__DEV__) console.warn('getUser error', error);
      return null;
    }
  };

  const getUserSendbird = async () => {
    try {
      const query = sdk.createApplicationUserListQuery({
        userIdsFilter: [route.params?.cognitoId || ''],
      });
      const users = await query.next();
      if (users.length === 0)
        Alert.alert('Error', DEFAULT_ERROR_NOT_FOUND_USER_SENDBIRD, [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      const firstUser = users[0] as UserSendBirdType;
      const metaData = firstUser.metaData.userInfo
        ? (JSON.parse(
            firstUser.metaData.userInfo,
          ) as MetaDataUserSendBirdType | null)
        : null;
      const rightUser = {
        ...firstUser,
        metaData: {
          ...firstUser.metaData,
          ...metaData,
        },
      };
      const userDB = rightUser.metaData.id
        ? await getUserDB(rightUser.metaData.id)
        : null;
      setSelectUserSendbird(rightUser as UserSendBirdType);
      const profileImgUrl = userDB?.profilePicture
        ? (await getFileStorageAmplify(userDB.profilePicture))?.href || null
        : null;
      if (userDB)
        setSelectUserDB({
          ...userDB,
          profileImgUrl,
        });
    } catch (error) {
      if (__DEV__) console.warn('getUser error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openChat = async () => {
    try {
      const query = sdk.groupChannel.createMyGroupChannelListQuery({
        userIdsFilter: {
          userIds: [selectUserSendbird?.userId || ''],
          includeMode: false,
          queryType: QueryType.AND,
        },
      });
      const channels = await query.next();
      const privateChannel = channels.find(
        channel =>
          channel.isDistinct &&
          channel.members.length === 2 &&
          channel.members.some(
            member => member.userId === selectUserSendbird?.userId,
          ) &&
          channel.members.some(
            member => member.userId === sdk.currentUser?.userId,
          ),
      );
      if (privateChannel)
        return navigation.navigate('messages-tab-chat', {
          channelUrl: privateChannel.url,
        });

      const channel = await sdk.groupChannel.createChannelWithUserIds(
        [selectUserSendbird?.userId || ''],
        true,
      );
      await channel.createMetaData({
        type: 'chat',
      });
      getChannels();
      return navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChat, {
        channelUrl: channel.url,
        userId: selectUserSendbird?.userId || '',
      });
    } catch (error) {
      if (__DEV__) console.warn('openChat error', error);
    }
  };

  const onViewMap = async () => {
    if (
      !selectUserDB ||
      !selectUserDB.geoLocation ||
      !selectUserDB.geoLocation.latitude ||
      !selectUserDB.geoLocation.longitude
    )
      return Alert.alert('Error', 'User does not have location data');

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Connect',
            state: {
              routes: [
                {
                  name: 'MapView',
                  params: {
                    user: selectUserDB,
                  },
                },
              ],
            },
          },
        ],
      }),
    );
  };

  useEffect(() => {
    getUserSendbird();
  }, []);

  return (
    <BackgroundScreen type="messages-tab-profile">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.backButton}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <IconArrowLeft
                width={30}
                height={30}
                stroke={colors.neutral[1000]}
              />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
              <View style={styles.profileDetails}>
                {selectUserDB ? (
                  <AvatarProfile user={selectUserDB} width={120} height={120} />
                ) : selectUserSendbird?.plainProfileUrl ? (
                  <AvatarMessagesTab
                    imageUrl={selectUserSendbird.plainProfileUrl}
                    width={120}
                    height={120}
                  />
                ) : (
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarLetterContainer}>
                      <Text style={styles.avatarLetter}>
                        {selectUserSendbird?.nickname[0] ||
                          selectUserSendbird?.userId[0]}
                      </Text>
                    </View>
                  </View>
                )}
                <Text style={styles.profileName}>{showName}</Text>
              </View>
              <Text style={styles.profileInfoText}>{allInfo}</Text>
            </View>
          </View>

          <View style={{ gap: 16 }}>
            <Button
              disabled={
                isPending || isCurrentUser || isLoadingFriends || isLoading
              }
              title={
                isLoadingFriends
                  ? 'Loading...'
                  : isFriend || isFriendSendbird
                  ? 'Remove Friend'
                  : isLoading || isPending
                  ? 'Requested'
                  : 'Add Friend'
              }
              shape="rounded"
              prefix={
                isFriend || isFriendSendbird ? (
                  <IconUserMinus width={16} height={16} />
                ) : (
                  <IconUserPlus
                    width={16}
                    height={16}
                    stroke={colors.neutral[100]}
                  />
                )
              }
              onPress={handleFriend}
              styleContainer={
                isFriend || isFriendSendbird
                  ? { backgroundColor: colors.neutral[400] }
                  : isLoading || isPending
                  ? { backgroundColor: colors.primary[300] }
                  : { backgroundColor: colors.primary[500] }
              }
              styleTitle={
                isFriend || isFriendSendbird
                  ? { color: colors.neutral[900] }
                  : { color: colors.neutral[100] }
              }
            />
            <View style={styles.actionButtonRow}>
              <TouchableOpacity
                style={styles.actionButtonMessage}
                onPress={openChat}
              >
                <Text style={styles.buttonText}>Send message</Text>
                <IconChatBubbleLeft
                  width={19}
                  height={19}
                  stroke={colors.primary[500]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButtonMap}
                onPress={onViewMap}
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
                  {!selectUserDB?.diagnosisTypes?.[0]
                    ? 'Not Specified'
                    : typeof selectUserDB?.diagnosisTypes?.[0] === 'string'
                    ? selectUserDB?.diagnosisTypes?.[0]
                    : selectUserDB?.diagnosisTypes?.[0].description}
                </Text>
              </View>
              {selectUserDB?.diagnosisSubTypes?.[0] && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Diagnosis Sub Type</Text>
                  <Text numberOfLines={1} style={styles.detailsValue}>
                    {!selectUserDB?.diagnosisSubTypes?.[0]
                      ? 'Not Specified'
                      : typeof selectUserDB?.diagnosisSubTypes?.[0] === 'string'
                      ? selectUserDB?.diagnosisSubTypes?.[0]
                      : selectUserDB?.diagnosisSubTypes?.[0].description}
                  </Text>
                </View>
              )}
              {selectUserDB?.diagnosisYear && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Diagnosis Date</Text>
                  <Text style={styles.detailsValue}>
                    {selectUserDB?.diagnosisYear || ''}
                  </Text>
                </View>
              )}
              {selectUserDB?.role && (
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Role</Text>
                  <Text numberOfLines={1} style={styles.detailsValue}>
                    {selectUserDB.role.description}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={colors.primary[100]} />
          </View>
        )}
      </ScrollView>
    </BackgroundScreen>
  );
};

export default MessagesTabProfile;
