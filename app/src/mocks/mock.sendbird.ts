// Fake Sendbird data for mock mode: community-wall posts, recommendation
// groups (mirroring the original app's taxonomy: one group per diagnosis type
// + role-based circles), post comments, and chat channels.
//
// Shapes are PLAIN OBJECTS matching what the screens actually read (the feed
// already renders JSON-deserialized channels from AsyncStorage, so no SDK
// class instances are needed).

import { MOCK_CURRENT_USER, MOCK_USERS } from './mock.data';

const now = Date.now();
const HOUR = 3600 * 1000;

const sender = (u: any) => ({
  userId: u.sendBirdId,
  nickname: u.displayName || u.firstName,
  plainProfileUrl: '',
  profileUrl: '',
  isActive: true,
  metaData: { id: u.id },
});

export const MOCK_USER_CHAT: any = sender(MOCK_CURRENT_USER);

// ---------------------------------------------------------------------------
// Recommendation groups (what getFilteringUserInfo / Groups surfaces show).
// Names deliberately contain the lowercase role + cancer-type words the
// original app matches on (channelNameContainsFilter).
// ---------------------------------------------------------------------------
const group = (i: number, name: string, memberCount: number) => ({
  url: `mock-group-${i}`,
  name,
  coverUrl: '',
  memberCount,
  joinedMemberCount: memberCount,
  createdAt: now - (30 + i) * 24 * HOUR,
  creator: sender(MOCK_USERS[i % MOCK_USERS.length]),
  customType: 'group',
  data: JSON.stringify({ recommendation: true }),
  cachedMetaData: { type: 'group', recommendation: 'true' },
  members: MOCK_USERS.slice(0, Math.min(memberCount, 6)).map(sender),
  lastMessage: {
    message: 'Welcome to the group! Introduce yourself when you are ready.',
    createdAt: now - 2 * HOUR,
    sender: sender(MOCK_USERS[(i + 1) % MOCK_USERS.length]),
  },
  unreadMessageCount: 0,
});

export const MOCK_GROUPS: any[] = [
  group(1, 'Breast Cancer Warriors', 214),
  group(2, 'Lung Cancer Warriors', 96),
  group(3, 'Colorectal Cancer Community', 71),
  group(4, 'Prostate Cancer Brothers', 58),
  group(5, 'Pancreatic Cancer Fighters', 44),
  group(6, 'Lymphoma & Leukemia Circle', 63),
  group(7, 'Melanoma Support', 39),
  group(8, 'Ovarian Cancer Sisters', 52),
  group(9, 'Caregiver Corner', 87),
  group(10, 'Survivor Stories', 132),
  group(11, 'Warrior (patient) Lounge', 178),
  group(12, 'Newly Diagnosed — Start Here', 91),
];

// ---------------------------------------------------------------------------
// Community-wall posts. PostHomeTab reads: url, createdAt, creator, data
// (JSON: firstMessage, commentQty, likes[], image_sm), lastMessage.sender.
// ---------------------------------------------------------------------------
const POST_TEXTS: Array<[string, number, string[]]> = [
  [
    'Finished my 6th round of chemo today. Ring the bell with me — 2 more to go! 🔔',
    5,
    ['mock-user-3', 'mock-user-4', 'mock-user-7'],
  ],
  [
    'Any tips for dealing with treatment fatigue? Some days getting off the couch feels like a marathon.',
    4,
    ['mock-user-2'],
  ],
  [
    'One year in remission today. To everyone still in the fight: it gets better. Keep going.',
    6,
    ['mock-user-2', 'mock-user-5', 'mock-user-6', 'mock-user-8'],
  ],
  [
    'Caregiver here — my wife starts radiation Monday. What should we expect the first week?',
    3,
    ['mock-user-9'],
  ],
  [
    'The nurses at my infusion center deserve the world. Brought them donuts today 🍩',
    2,
    ['mock-user-3', 'mock-user-10'],
  ],
  [
    'Scan day tomorrow. The scanxiety is real. Send good thoughts my way.',
    7,
    ['mock-user-2', 'mock-user-4', 'mock-user-5', 'mock-user-11'],
  ],
  [
    'Started a walking group in my neighborhood for fellow warriors. Week 3 and we are up to 12 people!',
    4,
    ['mock-user-6'],
  ],
  [
    'Grateful for this community. You all understand things my friends and family just can not.',
    5,
    ['mock-user-2', 'mock-user-3', 'mock-user-7', 'mock-user-12'],
  ],
];

export const MOCK_POSTS: any[] = POST_TEXTS.map(([text, commentQty, likes], i) => {
  const author = MOCK_USERS[i % MOCK_USERS.length];
  return {
    url: `mock-post-${i + 1}`,
    name: `post by ${author.displayName}`,
    createdAt: now - (i * 7 + 3) * HOUR,
    creator: sender(author),
    customType: 'post',
    cachedMetaData: { type: 'post' },
    memberCount: 1,
    lastMessage: {
      message: text,
      createdAt: now - (i * 7 + 3) * HOUR,
      sender: sender(author),
    },
    data: JSON.stringify({
      firstMessage: text,
      commentQty,
      likes,
      image_sm: '',
      visibility: 'all',
    }),
  };
});

