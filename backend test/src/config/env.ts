import "dotenv/config";
import { z } from "zod";
export const env = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().positive().default(3000),
    DATABASE_URL: z.string().min(1),
    DATABASE_SSL: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    MIGRATIONS_RUN: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    JWT_SECRET: z
      .string()
      .min(32)
      .default("development-only-jwt-secret-change-me"),
    JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(28800),
    ADMIN_EMAIL: z.string().email().default("admin@vimes.local"),
    ADMIN_PASSWORD: z.string().min(8).default("Admin@123"),
    ADMIN_NAME: z.string().min(1).default("Quản trị viên"),
    SEED_USER_PASSWORD: z.string().min(8).default("User@123456"),
    UPLOAD_DIR: z.string().min(1).default("uploads"),
  })
  .parse(process.env);
