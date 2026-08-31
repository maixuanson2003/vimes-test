import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { GoodsIssueItemController } from "../controllers/goods-issue-item.controller.js";

const controller = new GoodsIssueItemController();
export const goodsIssueItemRouter = Router();

goodsIssueItemRouter.get("/", asyncHandler(controller.findAll));
goodsIssueItemRouter.get("/:id", asyncHandler(controller.findById));
goodsIssueItemRouter.post("/", asyncHandler(controller.create));
goodsIssueItemRouter.put("/:id", asyncHandler(controller.update));
goodsIssueItemRouter.patch("/:id", asyncHandler(controller.update));
goodsIssueItemRouter.delete("/:id", asyncHandler(controller.delete));
