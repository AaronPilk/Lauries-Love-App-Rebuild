import { User } from 'data/models';

export type UserModel = User & {
  isFriend?: boolean;
  friendsDate?: number;
};

export type CometChatUser = {
  uid: string;
};

export interface RemoteUser {
  save(params: Partial<UserModel>): Promise<UserModel>;
}
