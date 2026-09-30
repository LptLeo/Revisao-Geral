import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { User } from './user.entity.ts';
import { OrderItem } from './orderItem.entity.ts';

export const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface ShippingAddressSnapshot {
  street: string;
  number: string | null;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: 'pending' })
  status!: OrderStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: '0.00' })
  subtotal!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: '0.00' })
  discount!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: '0.00' })
  shipping_fee!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: '0.00' })
  total!: string;

  @Column({ type: 'jsonb' })
  shipping_address!: ShippingAddressSnapshot;

  @ManyToOne(() => User, user => user.orders)
  user!: Relation<User>;

  @OneToMany(() => OrderItem, item => item.order)
  items!: Relation<OrderItem>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
