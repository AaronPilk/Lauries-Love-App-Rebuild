import { Role, UserOnlineState } from '@sendbird/chat';
import { BaseMessageSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

export const DEFAULT_COMMENT_POST = {
  messageId: new Date().getTime(),
  message: '',
  createdAt: new Date().getTime(),
  sender: {
    role: Role.OPERATOR,
    isBlockedByMe: false,
    userId: '',
    requireAuth: false,
    nickname: '',
    plainProfileUrl: '',
    metaData: {},
    connectionStatus: UserOnlineState.ONLINE,
    isActive: false,
    lastSeenAt: null,
    preferredLanguages: null,
    friendDiscoveryKey: null,
    friendName: null,
    profileUrl: '',
    serialize: () => ({}),
    createMetaData: (): Promise<object> => {
      throw new Error('Function not implemented.');
    },
    updateMetaData: (): Promise<object> => {
      throw new Error('Function not implemented.');
    },
    deleteMetaData: (): Promise<object> => {
      throw new Error('Function not implemented.');
    },
    deleteAllMetaData: () => {
      throw new Error('Function not implemented.');
    },
  },
  reactions: [],
} as unknown as BaseMessageSendBirdType;
