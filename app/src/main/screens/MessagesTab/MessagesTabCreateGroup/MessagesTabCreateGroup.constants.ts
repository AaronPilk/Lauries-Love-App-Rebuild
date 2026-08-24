import { UserSendBirdType } from 'providers/ChatProvider/ChatProvider.types';

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
