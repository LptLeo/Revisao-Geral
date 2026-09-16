import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity.ts";

@Entity()
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    name!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @OneToMany(() => Product, (products) => products.category)
    products!: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}