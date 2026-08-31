import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { InventoryAdjustment } from "./inventory-adjustment.entity.js";
import { GoodsIssueItem } from "./goods-issue-item.entity.js";
import { GoodsReceiptItem } from "./goods-receipt-item.entity.js";
import { numericTransformer } from "./numeric.transformer.js";

export enum ProductStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

@Entity({ name: "san_pham" })
export class Product {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "ma_sp", type: "varchar", length: 50, unique: true })
  sku!: string;
  @Column({ name: "ten_sp", type: "varchar", length: 255 }) name!: string;
  @Column({ name: "don_vi_tinh", type: "varchar", length: 50 }) unit!: string;
  @Column({
    name: "gia_nhap",
    type: "numeric",
    precision: 18,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  purchasePrice!: number;
  @Column({
    name: "gia_ban",
    type: "numeric",
    precision: 18,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  salePrice!: number;
  @Column({
    name: "so_luong_ton",
    type: "numeric",
    precision: 18,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  stockQuantity!: number;
  @Column({
    name: "ton_toi_thieu",
    type: "numeric",
    precision: 18,
    scale: 3,
    default: 0,
    transformer: numericTransformer,
  })
  minimumStock!: number;
  @Column({
    name: "trang_thai",
    type: "enum",
    enum: ProductStatus,
    enumName: "product_status",
    default: ProductStatus.ACTIVE,
  })
  status!: ProductStatus;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @OneToMany(() => GoodsReceiptItem, (item) => item.product)
  receiptItems!: Relation<GoodsReceiptItem[]>;
  @OneToMany(() => GoodsIssueItem, (item) => item.product)
  issueItems!: Relation<GoodsIssueItem[]>;
  @OneToMany(() => InventoryAdjustment, (adjustment) => adjustment.product)
  adjustments!: Relation<InventoryAdjustment[]>;
}
