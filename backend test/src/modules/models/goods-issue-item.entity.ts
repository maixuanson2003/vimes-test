import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsIssue } from "./goods-issue.entity.js";
import { numericTransformer } from "./numeric.transformer.js";
import { Product } from "./product.entity.js";

@Entity({ name: "phieu_xuat_kho_chi_tiet" })
export class GoodsIssueItem {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "phieu_xuat_id", type: "integer" }) issueId!: number;
  @ManyToOne(() => GoodsIssue, (issue) => issue.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "phieu_xuat_id" })
  issue!: Relation<GoodsIssue>;
  @Column({ name: "san_pham_id", type: "integer" }) productId!: number;
  @ManyToOne(() => Product, (product) => product.issueItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "san_pham_id" })
  product!: Relation<Product>;
  @Column({
    name: "so_luong_chung_tu",
    type: "numeric",
    precision: 18,
    scale: 3,
    transformer: numericTransformer,
  })
  documentQuantity!: number;
  @Column({
    name: "so_luong_xuat",
    type: "numeric",
    precision: 18,
    scale: 3,
    transformer: numericTransformer,
  })
  quantity!: number;
  @Column({
    name: "don_gia",
    type: "numeric",
    precision: 18,
    scale: 2,
    transformer: numericTransformer,
  })
  unitPrice!: number;
  @Column({
    name: "thanh_tien",
    type: "numeric",
    precision: 18,
    scale: 2,
    generatedType: "STORED",
    asExpression: "so_luong_xuat * don_gia",
    insert: false,
    update: false,
    transformer: numericTransformer,
  })
  lineAmount!: number;
}
