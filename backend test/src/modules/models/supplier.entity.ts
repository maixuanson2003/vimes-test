import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { GoodsReceipt } from "./goods-receipt.entity.js";

@Entity({ name: "nha_cung_cap" })
export class Supplier {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "ten_ncc", type: "varchar", length: 200 }) name!: string;
  @Column({ name: "dia_chi", type: "varchar", length: 255, nullable: true })
  address!: string | null;
  @Column({ name: "sdt", type: "varchar", length: 20, nullable: true }) phone!:
    | string
    | null;
  @OneToMany(() => GoodsReceipt, (receipt) => receipt.supplier)
  goodsReceipts!: Relation<GoodsReceipt[]>;
}
