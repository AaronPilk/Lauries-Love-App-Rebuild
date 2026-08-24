// Local chat/feed types — Sendbird is GONE. These are structural equivalents
// of the old SDK shapes (the supabase + mock adapters emit plain objects in
// exactly these shapes), so the ~540-file screen layer compiles unchanged
// without a single @sendbird package installed.

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

// Chat identity (was: @sendbird/chat User)
export type UserSendBirdType = {
  userId: string;
  nickname: string;
  plainProfileUrl: string;
  profileUrl?: string;
  isActive: boolean;
  metaData: MetaDataUserSendBirdType;
  isBlockedByMe?: boolean;
  isBlockingMe?: boolean;
  connectionStatus?: string;
  lastSeenAt?: number | null;
  // legacy escape hatch: old SDK objects carried many more fields
  [key: string]: any;
};

// Conversation member (was: groupChannel Member)
export type MemberSendBirdType = UserSendBirdType & {
  role?: string;
  state?: string;
};

// Message (was: @sendbird/chat BaseMessage + Sender). File messages carry
// url/type/name; text messages carry message.
export type BaseMessageSendBirdType = {
  messageId: string | number;
  message?: string;
  createdAt: number;
  messageType?: 'user' | 'file' | 'admin' | string;
  customType?: string;
  sender?: UserSendBirdType;
  reactions?: Array<{
    key: string;
    userIds?: string[];
    sampledUserIds?: string[];
    [key: string]: any;
  }>;
  url?: string;
  plainUrl?: string;
  type?: string;
  name?: string;
  size?: number;
  data?: string;
  [key: string]: any;
};

// Channel/conversation/post container (was: GroupChannel). Feed posts reuse
// this shape too (legacy Sendbird stored posts as channels).
export type GroupChannelSendBirdType = {
  url: string;
  name: string;
  coverUrl?: string;
  members: Array<MemberSendBirdType>;
  memberCount?: number;
  joinedMemberCount?: number;
  createdAt: number;
  customType?: string;
  cachedMetaData: {
    type?: 'post' | 'chat' | 'group' | 'delete' | 'recommendation';
    [key: string]: any;
  };
  creator?: UserSendBirdType | null;
  lastMessage?: BaseMessageSendBirdType | null;
  unreadMessageCount?: number;
  data?: string;
  amountMessage?: number;
  amountReaction?: number;
  [key: string]: any;
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
