import { Entity, ManyToOne, Column, OneToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { ValuesDefinition } from './values-definition.entity';
import { NotificationChange } from './notification-change.entity';
import { Notification } from './notification.entity';

@Entity()
export class NotificationObject extends CoreEntity {
  @Column({ type: 'varchar' })
  entity: string; // ID of User, Event

  @Column({ type: 'longtext', nullable: true })
  content?: string;

  @Column({ type: 'varchar', nullable: true })
  redirect?: string;

  @ManyToOne(() => ValuesDefinition)
  entityType: ValuesDefinition;

  @OneToOne(() => NotificationChange, (entity) => entity.notificationObject, { onDelete: 'CASCADE' })
  @JoinColumn()
  notificationChange: NotificationChange;

  @OneToOne(() => Notification, (entity) => entity.notificationObject, { onDelete: 'CASCADE' })
  notification: Notification;
}
