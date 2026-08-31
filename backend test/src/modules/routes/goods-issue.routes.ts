import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { GoodsIssueController } from "../controllers/goods-issue.controller.js";

const controller = new GoodsIssueController();
export const goodsIssueRouter = Router();

goodsIssueRouter.get("/", asyncHandler(controller.findAll));
goodsIssueRouter.get("/:id", asyncHandler(controller.findById));
goodsIssueRouter.post("/", asyncHandler(controller.createIssue));
goodsIssueRouter.post("/:id/confirm", asyncHandler(controller.confirmIssue));
goodsIssueRouter.post("/:id/cancel", asyncHandler(controller.cancelIssue));
goodsIssueRouter.put("/:id", asyncHandler(controller.update));
goodsIssueRouter.patch("/:id", asyncHandler(controller.update));
goodsIssueRouter.delete("/:id", asyncHandler(controller.delete));
