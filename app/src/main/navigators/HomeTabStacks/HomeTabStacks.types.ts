import { PATHS_HOME_TAB } from '../paths';

export type RootHomeTabParamList = {
  [PATHS_HOME_TAB.homeTabMain]?: Record<string, string | number | boolean>;
  [PATHS_HOME_TAB.homeTabCreatePost]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_HOME_TAB.homeTabPost]?: Record<string, string | number | boolean> & {
    channelUrl: string;
    isNowOpenKeyboard: boolean;
    messageId?: string;
  };
  [PATHS_HOME_TAB.homeTabTaraDetails]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_HOME_TAB.homeTabNotifications]?: Record<
    string,
    string | number | boolean
  >;
};
