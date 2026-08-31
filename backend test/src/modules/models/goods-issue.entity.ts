import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsIssueItem } from "./goods-issue-item.entity.js";
import { numericTransformer } from "./numeric.transformer.js";
import { WarehouseDocumentStatus } from "./warehouse-document-status.enum.js";

@Entity({ name: "phieu_xuat_kho" })
export class GoodsIssue {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "so_phieu", type: "varchar", length: 30, unique: true })
  issueNumber!: string;
  @Column({ name: "ngay_lap", type: "date" }) issueDate!: string;
  @Column({ name: "ly_do_xuat", type: "varchar", length: 255, nullable: true })
  reason!: string | null;
  @Column({ name: "nguoi_nhan", type: "varchar", length: 150, nullable: true })
  recipient!: string | null;
  @Column({
    name: "trang_thai",
    type: "enum",
    enum: WarehouseDocumentStatus,
    enumName: "warehouse_document_status",
    default: WarehouseDocumentStatus.DRAFT,
  })
  status!: WarehouseDocumentStatus;
  @Column({
    name: "tong_tien",
    type: "numeric",
    precision: 18,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  totalAmount!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @OneToMany(() => GoodsIssueItem, (item) => item.issue, {
    cascade: ["insert", "update"],
  })
  items!: Relation<GoodsIssueItem[]>;
}
