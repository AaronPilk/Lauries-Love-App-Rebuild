import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';

import { friendRequestStatuses } from '../../../../src/common/enums/friend-request-status.enum';

@Entity()
export class FriendRequest extends CoreEntity {

  @Column()
  senderId: string;

  @Column()
  receiverId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User)
  @JoinColumn()
  receiver: User;

  @Column({ default: false, enum: friendRequestStatuses })
  status: 'pending' | 'accepted' | 'rejected';
}
