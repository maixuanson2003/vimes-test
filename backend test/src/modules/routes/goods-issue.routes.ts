import express, { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { GoodsIssueController } from "../controllers/goods-issue.controller.js";
import { GoodsIssueAttachmentController } from "../controllers/goods-issue-attachment.controller.js";
import { validateBody } from "../../middlewares/validate-request.js";
import { createGoodsIssueSchema } from "../schemas/goods-document.schema.js";

const controller = new GoodsIssueController();
const attachmentController = new GoodsIssueAttachmentController();
export const goodsIssueRouter = Router();

goodsIssueRouter.get("/", asyncHandler(controller.findAll));
goodsIssueRouter.get("/next-number", asyncHandler(controller.nextNumber));
goodsIssueRouter.get("/:id", asyncHandler(controller.findById));
goodsIssueRouter.post(
  "/",
  validateBody(createGoodsIssueSchema),
  asyncHandler(controller.createIssue),
);
goodsIssueRouter.get(
  "/:id/attachments",
  asyncHandler(attachmentController.list),
);
goodsIssueRouter.post(
  "/:id/attachments",
  express.raw({ type: "application/octet-stream", limit: "20mb" }),
  asyncHandler(attachmentController.upload),
);
goodsIssueRouter.get(
  "/:id/attachments/:attachmentId/download",
  asyncHandler(attachmentController.download),
);
goodsIssueRouter.delete(
  "/:id/attachments/:attachmentId",
  asyncHandler(attachmentController.delete),
);
goodsIssueRouter.post("/:id/confirm", asyncHandler(controller.confirmIssue));
goodsIssueRouter.post("/:id/cancel", asyncHandler(controller.cancelIssue));
goodsIssueRouter.put("/:id", asyncHandler(controller.update));
goodsIssueRouter.patch("/:id", asyncHandler(controller.update));
goodsIssueRouter.delete("/:id", asyncHandler(controller.delete));
