import { PATHS_MESSAGES_TAB } from '../paths';

export type RootMessagesTabParamList = {
  [PATHS_MESSAGES_TAB.messagesTabMain]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_MESSAGES_TAB.messagesTabCreateChat]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_MESSAGES_TAB.messagesTabChat]?: Record<
    string,
    string | number | boolean
  > & { channelUrl: string };
  [PATHS_MESSAGES_TAB.messagesTabDetails]?: Record<
    string,
    string | number | boolean
  > & {
    cognitoId: string;
    userId: string;
    channelUrl: string;
  };
  [PATHS_MESSAGES_TAB.messagesTabCreateGroup]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_MESSAGES_TAB.messagesTabChatGroup]?: Record<
    string,
    string | number | boolean
  > & { channelUrl: string };
  [PATHS_MESSAGES_TAB.messagesTabDetailsGroup]?: Record<
    string,
    string | number | boolean
  > & {
    channelUrl: string;
  };
  [PATHS_MESSAGES_TAB.messagesTabMediaAndDocs]?: Record<
    string,
    string | number | boolean
  > & {
    channelUrl: string;
  };
  [PATHS_MESSAGES_TAB.messagesTabJoinGroup]?: Record<
    string,
    string | number | boolean
  >;
  [PATHS_MESSAGES_TAB.messagesTabMembersGroup]?: Record<
    string,
    string | number | boolean
  > & {
    channelUrl: string;
  };
  Notifications?: undefined;
  [PATHS_MESSAGES_TAB.messagesTabProfile]?: Record<
    string,
    string | number | boolean
  > & {
    cognitoId: string;
    userId: string;
  };
};
