import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsReceipt } from "./goods-receipt.entity.js";
import { numericTransformer } from "./numeric.transformer.js";
import { Product } from "./product.entity.js";

@Entity({ name: "phieu_nhap_kho_chi_tiet" })
export class GoodsReceiptItem {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "phieu_nhap_id", type: "integer" }) receiptId!: number;
  @ManyToOne(() => GoodsReceipt, (receipt) => receipt.items, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "phieu_nhap_id" })
  receipt!: Relation<GoodsReceipt>;
  @Column({ name: "san_pham_id", type: "integer" }) productId!: number;
  @ManyToOne(() => Product, (product) => product.receiptItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "san_pham_id" })
  product!: Relation<Product>;
  @Column({
    name: "so_luong_theo_ct",
    type: "numeric",
    precision: 18,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  documentQuantity!: number;
  @Column({
    name: "so_luong_thuc_nhap",
    type: "numeric",
    precision: 18,
    scale: 3,
    transformer: numericTransformer,
  })
  actualQuantity!: number;
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
    asExpression: "so_luong_thuc_nhap * don_gia",
    insert: false,
    update: false,
    transformer: numericTransformer,
  })
  lineAmount!: number;
}
