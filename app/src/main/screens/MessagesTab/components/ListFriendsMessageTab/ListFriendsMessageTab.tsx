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
import { UserSendBirdType } from 'providers/ChatProvider/ChatProvider.types';

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

type FriendRowProps = {
  user: UserSendBirdType;
  isSelected: boolean;
  hasSelectedUsers: boolean;
  isFriends?: boolean;
  isLast: boolean;
  onSelect: (selectUser: UserSendBirdType) => void;
};

// Memoized row: selection lookup is computed once per item instead of five
// times, and unchanged rows skip re-rendering when the list re-renders.
const FriendRow = React.memo<FriendRowProps>(
  ({ user, isSelected, hasSelectedUsers, isFriends, isLast, onSelect }) => (
    <View>
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
        <Text style={styles.userName}>{user.nickname || user.userId}</Text>
        {hasSelectedUsers && !isFriends ? (
          <View
            style={[
              styles.checkboxContainer,
              isSelected && styles.checkboxContainerSelected,
            ]}
          >
            {isSelected ? (
              <IconCheckbox width={16} height={16} />
            ) : (
              <View style={styles.checkHide} />
            )}
          </View>
        ) : hasSelectedUsers && isFriends ? (
          <View
            style={[
              styles.checkboxContainer,
              isSelected && styles.checkboxContainerSelected,
              isFriends && styles.checkboxContainerFriends,
              isFriends && isSelected && styles.checkboxContainerSelectedFriends,
            ]}
          >
            {isSelected ? (
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
      {!isLast && (
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
        </View>
      )}
    </View>
  ),
);

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
            <FriendRow
              key={index}
              user={user}
              isSelected={
                !!selectedUsers?.some(
                  selectedUser => selectedUser.userId === user.userId,
                )
              }
              hasSelectedUsers={selectedUsers !== undefined}
              isFriends={isFriends}
              isLast={index === friends.length - 1}
              onSelect={onSelect}
            />
          ))
        ) : titleEmptyList ? (
          <Text style={styles.titleEmptyList}>{titleEmptyList}</Text>
        ) : null}
      </View>
    </Layout>
  );
};

export default ListFriendsMessageTab;
