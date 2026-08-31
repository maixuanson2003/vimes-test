import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { numericTransformer } from "./numeric.transformer.js";
import { Product } from "./product.entity.js";

@Entity({ name: "dieu_chinh_ton_kho" })
export class InventoryAdjustment {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "san_pham_id", type: "integer" }) productId!: number;
  @ManyToOne(() => Product, (product) => product.adjustments, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "san_pham_id" })
  product!: Relation<Product>;
  @Column({
    name: "so_luong_dieu_chinh",
    type: "numeric",
    precision: 18,
    scale: 3,
    transformer: numericTransformer,
  })
  quantityDelta!: number;
  @Column({ name: "ly_do", type: "varchar", length: 255 }) reason!: string;
  @Column({ name: "ngay_dieu_chinh", type: "date" }) adjustmentDate!: string;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
