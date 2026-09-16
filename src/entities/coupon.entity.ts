import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export const CouponType = { PERCENT: "percent", FIXED: "fixed" } as const;
export type CouponType = typeof CouponType[keyof typeof CouponType];

@Entity()
export class Coupon {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 30, unique: true })
    code!: string;

    @Column({ type: "enum", enum: CouponType, default: "percent" })
    type!: CouponType;

    @Column({ type: "numeric", precision: 10, scale: 2, default: "0.00" })
    value!: string;

    @Column({ type: "timestamp", nullable: true })
    expires_at!: Date | null;

    @Column({ type: "int", default: 1 })
    max_uses!: number;

    @Column({ type: "int", default: 0 })
    current_uses!: number;

    @Column({ type: "boolean", default: true })
    is_active!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}