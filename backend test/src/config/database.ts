import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env.js";
import { CreateWarehouseReceiptTables1710000000000 } from "../database/migrations/1710000000000-create-warehouse-receipt-tables.js";
import { AddWarehouseDocumentStatus1788060000000 } from "../database/migrations/1788060000000-add-warehouse-document-status.js";
import { CreateInventorySchema1788050000000 } from "../database/migrations/1788050000000-create-inventory-schema.js";
import { CreateUsers1788070000000 } from "../database/migrations/1788070000000-create-users.js";
import { AddGoodsReceiptPostingDate1788080000000 } from "../database/migrations/1788080000000-add-goods-receipt-posting-date.js";
import { CreateGoodsReceiptAttachments1788090000000 } from "../database/migrations/1788090000000-create-goods-receipt-attachments.js";
import { AddReceiptUserRoles1788100000000 } from "../database/migrations/1788100000000-add-receipt-user-roles.js";
import { RemovePreparerRole1788110000000 } from "../database/migrations/1788110000000-remove-preparer-role.js";
import { CreateOrganizationDepartment1788120000000 } from "../database/migrations/1788120000000-create-organization-department.js";
import {
  GoodsIssue,
  GoodsIssueItem,
  GoodsReceipt,
  GoodsReceiptAttachment,
  GoodsReceiptItem,
  InventoryAdjustment,
  Product,
  Supplier,
  User,
  Organization,
  Department,
} from "../modules/models/index.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  entities: [
    Supplier,
    Product,
    GoodsReceipt,
    GoodsReceiptAttachment,
    GoodsReceiptItem,
    GoodsIssue,
    GoodsIssueItem,
    InventoryAdjustment,
    User,
    Organization,
    Department,
  ],
  migrations: [
    CreateWarehouseReceiptTables1710000000000,
    CreateInventorySchema1788050000000,
    AddWarehouseDocumentStatus1788060000000,
    CreateUsers1788070000000,
    AddGoodsReceiptPostingDate1788080000000,
    CreateGoodsReceiptAttachments1788090000000,
    AddReceiptUserRoles1788100000000,
    RemovePreparerRole1788110000000,
    CreateOrganizationDepartment1788120000000,
  ],
  migrationsRun: env.MIGRATIONS_RUN,
  synchronize: false,
  logging: env.NODE_ENV === "development",
});
