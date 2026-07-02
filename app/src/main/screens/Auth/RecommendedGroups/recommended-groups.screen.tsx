import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useIntercom } from 'providers/IntercomProvider/IntercomProvider';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';
import useAuth from '../useAuth';
import { useSendBirdPostsProvider } from 'providers/SendBirdPostsProvider/SendBirdPostsProvider';

// components
import Button from 'components/Button/Button';
import Progress from 'components/Progress/Progress';
import GroupChannelCardCheckbox from 'main/screens/MessagesTab/components/GroupChannelCardCheckbox/GroupChannelCardCheckbox';

// styles
import colors from 'styles/colors';
import { styles } from './recommended-groups.styles';
import { GroupChannel } from '@sendbird/chat/groupChannel';
import { useDBProvider } from 'providers/DBProvider/DBProvider';
import { IconArrowLeft } from 'assets/icons-auto/components';
import { MOCK_ENABLED } from 'mocks/mock.config';
import { joinMockGroup } from 'mocks/mock.sendbird';

export default function RecommendedGroupsScreen() {
  const { sdk } = useSendbirdChat();
  const { userDB } = useUserDBProvider();
  const { trackIntercom } = useIntercom();
  const { onPressBack } = useAuth();
  const navigation = useNavigation();
  const {
    db: { diagnosisType },
  } = useDBProvider();
  const { getFilteringUserInfo } = useSendBirdPostsProvider();
  const [channels, setChannels] = useState<GroupChannel[]>([]);
  const [selected, setSelected] = useState<Record<string | number, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const toggleSelection = (channelUrl: string | number) => {
    setSelected(prev => ({
      ...prev,
      [channelUrl]: !prev[channelUrl],
    }));
  };

  const getRecommendedGroups = async () => {
    setLoading(true);
    try {
      const allChannels = await getFilteringUserInfo();
      setChannels(allChannels ?? []);
    } catch (error) {
      console.warn('Error fetching recommended groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinAndContinue = async () => {
    setJoining(true);
    try {
      for (const ch of channels) {
        if (selected[ch.url]) {
          if (MOCK_ENABLED) {
            joinMockGroup(ch.url); // registers so Groups/Messages show it
          } else {
            const channel = await sdk.groupChannel.getChannel(ch.url);
            await channel.join();
          }
        }
      }
    } catch (e) {
      // Rebuild fix: a failed join no longer strands the user on this screen —
      // we log it and continue to the app either way.
      if (__DEV__) console.warn('Join error', e);
    } finally {
      navigation.navigate('Authentication', {
        screen: 'login',
      });
      setJoining(false);
      trackIntercom('onboarding_completed');
    }
  };

  function handleSkip() {
    try {
      navigation.navigate('Authentication', { screen: 'login' });
    } catch (error) {
      if (__DEV__) console.warn('Skip error', error);
    } finally {
      trackIntercom('onboarding_completed');
    }
  }

  useEffect(() => {
    getRecommendedGroups();
  }, []);

  return (
    <LinearGradient
      colors={[
        'rgba(255, 227, 195, 0.70)',
        colors.neutral[100],
        colors.secondary[300],
      ]}
      locations={[0, 0.4, 1]}
      style={styles.linearGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <ScrollView
            // Rebuild fix: was scrollEnabled={false} — with more than ~4
            // recommended groups the list overflowed and couldn't scroll.
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={styles.contentContainer}>
              <View style={styles.topSection}>
                <Progress value={100} />
                <TouchableOpacity
                  onPress={onPressBack}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <IconArrowLeft
                    width={30}
                    height={30}
                    stroke={colors.neutral[1000]}
                  />
                </TouchableOpacity>
                <Text style={styles.title}>Recommended Groups</Text>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color={colors.primary[600]} />
              ) : (
                <View style={styles.listWrapper}>
                  {channels.map(channel => (
                    <GroupChannelCardCheckbox
                      key={channel.url}
                      channel={channel}
                      isSelected={!!selected[channel.url]}
                      toggleSelected={() => toggleSelection(channel.url)}
                    />
                  ))}
                  {(userDB?.diagnosisTypes ?? [])
                    .map(id => {
                      const match = diagnosisType.find(d => d.id === id);
                      return match?.description?.toLowerCase();
                    })
                    .some(
                      type => type === 'no preference' || type === 'other',
                    ) && (
                    <Text style={styles.infoText}>
                      Cancer type not specified, you can join later to a group
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title={joining ? 'Joining...' : 'Join Selected & Continue'}
                  onPress={handleJoinAndContinue}
                  disabled={joining}
                />
                <TouchableOpacity onPress={handleSkip}>
                  <Text style={styles.skipText}>Skip this step</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </LinearGradient>
  );
}
