import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../../config/env.js";
import { AppError } from "../errors/app-error.js";
import type { UserRole } from "../../modules/models/user.entity.js";

export type AccessTokenPayload = { sub: number; email: string; role: UserRole; iat: number; exp: number };
const encode = (value: string) => Buffer.from(value).toString("base64url");
const sign = (value: string) => createHmac("sha256", env.JWT_SECRET).update(value).digest("base64url");

export function createAccessToken(input: Omit<AccessTokenPayload, "iat" | "exp">): string {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(JSON.stringify({ ...input, iat: now, exp: now + env.JWT_EXPIRES_IN_SECONDS }));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned)}`;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) throw new AppError(401, "Invalid access token", "INVALID_TOKEN");
  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(unsigned));
  const actual = Buffer.from(parts[2]);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new AppError(401, "Invalid access token", "INVALID_TOKEN");
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as AccessTokenPayload;
    if (!payload.sub || !payload.email || !payload.role || payload.exp <= Math.floor(Date.now() / 1000)) throw new Error("expired");
    return payload;
  } catch {
    throw new AppError(401, "Access token is invalid or expired", "INVALID_TOKEN");
  }
}
