import { Entity, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { NotificationObject } from './notification-object.entity';
import { User } from './user.entity';

@Entity()
export class NotificationChange extends CoreEntity {
  @OneToOne(() => NotificationObject, (entity) => entity.notificationChange, { onDelete: 'CASCADE' })
  notificationObject: NotificationObject;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  actor: User;
}
