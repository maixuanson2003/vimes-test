import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Department } from "./department.entity.js";
import { GoodsReceipt } from "./goods-receipt.entity.js";

@Entity({ name: "don_vi" })
export class Organization {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "ma", type: "varchar", length: 50, unique: true }) code!: string;
  @Column({ name: "ten", type: "varchar", length: 255, unique: true }) name!: string;
  @Column({ name: "hoat_dong", type: "boolean", default: true }) isActive!: boolean;
  @OneToMany(() => Department, (department) => department.organization)
  departments!: Relation<Department[]>;
  @OneToMany(() => GoodsReceipt, (receipt) => receipt.organization)
  receipts!: Relation<GoodsReceipt[]>;
}
