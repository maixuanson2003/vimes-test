import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsIssue } from "./goods-issue.entity.js";

@Entity({ name: "phieu_xuat_kho_chung_tu" })
export class GoodsIssueAttachment {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "phieu_xuat_id", type: "integer" }) issueId!: number;
  @ManyToOne(() => GoodsIssue, (issue) => issue.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "phieu_xuat_id" })
  issue!: Relation<GoodsIssue>;
  @Column({ name: "ten_goc", type: "varchar", length: 255 })
  originalName!: string;
  @Column({ name: "ten_luu", type: "varchar", length: 100, unique: true })
  storedName!: string;
  @Column({ name: "loai_tep", type: "varchar", length: 150 }) mimeType!: string;
  @Column({ name: "kich_thuoc", type: "integer" }) size!: number;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
