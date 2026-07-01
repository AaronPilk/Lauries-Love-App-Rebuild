export const friendRequestStatuses = ['pending', 'accepted', 'rejected'] as const;
export type FriendRequestStatus = typeof friendRequestStatuses[number];