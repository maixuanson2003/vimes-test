import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsReceipt } from "./goods-receipt.entity.js";
import { Organization } from "./organization.entity.js";

@Entity({ name: "bo_phan" })
export class Department {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "don_vi_id", type: "integer" }) organizationId!: number;
  @ManyToOne(() => Organization, (organization) => organization.departments, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "don_vi_id" })
  organization!: Relation<Organization>;
  @Column({ name: "ma", type: "varchar", length: 50, unique: true })
  code!: string;
  @Column({ name: "ten", type: "varchar", length: 255 }) name!: string;
  @Column({ name: "hoat_dong", type: "boolean", default: true })
  isActive!: boolean;
  @OneToMany(() => GoodsReceipt, (receipt) => receipt.department)
  receipts!: Relation<GoodsReceipt[]>;
}
