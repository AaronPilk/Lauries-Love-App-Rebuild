import React, { FunctionComponent, useMemo } from 'react';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import colors from 'styles/colors';
import styles from './ListChannelsMessageTab.styles';
import AvatarMessagesTab from '../AvatarMessagesTab/AvatarMessagesTab';
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';
import {
  IconMessagesNotGroup,
  IconPlus,
  IconPlusCircle,
} from 'assets/icons-auto/components';

type ListChannelsMessageTabProps = {
  title?: string;
  channels: GroupChannel[];
  onSelect: (id: string) => void;
  isFullHeight?: boolean;
  isLoading?: boolean;
  onPressCreateGroup: () => void;
  handleScrollDown?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Extra channel urls to render as already joined (e.g. just-joined). */
  joinedUrls?: string[];
};

type ChannelItemRowProps = {
  channel: GroupChannel;
  isJoined: boolean;
  isLast: boolean;
  onSelect: (id: string) => void;
};

// Memoized row: membership check is done once in the parent and unchanged
// rows skip re-rendering when the list re-renders.
const ChannelItemRow = React.memo<ChannelItemRowProps>(
  ({ channel, isJoined, isLast, onSelect }) => (
    <View>
      <View style={styles.userContainer}>
        <AvatarMessagesTab imageUrl={channel.coverUrl} width={47} height={47} />
        <Text numberOfLines={1} style={styles.userName}>
          {channel.name}
        </Text>
        <TouchableOpacity
          disabled={isJoined}
          style={[styles.buttonJoinGroup, isJoined && styles.joined]}
          onPress={() => onSelect(channel.url)}
        >
          <Text style={styles.buttonJoinGroupText}>
            {isJoined ? 'Joined' : 'Join'}
          </Text>
          {!isJoined && <IconPlusCircle width={18} height={18} />}
        </TouchableOpacity>
      </View>
      {!isLast && (
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
        </View>
      )}
    </View>
  ),
);

const ListChannelsMessageTab: FunctionComponent<
  ListChannelsMessageTabProps
> = ({
  title = 'Suggested Groups to join',
  channels,
  onSelect,
  isFullHeight = false,
  isLoading = false,
  onPressCreateGroup,
  handleScrollDown,
  joinedUrls,
}) => {
  const { sdk } = useSendbirdChat();
  const { userChat } = useSendbirdChatProvider();

  // Sendbird identity in legacy mode; Supabase profile id otherwise.
  const currentUserId = sdk.currentUser?.userId ?? userChat?.userId ?? null;

  const Layout = useMemo(
    () => (isFullHeight ? View : ScrollView),
    [isFullHeight],
  );

  return (
    <Layout style={styles.mainListContainer} onScroll={handleScrollDown}>
      <View style={styles.mainList}>
        <Text style={styles.titleMainList}>{title}</Text>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={colors.primary[600]} />
          </View>
        ) : channels.length === 0 ? (
          <View style={styles.notGroupContainer}>
            <IconMessagesNotGroup width={84} height={84} />
            <View style={styles.notGroupTextContainer}>
              <Text style={styles.notGroupText}>No public groups yet</Text>
              <Text style={styles.notGroupSubText}>
                Create a new public group and start sharing your story
              </Text>
            </View>
            <TouchableOpacity
              style={styles.buttonCreateGroup}
              onPress={onPressCreateGroup}
            >
              <IconPlus
                width={20}
                height={20}
                stroke={colors.white}
                strokeWidth={1.6}
              />
              <Text style={styles.buttonCreateGroupText}>Create new group</Text>
            </TouchableOpacity>
          </View>
        ) : (
          channels.map((channel, index) => (
            <ChannelItemRow
              key={index}
              channel={channel}
              isJoined={
                (joinedUrls?.includes(channel.url) ?? false) ||
                (channel.members ?? []).some(
                  member => member.userId === currentUserId,
                )
              }
              isLast={index === channels.length - 1}
              onSelect={onSelect}
            />
          ))
        )}
      </View>
    </Layout>
  );
};

export default ListChannelsMessageTab;
