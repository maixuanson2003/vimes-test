import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
import {
  verifyAccessToken,
  type AccessTokenPayload,
} from "../shared/security/token.js";
import { UserRole } from "../modules/models/user.entity.js";

export type AuthenticatedRequest = Express.Request & {
  user: AccessTokenPayload;
};

export const authenticate: RequestHandler = (req, _res, next) => {
  const authorization = req.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token)
    throw new AppError(401, "Bearer token is required", "AUTH_REQUIRED");
  (req as unknown as AuthenticatedRequest).user = verifyAccessToken(token);
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  const user = (req as unknown as AuthenticatedRequest).user;
  if (!user || user.role !== UserRole.ADMIN)
    throw new AppError(403, "Admin role is required", "ADMIN_REQUIRED");
  next();
};
