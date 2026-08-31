import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoodsReceiptPostingDate1788080000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho
      ADD COLUMN ngay_hach_toan date
    `);
    await queryRunner.query(`
      UPDATE phieu_nhap_kho SET ngay_hach_toan = ngay_lap
    `);
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho
      ALTER COLUMN ngay_hach_toan SET NOT NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho DROP COLUMN ngay_hach_toan
    `);
  }
}
