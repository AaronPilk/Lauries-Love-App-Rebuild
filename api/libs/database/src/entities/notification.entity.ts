import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';
import { NotificationObject } from './notification-object.entity';

@Entity()
export class Notification extends CoreEntity {
  @OneToOne(() => NotificationObject, (entity) => entity.notification, { onDelete: 'CASCADE' })
  @JoinColumn()
  notificationObject: NotificationObject;

  @ManyToOne(() => User, (entity) => entity.notifications)
  notifier: User;

  @Column({ type: 'boolean', default: false })
  read: boolean;
}
