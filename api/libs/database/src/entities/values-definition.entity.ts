import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { CoreEntity } from './core.entity';
import { DefinitionsType } from './definitions-type.entity';

@Entity()
export class ValuesDefinition extends CoreEntity {
  @Column({ type: 'varchar', name: 'value_definition' })
  valueDefinition: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', nullable: true, name: 'validation_type' })
  validationType?: string;

  @Column({ type: 'varchar', nullable: true, name: 'creator_user_id' })
  creatorUserId?: string;

  @Column({ type: 'varchar', name: 'modifier_user_id', nullable: true })
  modifierUserId?: string;

  @ManyToOne(() => DefinitionsType, { eager: true })
  @JoinColumn({ name: 'definition_type_id' })
  definitionType: DefinitionsType;
}
