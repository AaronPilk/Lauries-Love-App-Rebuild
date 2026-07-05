import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';
import { ImagePickerAsset } from 'expo-image-picker';
import { useSendbirdChat } from 'services/legacy-chat.shim';

// types
import { RootMessagesTabParamList } from 'main/navigators/MessagesTabStacks/MessagesTabStacks.types';

// providers
import { useSendbirdChatProvider } from 'providers/SendbirdChatProvider/SendbirdChatProvider';

// components
import BackgroundScreen from 'components/BackgroundScreen/BackgroundScreen';
import HeaderCreateGroup from './components/HeaderCreateGroup/HeaderCreateGroup';
import AddMembersCreateGroup from './components/AddMembersCreateGroup/AddMembersCreateGroup';
import NewGroupCreateGroup from './components/NewGroupCreateGroup/NewGroupCreateGroup';
import GroupImageModal from '../components/GroupImageModal/GroupImageModal';

// backend v2
import { SUPABASE_ENABLED } from 'services/supabase/backend.config';
import { createGroup as createGroupSupabase } from 'services/supabase/supabase.social';

// constants
import { DEFAULT_NEW_GROUP } from './MessagesTabCreateGroup.constants';
import { PATHS_MESSAGES_TAB } from 'main/navigators/paths';

// styles
import styles from './MessagesTabCreateGroup.styles';
import { UserSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

const WIDTH = Dimensions.get('window').width;

type MessagesTabCreateGroupProps = {
  navigation: NativeStackNavigationProp<RootMessagesTabParamList>;
};

const MessagesTabCreateGroup: FunctionComponent<
  MessagesTabCreateGroupProps
> = ({ navigation }) => {
  const { sdk } = useSendbirdChat();
  const { getChannels } = useSendbirdChatProvider();
  const [selectedTab, setSelectedTab] = useState(0);
  const [newGroup, setNewGroup] = useState(DEFAULT_NEW_GROUP);
  const [isShowImageModal, setIsShowImageModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateGroup, setIsCreateGroup] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const titleHeader = useMemo(
    () => (selectedTab === 0 ? 'Add Members' : 'New Group'),
    [selectedTab],
  );


  const scrollTo = () => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({ x: selectedTab * WIDTH, animated: true });
  };

  const onSelect = (selectUser: UserSendBirdType) => {
    const isSelect = newGroup.members.some(
      member => member.userId === selectUser.userId,
    );
    if (isSelect)
      setNewGroup(state => ({
        ...state,
        members: state.members.filter(
          member => member.userId !== selectUser.userId,
        ),
      }));
    else
      setNewGroup(state => ({
        ...state,
        members: [...state.members, selectUser],
      }));
  };

  const createGroup = async () => {
    try {
      if (
        !sdk ||
        !newGroup.name ||
        !newGroup.permissions ||
        isLoading
      ) {
        setIsCreateGroup(false);
        return;
      }

      setIsLoading(true);

      if (SUPABASE_ENABLED) {
        // Supabase mode: one atomic RPC creates the group + memberships
        // (caller becomes admin). Selected members are UserSendBirdType —
        // metaData.id carries the profile id (userId equals it in Supabase
        // mode, so it's a safe fallback). Cover image upload is legacy-only.
        const memberIds = newGroup.members.map(
          member => member.metaData?.id || member.userId,
        );
        const supabaseChannel = await createGroupSupabase(newGroup.name, {
          memberIds,
        });
        await getChannels();
        navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChatGroup, {
          channelUrl: supabaseChannel.url,
        });
        return; // `finally` still clears the loading/create flags
      }

      const userIds = newGroup.members.map(member => member.userId);
      const image = newGroup.image
        ? {
            uri: newGroup.image,
            name:
              newGroup.image.split('/').pop() ||
              `image-group.${newGroup.image.split('.').pop()}`,
            type: `image/${newGroup.image.split('.').pop()}`,
          }
        : undefined;
      const channel =
        newGroup.permissions === 'public'
          ? await sdk.groupChannel.createChannel({
              isPublic: true,
              isDiscoverable: true,
              isEphemeral: false,
              name: newGroup.name,
              data: JSON.stringify({
                type: 'post',
              }),
              invitedUserIds: userIds,
              coverImage: image,
            })
          : await sdk.groupChannel.createChannelWithUserIds(
              userIds,
              false,
              newGroup.name,
              image,
              JSON.stringify({
                type: newGroup.permissions,
                isPrivate: newGroup.permissions === 'private',
              }),
            );
      await channel.createMetaData({
        type: 'group',
      });
      getChannels();

      navigation.navigate(PATHS_MESSAGES_TAB.messagesTabChatGroup, {
        channelUrl: channel.url,
      });
    } catch (error) {
      if (__DEV__) console.warn('error', error);
    } finally {
      setIsLoading(false);
      setIsCreateGroup(false);
    }
  };

  useEffect(() => {
    scrollTo();
  }, [selectedTab]);

  useEffect(() => {
    if (isCreateGroup) createGroup();
  }, [isCreateGroup]);

  return (
    <>
      <PaperProvider>
        <BackgroundScreen type="messages">
          <HeaderCreateGroup
            title={titleHeader}
            labelRight={
              selectedTab === 0 ? 'Next' : isLoading ? 'Creating...' : 'Create'
            }
            onPressRight={() => {
              if (selectedTab === 0) setSelectedTab(1);
              else setIsCreateGroup(true);
            }}
            isRightDisabled={isLoading || isCreateGroup}
            onPressLeft={() => {
              if (selectedTab === 0) navigation.goBack();
              else setSelectedTab(0);
            }}
          />
          <ScrollView
            ref={scrollRef}
            horizontal
            scrollEnabled={false}
            style={styles.container}
            contentContainerStyle={styles.container}
          >
            <AddMembersCreateGroup
              selectUsers={newGroup.members}
              setSelectUsers={onSelect}
            />
            <NewGroupCreateGroup
              newGroup={newGroup}
              setNewGroup={setNewGroup}
              setIsShowImageModal={setIsShowImageModal}
            />
          </ScrollView>
        </BackgroundScreen>
      </PaperProvider>
      {isShowImageModal && (
        <GroupImageModal
          onClose={() => setIsShowImageModal(false)}
          onSubmittedImage={(image: ImagePickerAsset) => {
            setNewGroup(state => ({
              ...state,
              image: image.uri,
            }));
            setIsShowImageModal(false);
          }}
        />
      )}
    </>
  );
};

export default MessagesTabCreateGroup;
