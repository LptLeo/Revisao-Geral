import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Category } from './category.entity.ts';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, select: false })
  cost_price!: string;

  @Column({ type: 'text' })
  description?: string;

  @Column({ type: 'int', default: 0 })
  stock_quantity!: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @ManyToOne(() => Category, category => category.products)
  category!: Relation<Category>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
