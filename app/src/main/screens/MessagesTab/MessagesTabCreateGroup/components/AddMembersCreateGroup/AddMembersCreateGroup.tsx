import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Image,
  ScrollView,
} from 'react-native';

// types
import {
  GroupChannelSendBirdType,
  UserSendBirdType,
} from 'providers/ChatProvider/ChatProvider.types';

// components
import ListFriendsMessageTab from 'main/screens/MessagesTab/components/ListFriendsMessageTab/ListFriendsMessageTab';
import InputSearch from 'components/InputSearch/InputSearch';

// icons
import { IconClose } from 'assets/icons-auto/components';

// styles
import styles from './AddMembersCreateGroup.styles';
import colors from 'styles/colors';
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { useChatProvider } from 'providers/ChatProvider/ChatProvider';

type AddMembersCreateGroupProps = {
  selectUsers: UserSendBirdType[];
  setSelectUsers: (selectUser: UserSendBirdType) => void;
};

type FriendWithStatus = UserSendBirdType & {
  status?: 'pending' | 'accepted' | undefined;
};

const AddMembersCreateGroup: FunctionComponent<AddMembersCreateGroupProps> = ({
  selectUsers,
  setSelectUsers,
}) => {
  const { friends: providerFriends, groupChannels } = useChatProvider();
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [limit, setLimit] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [myChannels, setMyChannels] = useState<GroupChannelSendBirdType[]>([]);

  // Search filtering happens locally: fetching friends (plus one status
  // request per friend) on every keystroke is unnecessary network work.
  const filteredFriends = useMemo(
    () =>
      friends.filter(
        friend =>
          friend.nickname.toLowerCase().includes(searchText.toLowerCase()) &&
          friend.status !== 'pending',
      ),
    [friends, searchText],
  );

  const frequentlyContacted = useMemo(
    () =>
      filteredFriends
        .filter(friend =>
          myChannels.some(channel =>
            channel.members.some(member => member.userId === friend.userId),
          ),
        )
        .slice(0, 5),
    [filteredFriends, myChannels],
  );

  const getMyChannels = async () => {
    if (SUPABASE_ENABLED) {
      // Provider cache already holds my conversations/groups (plain objects).
      setMyChannels(groupChannels as GroupChannelSendBirdType[]);
      return;
    }
  };

  const getFriends = async () => {
    if (SUPABASE_ENABLED) {
      // Friends come from the provider (accepted friendships, legacy-shaped).
      setFriends(
        (providerFriends ?? []).map(
          f => ({ ...f, status: 'accepted' }) as FriendWithStatus,
        ),
      );
      return;
    }
  };

  const handleScrollDown = ({
    nativeEvent: { layoutMeasurement, contentOffset, contentSize },
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const paddingToBottom = 20;
    const isEnd =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
    if (filteredFriends.length >= limit && isEnd) setLimit(limit + 20);
  };

  useEffect(() => {
    getFriends();
  }, [limit, providerFriends]);

  useEffect(() => {
    getMyChannels();
  }, [groupChannels.length]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <InputSearch
          placeholder={'Search name'}
          search={searchText}
          setSearch={setSearchText}
          styleContainer={styles.search}
          onClear={() => setSearchText('')}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.cancel}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      {selectUsers.length > 0 && (
        <View style={styles.selectedMembersContainer}>
          <View style={styles.groupNameContainer}>
            <View style={styles.background} />
            <View style={styles.listMembers}>
              {selectUsers.map(selectFriend => (
                <View
                  key={`selected-member-${selectFriend.userId}`}
                  style={styles.member}
                >
                  <View style={styles.memberImageContainer}>
                    {selectFriend.plainProfileUrl &&
                    selectFriend.plainProfileUrl.length > 0 ? (
                      <Image
                        source={{
                          uri: selectFriend.plainProfileUrl,
                        }}
                        style={styles.memberImage}
                      />
                    ) : (
                      <View style={styles.avatarLetterContainer}>
                        <Text style={styles.avatarLetter}>
                          {selectFriend.nickname.split(' ')[0][0] ||
                            selectFriend.userId[0]}
                          {selectFriend.nickname.split(' ')[1]?.[0] || ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeMember}
                    onPress={() => setSelectUsers(selectFriend)}
                  >
                    <IconClose
                      width={14}
                      height={14}
                      stroke={colors.white}
                      strokeWidth={2}
                    />
                  </TouchableOpacity>
                  <Text numberOfLines={1} style={styles.memberName}>
                    {selectFriend.nickname}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.lists}
        onScroll={handleScrollDown}
      >
        {frequentlyContacted.length > 0 && (
          <ListFriendsMessageTab
            title={'Frequently contacted'}
            friends={frequentlyContacted}
            onSelect={setSelectUsers}
            isFullHeight
            selectedUsers={selectUsers}
          />
        )}
        <ListFriendsMessageTab
          title={'All friends'}
          titleEmptyList={'No friends found'}
          friends={filteredFriends}
          onSelect={setSelectUsers}
          selectedUsers={selectUsers}
          isFullHeight
        />
      </ScrollView>
    </View>
  );
};

export default AddMembersCreateGroup;
