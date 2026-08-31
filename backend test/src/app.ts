import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFound } from "./middlewares/not-found.js";
import { apiRouter } from "./modules/routes/index.js";
import { authRouter } from "./modules/routes/auth.routes.js";
import { authenticate, requireAdmin } from "./middlewares/auth.js";

export const createApp = () => {
  const app = express();
  app.use(
    helmet(),
    cors({ origin: env.CORS_ORIGIN.split(",") }),
    express.json({ limit: "1mb" }),
  );
  app.get("/health", (_req, res) =>
    res.json({ success: true, data: { status: "ok" } }),
  );
  app.use("/api/auth", authRouter);
  app.use("/api", authenticate, requireAdmin, apiRouter);
  app.use(notFound, errorHandler);
  return app;
};
