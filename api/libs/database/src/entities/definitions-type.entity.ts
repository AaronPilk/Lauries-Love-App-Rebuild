import { Column, Entity } from 'typeorm';
import { CoreEntity } from './core.entity';

@Entity()
export class DefinitionsType extends CoreEntity {
  @Column({
    type: 'varchar',
    unique: true,
    nullable: false,
    name: 'definition_type',
  })
  definitionType: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true, name: 'creator_user_id' })
  creatorUserId?: string;
}
