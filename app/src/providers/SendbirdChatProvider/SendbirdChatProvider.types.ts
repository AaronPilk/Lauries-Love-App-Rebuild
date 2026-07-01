import { User } from '@sendbird/chat';
import { GroupChannel, Member } from '@sendbird/chat/groupChannel';
import { BaseMessage, Sender } from '@sendbird/chat/message';

export type MetaDataUserSendBirdType = {
  profileUrlAWS?: string;
  age?: string;
  gender?: string;
  city?: string;
  country?: string;
  state?: string;
  userInfo?: string;
  id?: string;
  cognitoId?: string;
};

export type UserSendBirdType = User & {
  metaData: MetaDataUserSendBirdType;
  isBlockedByMe: boolean;
  isBlockingMe: boolean;
};

export type MemberSendBirdType = Member & {
  metaData: MetaDataUserSendBirdType;
};

export type GroupChannelSendBirdType = GroupChannel & {
  members: Array<MemberSendBirdType>;
  cachedMetaData: {
    type?: 'post' | 'chat' | 'group' | 'delete' | 'recommendation';
  };
  amountMessage?: number;
  amountReaction?: number;
  lastMessage?: BaseMessageSendBirdType;
};

export type PostSendBirdType = {
  _cachedMetaData?: Map<
    string,
    { isRemoved: boolean; updatedAt: number; value: string }
  >;
  creator?: {
    userId: string;
    nickname?: string;
    plainProfileUrl?: string;
  };
  url: string;
  createdAt: number;
  lastMessage?: {
    sender?: {
      metaData?: {
        id?: string;
      };
    };
  };
};

export type BaseMessageSendBirdType = BaseMessage & {
  sender?: Sender;
  url?: string;
  type?: string;
  name?: string;
  size?: number;
};
