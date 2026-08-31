import type { MigrationInterface, QueryRunner } from "typeorm";

export class RemovePreparerRole1788110000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE users SET role = 'USER' WHERE role = 'PREPARER'`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role DROP DEFAULT`);
    await queryRunner.query(`
      CREATE TYPE user_role_without_preparer AS ENUM (
        'ADMIN', 'USER', 'STOREKEEPER', 'CHIEF_ACCOUNTANT'
      )
    `);
    await queryRunner.query(`
      ALTER TABLE users ALTER COLUMN role TYPE user_role_without_preparer
      USING role::text::user_role_without_preparer
    `);
    await queryRunner.query(`DROP TYPE user_role`);
    await queryRunner.query(`ALTER TYPE user_role_without_preparer RENAME TO user_role`);
    await queryRunner.query(`ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER'`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'PREPARER'`);
  }
}
