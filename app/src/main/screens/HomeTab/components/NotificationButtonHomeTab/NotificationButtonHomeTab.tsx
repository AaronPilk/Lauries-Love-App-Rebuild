import React, { FunctionComponent, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// types
import { RootHomeTabParamList } from 'main/navigators/HomeTabStacks/HomeTabStacks.types';

// icons
import { IconBellStroke } from 'assets/icons-auto/components';

// constants
import { PATHS_HOME_TAB } from 'main/navigators/paths';

// styles
import styles from './NotificationButtonHomeTab.styles';
import { makeAxiosHttpClient } from 'main/factories/http';
import { appConfig } from 'main/config/app.config';
import { Notification } from 'data/models';
import { useFocusEffect } from '@react-navigation/native';

type NotificationButtonHomeTabProps = {
  navigation: NativeStackNavigationProp<RootHomeTabParamList>;
};

const NotificationButtonHomeTab: FunctionComponent<
  NotificationButtonHomeTabProps
> = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useFocusEffect(() => {
    getNotifications();
  });

  async function getNotifications() {
    try {
      const response = await makeAxiosHttpClient().request({
        url: `${appConfig.apiUrl}/notifications`,
        method: 'get',
      });

      const notifications = (response.body.data as Notification[]).filter(
        item => item.active,
      );

      setUnreadCount(notifications.length);
    } catch (error) {
      throw new Error(`Error getting notifications: ${error}`);
    }
  }

  function handlePress() {
    navigation.navigate(PATHS_HOME_TAB.homeTabNotifications);
  }

  return (
    <TouchableOpacity onPress={handlePress} style={styles.bellIconContainer}>
      <View style={styles.bellIcon}>
        <IconBellStroke width={24} height={24} />
      </View>
      {unreadCount > 0 && (
        <View style={styles.unreadCountContainer}>
          <Text style={styles.unreadCountText}>{unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default NotificationButtonHomeTab;
