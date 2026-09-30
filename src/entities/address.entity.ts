import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity.ts';

@Entity()
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  street!: string;

  @Column({ type: 'varchar', nullable: true })
  street_number?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  complement?: string;

  @Column({ type: 'varchar', length: 100 })
  neighborhood!: string;

  @Column({ type: 'varchar', length: 50 })
  city!: string;

  @Column({ type: 'varchar', length: 2 })
  state!: string;

  @Column({ type: 'varchar', length: 8 })
  postal_code!: string;

  @Column({ type: 'varchar', length: 30 })
  country!: string;

  @ManyToOne(() => User, user => user.addresses)
  user!: Relation<User>;

  @Column({ type: 'boolean', default: true })
  is_default!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
