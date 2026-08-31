import type { MigrationInterface, QueryRunner } from "typeorm";
export class CreateWarehouseReceiptTables1710000000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE TABLE warehouse_receipts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),receipt_no VARCHAR(50) NOT NULL UNIQUE,receipt_date DATE NOT NULL,organization_name VARCHAR(255),department_name VARCHAR(255),debit_account VARCHAR(50),credit_account VARCHAR(50),deliverer_name VARCHAR(255),source_document_no VARCHAR(100),source_document_date DATE,reason TEXT,warehouse_name VARCHAR(255) NOT NULL,total_amount NUMERIC(18,2) NOT NULL CHECK(total_amount>=0),attached_document_count INTEGER NOT NULL DEFAULT 0 CHECK(attached_document_count>=0),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
    CREATE TABLE warehouse_receipt_items (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),receipt_id UUID NOT NULL REFERENCES warehouse_receipts(id) ON DELETE CASCADE,line_no INTEGER NOT NULL,item_name VARCHAR(500) NOT NULL,item_code VARCHAR(100),unit_name VARCHAR(50) NOT NULL,document_quantity NUMERIC(18,3) NOT NULL CHECK(document_quantity>=0),actual_quantity NUMERIC(18,3) NOT NULL CHECK(actual_quantity>0),unit_price NUMERIC(18,2) NOT NULL CHECK(unit_price>=0),line_amount NUMERIC(18,2) NOT NULL CHECK(line_amount>=0),created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),UNIQUE(receipt_id,line_no));CREATE INDEX idx_receipts_date ON warehouse_receipts(receipt_date);CREATE INDEX idx_items_receipt ON warehouse_receipt_items(receipt_id);`);
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query(
      "DROP TABLE IF EXISTS warehouse_receipt_items; DROP TABLE IF EXISTS warehouse_receipts;",
    );
  }
}
