import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveProductMinimumStock1788150000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE san_pham DROP COLUMN IF EXISTS ton_toi_thieu`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE san_pham ADD COLUMN IF NOT EXISTS ton_toi_thieu numeric(18,3) NOT NULL DEFAULT 0`);
  }
}
