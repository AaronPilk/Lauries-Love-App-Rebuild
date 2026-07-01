import { BaseModel } from 'domain/models/base.model';
import { ValueDefinition } from './value-definition.model';

export type User = BaseModel & {
  addressLine1?: string;
  addressLine2?: string;
  age: string;
  city?: string;
  cognitoId: string;
  country: string;
  createdAt: Date;
  diagnosisTypes: ValueDefinition[] | null;
  diagnosisSubTypes: ValueDefinition[] | null;
  diagnosisYear: string;
  displayName: string;
  dob?: string;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  phoneNumber: string;
  profilePicture?: string;
  state?: string;
  zipCode: string;
  config?: UserConfig;
  designation: ValueDefinition | string;
  role: ValueDefinition | string;
  diagnosisDate: string | null;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
};

export type NotificationConfig = {
  notificationToken: string;
  active: boolean;
  deviceType: string;
};
export type BillingConfig = {
  billId: string;
  profileId: string;
  paymentProfileId: string;
};

export type UserConfig = {
  notifications: NotificationConfig;
  billing?: BillingConfig;
};
