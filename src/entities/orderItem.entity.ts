import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity.ts";
import { Product } from "./product.entity.ts";

@Entity()
export class OrderItem {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Order, (order) => order.items)
    order!: Order;

    @ManyToOne(() => Product)
    product!: Product;

    @Column({ type: "int" })
    quantity!: number;

    @Column({ type: "numeric", precision: 10, scale: 2 })
    unit_price!: string;

    @CreateDateColumn()
    createdAt!: Date;
}