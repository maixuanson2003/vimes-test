import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
  STOREKEEPER = "STOREKEEPER",
  CHIEF_ACCOUNTANT = "CHIEF_ACCOUNTANT",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn({ type: "integer" }) id!: number;
  @Column({ type: "varchar", length: 255, unique: true }) email!: string;
  @Column({ name: "password_hash", type: "varchar", length: 255 }) passwordHash!: string;
  @Column({ type: "varchar", length: 150 }) name!: string;
  @Column({ type: "enum", enum: UserRole, enumName: "user_role", default: UserRole.USER }) role!: UserRole;
  @Column({ name: "is_active", type: "boolean", default: true }) isActive!: boolean;
  @CreateDateColumn({ name: "created_at", type: "timestamptz" }) createdAt!: Date;
  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" }) updatedAt!: Date;
}
