import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { GoodsReceiptItem } from "./goods-receipt-item.entity.js";
import { GoodsReceiptAttachment } from "./goods-receipt-attachment.entity.js";
import { numericTransformer } from "./numeric.transformer.js";
import { Supplier } from "./supplier.entity.js";
import { WarehouseDocumentStatus } from "./warehouse-document-status.enum.js";
import { User } from "./user.entity.js";
import { Organization } from "./organization.entity.js";
import { Department } from "./department.entity.js";

@Entity({ name: "phieu_nhap_kho" })
export class GoodsReceipt {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ name: "so_phieu", type: "varchar", length: 30, unique: true })
  receiptNumber!: string;
  @Column({ name: "ngay_lap", type: "date" }) receiptDate!: string;
  @Column({ name: "ngay_hach_toan", type: "date" }) postingDate!: string;
  @Column({ name: "don_vi_id", type: "integer", nullable: true }) organizationId!: number | null;
  @ManyToOne(() => Organization, (organization) => organization.receipts, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "don_vi_id" }) organization!: Relation<Organization> | null;
  @Column({ name: "bo_phan_id", type: "integer", nullable: true }) departmentId!: number | null;
  @ManyToOne(() => Department, (department) => department.receipts, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "bo_phan_id" }) department!: Relation<Department> | null;
  @Column({ name: "tk_no", type: "varchar", length: 20, nullable: true })
  debitAccount!: string | null;
  @Column({ name: "tk_co", type: "varchar", length: 20, nullable: true })
  creditAccount!: string | null;
  @Column({ name: "nha_cung_cap_id", type: "integer", nullable: true })
  supplierId!: number | null;
  @ManyToOne(() => Supplier, (supplier) => supplier.goodsReceipts, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "nha_cung_cap_id" })
  supplier!: Relation<Supplier> | null;
  @Column({ name: "ho_ten_nguoi_giao", type: "varchar", length: 150 })
  delivererName!: string;
  @Column({
    name: "theo_chung_tu",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  sourceDocument!: string | null;
  @Column({
    name: "nhap_tai_kho",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  warehouseName!: string | null;
  @Column({ name: "dia_diem", type: "varchar", length: 255, nullable: true })
  location!: string | null;
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
  @Column({
    name: "tong_tien_bang_chu",
    type: "varchar",
    length: 500,
    nullable: true,
  })
  totalAmountInWords!: string | null;
  @Column({
    name: "chung_tu_goc_kem",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  attachedDocuments!: string | null;
  @Column({ name: "nguoi_lap_id", type: "integer", nullable: true })
  preparedById!: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "nguoi_lap_id" })
  preparedBy!: Relation<User> | null;
  @Column({
    name: "nguoi_giao_hang",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  deliveredBy!: string | null;
  @Column({ name: "thu_kho_id", type: "integer", nullable: true })
  storekeeperId!: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "thu_kho_id" })
  storekeeper!: Relation<User> | null;
  @Column({ name: "ke_toan_truong_id", type: "integer", nullable: true })
  chiefAccountantId!: number | null;
  @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "ke_toan_truong_id" })
  chiefAccountant!: Relation<User> | null;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
  @OneToMany(() => GoodsReceiptItem, (item) => item.receipt, {
    cascade: ["insert", "update"],
  })
  items!: Relation<GoodsReceiptItem[]>;
  @OneToMany(() => GoodsReceiptAttachment, (attachment) => attachment.receipt)
  attachments!: Relation<GoodsReceiptAttachment[]>;
}
