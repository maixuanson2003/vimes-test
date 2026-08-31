import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { authenticate } from "../../middlewares/auth.js";
import { AuthController } from "../controllers/auth.controller.js";

const controller = new AuthController();
export const authRouter = Router();
authRouter.post("/login", asyncHandler(controller.login));
authRouter.get("/me", authenticate, asyncHandler(controller.me));
