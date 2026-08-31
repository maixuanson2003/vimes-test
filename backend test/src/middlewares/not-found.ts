import type { RequestHandler } from "express";
import { AppError } from "../shared/errors/app-error.js";
export const notFound: RequestHandler = (req, _res, next) =>
  next(
    new AppError(
      404,
      `Route ${req.method} ${req.path} not found`,
      "ROUTE_NOT_FOUND",
    ),
  );