// ---------------------------------------------------------------------------
// Comments per post url (HomeTabPost reads: messageId, message, createdAt,
// sender {nickname, plainProfileUrl, isActive}, reactions[]).
// ---------------------------------------------------------------------------
const COMMENT_TEXTS = [
  'So proud of you! 💪',
  'Sending you all the strength today.',
  'This made my whole week. Thank you for sharing.',
  'Following — I needed to read this.',
  'You have got this. One day at a time.',
  'Praying for good results!',
  'Same boat here. DM me anytime.',
];

let commentId = 1000;
const makeComments = (postUrl: string, count: number) =>
  Array.from({ length: count }, (_, j) => {
    const author = MOCK_USERS[(j + 2) % MOCK_USERS.length];
    return {
      messageId: commentId++,
      message: COMMENT_TEXTS[(j + commentId) % COMMENT_TEXTS.length],
      createdAt: now - (count - j) * HOUR,
      messageType: 'user',
      sender: { ...sender(author) },
      reactions:
        j % 3 === 0
          ? [
              {
                key: 'smile',
                sampledUserIds: [MOCK_USERS[(j + 5) % 12].sendBirdId],
                userIds: [MOCK_USERS[(j + 5) % 12].sendBirdId],
              },
            ]
          : [],
    };
  });

export const MOCK_COMMENTS: Record<string, any[]> = MOCK_POSTS.reduce(
  (acc, post) => {
    const qty = JSON.parse(post.data).commentQty as number;
    return { ...acc, [post.url]: makeComments(post.url, qty) };
  },
  {} as Record<string, any[]>,
);

// ---------------------------------------------------------------------------
// Chat channels for the Messages tab (getChannels shape: url, name, members
// with metaData, cachedMetaData.type chat|group, lastMessage, unread count).
// ---------------------------------------------------------------------------
const chat = (i: number, other: any, lastText: string, hoursAgo: number) => ({
  url: `mock-chat-${i}`,
  name: other.displayName,
  coverUrl: '',
  memberCount: 2,
  joinedMemberCount: 2,
  createdAt: now - (10 + i) * 24 * HOUR,
  customType: 'chat',
  cachedMetaData: { type: 'chat' },
  members: [MOCK_USER_CHAT, sender(other)],
  creator: MOCK_USER_CHAT,
  lastMessage: {
    message: lastText,
    createdAt: now - hoursAgo * HOUR,
    sender: sender(other),
  },
  unreadMessageCount: i === 1 ? 2 : 0,
  data: '',
});

const BASE_CHAT_CHANNELS: any[] = [
  chat(1, MOCK_USERS[0], 'How did the appointment go today?', 1),
  chat(2, MOCK_USERS[2], 'Thank you so much for the advice 🙏', 5),
  chat(3, MOCK_USERS[4], 'See you at the walking group Saturday!', 26),
];

// Groups the mock user has JOINED (signup flow + join buttons add to this).
// Seeded with one group so the demo isn't empty before any joins.
const joinedGroupUrls = new Set<string>([MOCK_GROUPS[0].url]);

export const joinMockGroup = (url: string) => {
  joinedGroupUrls.add(url);
};

export const leaveMockGroup = (url: string) => {
  joinedGroupUrls.delete(url);
};

// Dynamic: chats + whatever groups have been joined this session.
export const getMockChatChannels = (): any[] => [
  ...BASE_CHAT_CHANNELS,
  ...MOCK_GROUPS.filter(g => joinedGroupUrls.has(g.url)),
];

// Back-compat static export (used where a snapshot is fine).
export const MOCK_CHAT_CHANNELS: any[] = getMockChatChannels();

export const MOCK_CHAT_MESSAGES: Record<string, any[]> = {
  'mock-chat-1': [
    {
      messageId: 1,
      message: 'Hey! Saw your post about scan day. How are you holding up?',
      createdAt: now - 3 * HOUR,
      messageType: 'user',
      sender: sender(MOCK_USERS[0]),
      reactions: [],
    },
    {
      messageId: 2,
      message: 'Nervous but hanging in there. Results Friday.',
      createdAt: now - 2.5 * HOUR,
      messageType: 'user',
      sender: MOCK_USER_CHAT,
      reactions: [],
    },
    {
      messageId: 3,
      message: 'How did the appointment go today?',
      createdAt: now - 1 * HOUR,
      messageType: 'user',
      sender: sender(MOCK_USERS[0]),
      reactions: [],
    },
  ],
  'mock-chat-2': [
    {
      messageId: 4,
      message: 'The ginger tea really helped with the nausea!',
      createdAt: now - 6 * HOUR,
      messageType: 'user',
      sender: sender(MOCK_USERS[2]),
      reactions: [],
    },
    {
      messageId: 5,
      message: 'Thank you so much for the advice 🙏',
      createdAt: now - 5 * HOUR,
      messageType: 'user',
      sender: sender(MOCK_USERS[2]),
      reactions: [],
    },
  ],
  'mock-chat-3': [
    {
      messageId: 6,
      message: 'See you at the walking group Saturday!',
      createdAt: now - 26 * HOUR,
      messageType: 'user',
      sender: sender(MOCK_USERS[4]),
      reactions: [],
    },
  ],
};

// Friends list (status accepted) for Connect/friends surfaces.
export const MOCK_FRIENDS: any[] = [
  { ...sender(MOCK_USERS[0]), status: 'accepted' },
  { ...sender(MOCK_USERS[2]), status: 'accepted' },
  { ...sender(MOCK_USERS[4]), status: 'accepted' },
];
