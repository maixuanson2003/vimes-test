import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddReceiptUserRoles1788100000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PREPARER'`);
    await queryRunner.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'STOREKEEPER'`);
    await queryRunner.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'CHIEF_ACCOUNTANT'`);
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho
        ADD COLUMN nguoi_lap_id integer REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN thu_kho_id integer REFERENCES users(id) ON DELETE SET NULL,
        ADD COLUMN ke_toan_truong_id integer REFERENCES users(id) ON DELETE SET NULL
    `);
    await queryRunner.query(`
      UPDATE phieu_nhap_kho receipt
      SET nguoi_lap_id = usr.id
      FROM users usr
      WHERE lower(trim(receipt.nguoi_lap_phieu)) = lower(trim(usr.name))
    `);
    await queryRunner.query(`
      UPDATE phieu_nhap_kho receipt
      SET thu_kho_id = usr.id
      FROM users usr
      WHERE lower(trim(receipt.thu_kho)) = lower(trim(usr.name))
    `);
    await queryRunner.query(`
      UPDATE phieu_nhap_kho receipt
      SET ke_toan_truong_id = usr.id
      FROM users usr
      WHERE lower(trim(receipt.ke_toan_truong)) = lower(trim(usr.name))
    `);
    await queryRunner.query(`CREATE INDEX idx_phieu_nhap_nguoi_lap ON phieu_nhap_kho(nguoi_lap_id)`);
    await queryRunner.query(`CREATE INDEX idx_phieu_nhap_thu_kho ON phieu_nhap_kho(thu_kho_id)`);
    await queryRunner.query(`CREATE INDEX idx_phieu_nhap_ke_toan_truong ON phieu_nhap_kho(ke_toan_truong_id)`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_phieu_nhap_ke_toan_truong`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_phieu_nhap_thu_kho`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_phieu_nhap_nguoi_lap`);
    await queryRunner.query(`
      ALTER TABLE phieu_nhap_kho
        DROP COLUMN ke_toan_truong_id,
        DROP COLUMN thu_kho_id,
        DROP COLUMN nguoi_lap_id
    `);
  }
}
