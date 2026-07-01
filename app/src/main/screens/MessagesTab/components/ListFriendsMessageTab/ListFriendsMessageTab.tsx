import React, { FunctionComponent, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

// types
import { UserSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

// components
import AvatarMessagesTab from '../AvatarMessagesTab/AvatarMessagesTab';

// icons
import { IconCheckbox, IconPlusCircle } from 'assets/icons-auto/components';

// styles
import styles from './ListFriendsMessageTab.styles';

type ListFriendsMessageTabProps = {
  title: string;
  titleEmptyList?: string | null;
  friends: UserSendBirdType[];
  onSelect: (selectUser: UserSendBirdType) => void;
  isFullHeight?: boolean;
  selectedUsers?: UserSendBirdType[];
  handleScrollDown?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isFriends?: boolean;
};

const ListFriendsMessageTab: FunctionComponent<ListFriendsMessageTabProps> = ({
  title = 'Suggested friends to message',
  titleEmptyList = null,
  friends,
  onSelect,
  isFullHeight = false,
  selectedUsers,
  handleScrollDown,
  isFriends,
}) => {
  const Layout = useMemo(
    () => (isFullHeight ? View : ScrollView),
    [isFullHeight],
  );

  return (
    <Layout style={styles.mainListContainer} onScroll={handleScrollDown}>
      <View style={styles.mainList}>
        <Text style={styles.titleMainList}>{title}</Text>
        {friends.length > 0 ? (
          friends.map((user, index) => (
            <View key={index}>
              <TouchableOpacity
                style={styles.userContainer}
                onPress={() => onSelect(user)}
              >
                {user.plainProfileUrl && user.plainProfileUrl.length > 0 ? (
                  <AvatarMessagesTab
                    imageUrl={user.plainProfileUrl}
                    width={47}
                    height={47}
                  />
                ) : (
                  <View style={styles.avatarContainer}>
                    <View style={styles.avatarLetterContainer}>
                      <Text style={styles.avatarLetter}>
                        {user.nickname[0] || user.userId[0]}
                      </Text>
                    </View>
                  </View>
                )}
                <Text style={styles.userName}>
                  {user.nickname || user.userId}
                </Text>
                {selectedUsers !== undefined && !isFriends ? (
                  <View
                    style={[
                      styles.checkboxContainer,
                      selectedUsers.some(
                        selectedUser => selectedUser.userId === user.userId,
                      ) && styles.checkboxContainerSelected,
                    ]}
                  >
                    {selectedUsers.some(
                      selectedUser => selectedUser.userId === user.userId,
                    ) ? (
                      <IconCheckbox width={16} height={16} />
                    ) : (
                      <View style={styles.checkHide} />
                    )}
                  </View>
                ) : selectedUsers && isFriends ? (
                  <View
                    style={[
                      styles.checkboxContainer,
                      selectedUsers.some(
                        selectedUser => selectedUser.userId === user.userId,
                      ) && styles.checkboxContainerSelected,
                      isFriends && styles.checkboxContainerFriends,
                      isFriends &&
                        selectedUsers.some(
                          selectedUser => selectedUser.userId === user.userId,
                        ) &&
                        styles.checkboxContainerSelectedFriends,
                    ]}
                  >
                    {selectedUsers.some(
                      selectedUser => selectedUser.userId === user.userId,
                    ) ? (
                      <Text style={styles.textSelected}>Friend</Text>
                    ) : (
                      <>
                        <Text style={styles.textSelectedAdd}>Add</Text>
                        <IconPlusCircle width={18} height={18} />
                      </>
                    )}
                  </View>
                ) : null}
              </TouchableOpacity>
              {index !== friends.length - 1 && (
                <View style={styles.separatorContainer}>
                  <View style={styles.separator} />
                </View>
              )}
            </View>
          ))
        ) : titleEmptyList ? (
          <Text style={styles.titleEmptyList}>{titleEmptyList}</Text>
        ) : null}
      </View>
    </Layout>
  );
};

export default ListFriendsMessageTab;
