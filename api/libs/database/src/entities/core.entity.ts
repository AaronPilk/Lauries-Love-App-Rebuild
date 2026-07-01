import { v4 } from 'uuid';
import {
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CoreEntity {
  @PrimaryColumn({
    type: 'uuid',
  })
  id: string = v4();

  @Column({ type: 'boolean', nullable: true, default: true })
  active?: boolean;

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt?: Date;

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt?: Date;
}
