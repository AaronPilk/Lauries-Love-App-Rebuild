import { UserSendBirdType } from 'providers/SendbirdChatProvider/SendbirdChatProvider.types';

export const DEFAULT_NEW_GROUP: {
  members: UserSendBirdType[];
  name: string;
  permissions: 'public' | 'private' | null;
  image: string | null;
} = {
  members: [],
  name: '',
  permissions: null,
  image: null,
};
