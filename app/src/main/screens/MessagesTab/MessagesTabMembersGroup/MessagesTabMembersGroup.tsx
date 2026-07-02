import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
} from 'react-native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { FriendListQuery } from '@sendbird/chat';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';

// types
import {
  GroupChannelSendBirdType,
  UserSendBirdType,
} from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import ListFriendsMessageTab from '../components/ListFriendsMessageTab/ListFriendsMessageTab';
import HeaderTabScreen from 'components/HeaderTabScreen/HeaderTabScreen';

// styles
import styles from './MessagesTabMembersGroup.styles';

type MessagesTabMembersGroupProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabMembersGroup: FunctionComponent<
  MessagesTabMembersGroupProps
> = ({ navigation }) => {
  const route =
    useRoute<
      RouteProp<RootMessagesTabParamList, 'messages-tab-members-group'>
    >();
  const { sdk } = useSendbirdChat();
  const [channel, setChannel] = useState<GroupChannelSendBirdType | null>(null);
  const [friends, setFriends] = useState<UserSendBirdType[]>([]);
  const [limit, setLimit] = useState(20);

  const members = useMemo(
    () =>
      channel?.members.filter(
        member => member.userId !== sdk.currentUser?.userId,
      ) || [],
    [channel],
  );

  const getFriends = async () => {
    const friendListQuery = sdk.createFriendListQuery({
      limit,
    });
    try {
      const friends = (await friendListQuery.next()) as UserSendBirdType[];
      setFriends(friends);
    } catch (error) {
      if (__DEV__) console.warn('Error getting friends', error);
    }
  };

  const getCurrentChannel = async () => {
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

  const addFriend = async (userId: string) => {
    try {
      await sdk.addFriends([userId]);
      getFriends();
    } catch (error) {
      if (__DEV__) console.warn('Error adding friend', error);
    }
  };

  const handleScrollDown = ({
    nativeEvent: { layoutMeasurement, contentOffset, contentSize },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const paddingToBottom = 20;
    const isEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (members.length >= limit && isEnd) setLimit(limit + 20);
  };

  useEffect(() => {
    getFriends();
  }, [limit]);

  // The channel does not depend on the friends pagination limit — fetch once.
  useEffect(() => {
    getCurrentChannel();
  }, []);

  return (
    <BackgroundScreen type="messages">
      <View style={styles.container}>
        <HeaderTabScreen
          title="Members"
          onPressLeft={() => navigation.goBack()}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lists}
          onScroll={handleScrollDown}
        >
          <ListFriendsMessageTab
            title={'Frequently contacted'}
            friends={members}
            onSelect={selectedFriend => addFriend(selectedFriend.userId)}
            isFullHeight
            selectedUsers={friends}
            isFriends
          />
        </ScrollView>
      </View>
    </BackgroundScreen>
  );
};

export default MessagesTabMembersGroup;
