import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors/app-error.js";
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error?.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Attachment must not exceed 20 MB",
      },
    });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ",
        details: error.flatten(),
      },
    });
    return;
  }
  const e =
    error instanceof AppError
      ? error
      : new AppError(500, "Internal server error", "INTERNAL_ERROR");
  if (e.statusCode === 500) console.error(error);
  res.status(e.statusCode).json({
    success: false,
    error: { code: e.code, message: e.message, details: e.details },
  });
};
