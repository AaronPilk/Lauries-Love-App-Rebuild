import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  Text,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSendbirdChat } from 'services/legacy-chat.shim';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';

// providers
import { GroupChannelSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';
import ButtonModalTabs from 'components/ButtonModalTabs/ButtonModalTabs';
import AvatarMessagesTab from '../components/AvatarMessagesTab/AvatarMessagesTab';

// icons
import {
  IconGallery,
  IconLockProfile,
  IconTabUser,
} from 'assets/icons-auto/components';

// constants
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// styles
import colors from 'styles/colors';
import styles from './MessagesTabDetailsGroup.styles';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

type MessagesTabDetailsGroupProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabDetailsGroup: FunctionComponent<
  MessagesTabDetailsGroupProps
> = ({ navigation }) => {
  const route =
    useRoute<
      RouteProp<RootMessagesTabParamList, 'messages-tab-details-group'>
    >();
  const { sdk } = useSendbirdChat();
  const { getChannels } = useSendbirdChatProvider();
  const [channel, setChannel] = useState<GroupChannelSendBirdType | null>(null);

  const fetchChannel = async () => {
    if (!route.params?.channelUrl) return;

    try {
      const fetchedChannel = await sdk.groupChannel.getChannel(
        route.params.channelUrl,
      );
      setChannel(fetchedChannel);
    } catch (error) {
      if (__DEV__) console.warn('Error fetching channel:', error);
    }
  };

  const onLeave = () => {
    channel?.leave().then(async () => {
      await getChannels();
      navigation.reset({
        index: 0,
        routes: [{ name: PATHS_MESSAGES_TAB.messagesTabMain }],
      });
    });
  };

  const onLeaveGroup = () => {
    if (Platform.OS === 'ios')
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Leave group', 'Cancel'],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        buttonIndex => {
          if (buttonIndex === 0) onLeave();
        },
      );
    else
      Alert.alert('Leave group', 'Are you sure you want to leave this group?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave group',
          style: 'destructive',
          onPress: () => {
            onLeave();
          },
        },
      ]);
  };

  useEffect(() => {
    fetchChannel();
  }, []);

  if (!channel) return null;
  return (
    <>
      <BackgroundScreen type={'messages'}>
        <HeaderTabScreen
          title="Details"
          onPressLeft={() => navigation.goBack()}
        />
        <View style={styles.container}>
          <View style={styles.userContainer}>
            <AvatarMessagesTab
              imageUrl={channel.coverUrl}
              width={120}
              height={120}
            />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{channel.name}</Text>
              <Text style={styles.birthday}>
                {channel.members.length} Members
              </Text>
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            <ButtonModalTabs
              Icon={IconGallery}
              label={'Media and docs'}
              iconProps={{
                stroke: colors.neutral[800],
                strokeWidth: 2.1,
              }}
              onPress={() => {
                navigation.navigate(
                  PATHS_MESSAGES_TAB.messagesTabMediaAndDocs,
                  {
                    channelUrl: route.params?.channelUrl || '',
                  },
                );
              }}
            />
            <ButtonModalTabs
              Icon={IconTabUser}
              iconProps={{
                stroke: colors.neutral[800],
                strokeWidth: 2.5,
              }}
              label={'Members'}
              onPress={() => {
                navigation.navigate(
                  PATHS_MESSAGES_TAB.messagesTabMembersGroup,
                  {
                    channelUrl: route.params?.channelUrl || '',
                  },
                );
              }}
            />
            <ButtonModalTabs
              Icon={IconLockProfile}
              iconProps={{
                stroke: colors.error[500],
                strokeWidth: 2.5,
              }}
              label={'Leave group'}
              onPress={onLeaveGroup}
              isRightArrow={false}
              styleContainer={styles.blockUserButton}
              styleLabel={styles.labelBlockUserButton}
            />
          </View>
        </View>
      </BackgroundScreen>
    </>
  );
};

export default MessagesTabDetailsGroup;
