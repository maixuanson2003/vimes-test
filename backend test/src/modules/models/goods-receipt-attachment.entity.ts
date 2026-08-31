import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsReceipt } from "./goods-receipt.entity.js";

@Entity({ name: "phieu_nhap_kho_chung_tu" })
export class GoodsReceiptAttachment {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "phieu_nhap_id", type: "integer" }) receiptId!: number;
  @ManyToOne(() => GoodsReceipt, (receipt) => receipt.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "phieu_nhap_id" })
  receipt!: Relation<GoodsReceipt>;
  @Column({ name: "ten_goc", type: "varchar", length: 255 }) originalName!: string;
  @Column({ name: "ten_luu", type: "varchar", length: 100, unique: true }) storedName!: string;
  @Column({ name: "loai_tep", type: "varchar", length: 150 }) mimeType!: string;
  @Column({ name: "kich_thuoc", type: "integer" }) size!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
}
