import { DataSource } from 'typeorm';
import { env } from './env.ts';
import { Address } from '../entities/address.entity.ts';
import { Category } from '../entities/category.entity.ts';
import { Coupon } from '../entities/coupon.entity.ts';
import { Order } from '../entities/order.entity.ts';
import { OrderItem } from '../entities/orderItem.entity.ts';
import { Product } from '../entities/product.entity.ts';
import { User } from '../entities/user.entity.ts';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.MODE === 'development',
  logging: env.MODE === 'development',
  entities: [Address, Category, Coupon, Order, OrderItem, Product, User],
});

export default AppDataSource;
