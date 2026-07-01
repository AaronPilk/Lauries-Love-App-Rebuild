import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';
import { ValuesDefinition } from './values-definition.entity';

export class ItemLine {
  name: string;
  price: number;
  quantity: number;
}

@Entity()
export class Payment extends CoreEntity {
  @Column()
  paymentId: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  accountType: string;

  @Column()
  accountNumber: string;

  @ManyToOne(() => ValuesDefinition)
  paymentType: ValuesDefinition;

  @Column()
  paymentStatus: string;

  @Column({ type: 'json' })
  items: ItemLine[];

  @Column()
  amount: number;

  @Column({ nullable: true, type: 'timestamp' })
  nextPayment?: Date;

  @Column({ nullable: true })
  inHonorName?: string;

  @ManyToOne(() => User, (entity) => entity.payments, { onDelete: 'SET NULL' })
  user: User;
}
