import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddWarehouseDocumentStatus1788060000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE warehouse_document_status AS ENUM (
        'DRAFT',
        'CONFIRMED',
        'CANCELLED'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho
      ADD COLUMN trang_thai warehouse_document_status NOT NULL DEFAULT 'DRAFT'
    `);
    await queryRunner.query(`
      ALTER TABLE phieu_xuat_kho
      ADD COLUMN trang_thai warehouse_document_status NOT NULL DEFAULT 'DRAFT'
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE phieu_xuat_kho DROP COLUMN trang_thai
    `);
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho DROP COLUMN trang_thai
    `);
    await queryRunner.query(`DROP TYPE warehouse_document_status`);
  }
}
