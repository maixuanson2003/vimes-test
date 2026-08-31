import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { UserController } from "../controllers/user.controller.js";

const controller = new UserController();
export const userRouter = Router();
userRouter.get("/", asyncHandler(controller.list));
userRouter.post("/", asyncHandler(controller.create));
userRouter.patch("/:id", asyncHandler(controller.update));
userRouter.delete("/:id", asyncHandler(controller.delete));
