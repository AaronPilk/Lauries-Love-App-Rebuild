import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CoreEntity } from './core.entity';

import { ValuesDefinition } from './values-definition.entity';
import { Notification } from './notification.entity';
import { Payment } from './payment.entity';

export class NotificationConfig {
  notificationToken: string;
  active: boolean;
  deviceType: string;
  frecuency?: string;
}
export class BillingConfig {
  billId: string;
  profileId: string;
  paymentProfileId: string[];
}

export class UserConfig {
  notifications: NotificationConfig;
  billing?: BillingConfig;
}

export class GeoLocation {
  latitude: number;
  longitude: number;
}

@Entity()
export class User extends CoreEntity {
  @Column({ nullable: true, name: 'cognito_id', unique: true })
  cognitoId: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true, name: 'display_name' })
  displayName: string;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  dob: Date;

  @Column({ nullable: true, name: 'address_line1' })
  addressLine1: string;

  @Column({ nullable: true, name: 'address_line2' })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true, name: 'zip_code' })
  zipCode: string;

  @ManyToMany(() => ValuesDefinition)
  @JoinTable()
  diagnosisTypes: ValuesDefinition[];

  @ManyToMany(() => ValuesDefinition)
  @JoinTable()
  diagnosisSubTypes: ValuesDefinition[];

  @Column({ nullable: true })
  age?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true, name: 'diagnosis_year' })
  diagnosisYear: string;

  @Column({ type: 'timestamp', nullable: true })
  diagnosisDate?: Date;

  @Column({ nullable: true })
  timeline?: string;

  @Column({ nullable: true })
  phoneNumberLocation?: string;

  @Column({ nullable: true, name: 'profile_picture' })
  profilePicture?: string | null;

  @Column({ type: 'json', nullable: true })
  config?: UserConfig;

  @Column({ type: 'json', nullable: true })
  geoLocation?: GeoLocation;

  @Column({ nullable: true, type: 'text', name: 'description' })
  description: string;

  @OneToMany(() => Notification, (entity) => entity.notifier, { onDelete: 'CASCADE' })
  notifications: Notification[];

  @OneToMany(() => Payment, (entity) => entity.user, { onDelete: 'SET NULL' })
  payments: Payment[];

  @ManyToOne(() => ValuesDefinition)
  designation: ValuesDefinition;

  @ManyToOne(() => ValuesDefinition)
  role: ValuesDefinition;
}
