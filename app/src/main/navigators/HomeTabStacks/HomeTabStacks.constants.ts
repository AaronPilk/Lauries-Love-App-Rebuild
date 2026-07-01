// types
import { RootHomeTabParamList } from './HomeTabStacks.types';

// screens
import HomeTabMain from 'main/screens/HomeTab/HomeTabMain/HomeTabMain';
import HomeTabCreatePost from 'main/screens/HomeTab/HomeTabCreatePost/HomeTabCreatePost';
import HomeTabPost from 'main/screens/HomeTab/HomeTabPost/HomeTabPost';
import HomeTabTaraDetails from 'main/screens/HomeTab/HomeTabTaraDetails/HomeTabTaraDetails';
import NotificationsScreen from 'main/screens/Notifications/notifications.screen';

// constants
import { PATHS_HOME_TAB } from '../paths';

export const LIST_HOME_TAB_SCREENS: Array<{
  id: keyof RootHomeTabParamList;
  name: keyof RootHomeTabParamList;
  title: keyof RootHomeTabParamList;
  component: React.ComponentType<any>;
  headerShown: boolean;
  gestureEnabled?: boolean;
}> = [
  {
    id: PATHS_HOME_TAB.homeTabMain,
    name: PATHS_HOME_TAB.homeTabMain,
    title: PATHS_HOME_TAB.homeTabMain,
    component: HomeTabMain,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_HOME_TAB.homeTabCreatePost,
    name: PATHS_HOME_TAB.homeTabCreatePost,
    title: PATHS_HOME_TAB.homeTabCreatePost,
    component: HomeTabCreatePost,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_HOME_TAB.homeTabTaraDetails,
    name: PATHS_HOME_TAB.homeTabTaraDetails,
    title: PATHS_HOME_TAB.homeTabTaraDetails,
    component: HomeTabTaraDetails,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_HOME_TAB.homeTabPost,
    name: PATHS_HOME_TAB.homeTabPost,
    title: PATHS_HOME_TAB.homeTabPost,
    component: HomeTabPost,
    headerShown: false,
    gestureEnabled: false,
  },
  {
    id: PATHS_HOME_TAB.homeTabNotifications,
    name: PATHS_HOME_TAB.homeTabNotifications,
    title: PATHS_HOME_TAB.homeTabNotifications,
    component: NotificationsScreen,
    headerShown: false,
    gestureEnabled: false,
  },
];
