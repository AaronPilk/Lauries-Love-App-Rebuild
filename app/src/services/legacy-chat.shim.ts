// Legacy Sendbird shim — the @sendbird packages are REMOVED from the app.
//
// Every remaining `sdk.*` call site in the codebase sits behind a
// SUPABASE_ENABLED / MOCK_ENABLED guard and can never execute (BACKEND is
// only ever 'mock' | 'supabase'). This shim satisfies those dead code paths
// at compile time and, as a belt-and-suspenders measure, makes any
// accidental runtime call a safe no-op instead of a crash.
//
// When the dead legacy branches are physically deleted in the final cleanup
// pass, this file goes with them.

// Chainable dead object: property access returns itself, calls return
// itself, `await` resolves it (then === undefined). Truthiness is true, so
// never use it in conditionals — dead branches don't, they're unreachable.
/* eslint-disable @typescript-eslint/no-empty-function */
const dead: any = new Proxy(function () {}, {
  get: (_t, prop) => {
    if (prop === 'then') return undefined; // await-safe
    if (prop === Symbol.toPrimitive || prop === 'toString')
      return () => '[dead-sendbird]';
    return dead;
  },
  apply: () => dead,
  construct: () => dead,
});

/** Was: useSendbirdChat() from @sendbird/uikit-react-native. */
export const useSendbirdChat = () => ({
  sdk: dead,
  currentUser: null as any,
  updateCurrentUserInfo: dead,
});

/** Was: enums/classes from @sendbird/chat*. Values kept string-compatible. */
export const QueryType = { AND: 'AND', OR: 'OR' } as const;
export const Role = { OPERATOR: 'operator', NONE: 'none' } as const;
export const UserOnlineState = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  NON_AVAILABLE: 'nonAvailable',
} as const;
export const MessageTypeFilter = {
  ALL: 'all',
  USER: 'user',
  FILE: 'file',
  ADMIN: 'admin',
} as const;

export class GroupChannelHandler {
  onChannelChanged?: (channel: any) => void;
  onChannelDeleted?: (channelUrl: string, channelType?: any) => void;
  onMessageReceived?: (channel: any, message: any) => void;
  constructor(init?: Partial<GroupChannelHandler>) {
    Object.assign(this, init);
  }
}

export type FriendListQuery = any;
export type SendbirdChatSDK = any;
export type Sender = any;
export type BaseMessage = any;
export type GroupChannel = any;
export type Member = any;
export type User = any;
