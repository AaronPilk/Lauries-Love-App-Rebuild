import { BaseModel } from 'domain/models/base.model';
import { ValueDefinition } from './value-definition.model';
import { User } from './user.model';

export type Notification = BaseModel & {
  active: boolean;
  read: boolean;
  notifier: User;
  notificationObject: NotificationObject;
};

export type NotificationObject = BaseModel & {
  entity: string;
  content: string;
  redirect: string | null;
  entityType: ValueDefinition;
  notificationChange: NotificationChange;
};

export type NotificationChange = BaseModel & {
  actor: User;
};
