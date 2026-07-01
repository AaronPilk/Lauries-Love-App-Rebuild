import { ScrollView, View } from 'react-native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import colors from 'styles/colors';
import styles from './MessagesTabJoinGroup.styles';
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import InputSearch from 'components/InputSearch/InputSearch';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';
import { useIntercom } from 'providers/IntercomProvider/IntercomProvider';
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import ListChannelsMessageTab from '../components/ListChannelsMessageTab/ListChannelsMessageTab';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';
import { GroupChannelSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';

type MessagesTabJoinGroupProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabJoinGroup: FunctionComponent<MessagesTabJoinGroupProps> = ({
  navigation,
}) => {
  const { sdk } = useSendbirdChat();
  const { trackIntercom } = useIntercom();
  const [search, setSearch] = useState('');
  const [channels, setChannels] = useState<GroupChannelSendBirdType[]>([]);
  const [recommendedChannels, setRecommendedChannels] = useState<
    GroupChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const { getFilteringUserInfo } = useSendBirdPostsProvider();

  const getChannelsHandler = async () => {
    const queryPublic = sdk.groupChannel.createPublicGroupChannelListQuery({
      includeEmpty: true,
      limit: 50,
      channelNameContainsFilter: search,
      metadataKey: 'type',
      metadataValues: ['group'],
    });
    setLoading(true);
    try {
      const channelsBatch =
        (await queryPublic.next()) as GroupChannelSendBirdType[];
        
      if (!channelsBatch.length) throw new Error('No channels found');

      const filteredChannels = channelsBatch.filter(
        channel => channel.cachedMetaData?.type === 'group',
      );

      setChannels(filteredChannels);
    } catch (error) {
      if (__DEV__) console.warn('getChannelsHandler', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedChannelsHandler = async () => {
    try {
      const allChannels = await getFilteringUserInfo();
      setRecommendedChannels(allChannels ?? []);
    } catch (error) {
      if (__DEV__) console.warn('getChannelsHandler', error);
    } finally {
      setLoading(false);
    }
  };

  const onPressJoinGroup = async (channelUrl: string) => {
    try {
      const channel = await sdk.groupChannel.getChannel(channelUrl);
      if (!channel) return;

      const data = JSON.parse(channel.data ?? '{}') as { isPrivate?: boolean };
      const isPrivate = data.isPrivate ?? false;
      if (isPrivate) return;

      const result = await channel.join();
      if (!result) return;

      trackIntercom('join_group');

      navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChatGroup, {
        channelUrl: channel.url,
      });
    } catch (error) {
      if (__DEV__) console.warn('onPressJoinGroup', error);
    }
  };

  useEffect(() => {
    getChannelsHandler();
    getRecommendedChannelsHandler();
  }, [search]);

  return (
    <BackgroundScreen type="messages">
      <HeaderTabScreen
        title="Join Group"
        onPressLeft={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.searchContainer}>
          <InputSearch
            search={search}
            setSearch={setSearch}
            placeholder={'Search group'}
            styleContainer={styles.inputSearchContainer}
            styleInput={styles.inputSearch}
            iconProps={{ width: 24, height: 24, strokeWidth: 2.1 }}
            placeholderTextColor={colors.neutral[600]}
          />
        </View>
        <View>
          <ListChannelsMessageTab
            channels={recommendedChannels}
            onSelect={onPressJoinGroup}
            isLoading={loading}
            onPressCreateGroup={() =>
              navigation.navigate(PATHS_MESSAGES_TAB.messagesTabCreateGroup)
            }
          />
        </View>
        <View>
          <ListChannelsMessageTab
            title="Other Groups chats"
            channels={channels}
            onSelect={onPressJoinGroup}
            isLoading={loading}
            onPressCreateGroup={() =>
              navigation.navigate(PATHS_MESSAGES_TAB.messagesTabCreateGroup)
            }
          />
        </View>
      </ScrollView>
    </BackgroundScreen>
  );
};

export default MessagesTabJoinGroup;
