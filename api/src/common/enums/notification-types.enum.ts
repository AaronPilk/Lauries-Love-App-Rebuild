export const notificationTypes = ['post', 'comment'] as const;
export type NotificationTypes = typeof notificationTypes[number];