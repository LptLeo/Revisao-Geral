import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Order } from './order.entity.ts';
import { Product } from './product.entity.ts';

@Entity('orderItem')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, order => order.items)
  order!: Relation<Order>;

  @ManyToOne(() => Product)
  product!: Relation<Product>;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
