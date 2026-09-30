import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Address } from './address.entity.ts';
import { Order } from './order.entity.ts';

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100, select: false })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: 'user' })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @OneToMany(() => Address, address => address.user)
  addresses!: Relation<Address>[];

  @OneToMany(() => Order, order => order.user)
  orders!: Relation<Order>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
