import { Column, Entity, ManyToOne } from 'typeorm';
import { CoreEntity } from './core.entity';
import { User } from './user.entity';
import { ValuesDefinition } from './values-definition.entity';

@Entity()
export class Event extends CoreEntity {
  @Column({ type: 'varchar' })
  eventId: string;

  @Column({ type: 'timestamp' })
  logTime: Date;

  @Column({ type: 'int' })
  counter: number;

  @ManyToOne(() => ValuesDefinition)
  eventType: ValuesDefinition;

  @ManyToOne(() => User)
  user: User;
}
