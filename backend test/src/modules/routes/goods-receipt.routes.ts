import express, { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { GoodsReceiptController } from "../controllers/goods-receipt.controller.js";
import { GoodsReceiptAttachmentController } from "../controllers/goods-receipt-attachment.controller.js";

const controller = new GoodsReceiptController();
const attachmentController = new GoodsReceiptAttachmentController();
export const goodsReceiptRouter = Router();

goodsReceiptRouter.get("/", asyncHandler(controller.findAll));
goodsReceiptRouter.get("/next-number", asyncHandler(controller.nextNumber));
goodsReceiptRouter.get("/:id", asyncHandler(controller.findById));
goodsReceiptRouter.post("/", asyncHandler(controller.createReceipt));
goodsReceiptRouter.get("/:id/attachments", asyncHandler(attachmentController.list));
goodsReceiptRouter.post(
  "/:id/attachments",
  express.raw({ type: "application/octet-stream", limit: "20mb" }),
  asyncHandler(attachmentController.upload),
);
goodsReceiptRouter.get(
  "/:id/attachments/:attachmentId/download",
  asyncHandler(attachmentController.download),
);
goodsReceiptRouter.delete(
  "/:id/attachments/:attachmentId",
  asyncHandler(attachmentController.delete),
);
goodsReceiptRouter.post("/:id/confirm", asyncHandler(controller.confirmReceipt));
goodsReceiptRouter.post("/:id/cancel", asyncHandler(controller.cancelReceipt));
goodsReceiptRouter.put("/:id", asyncHandler(controller.updateReceipt));
goodsReceiptRouter.patch("/:id", asyncHandler(controller.updateReceipt));
goodsReceiptRouter.delete("/:id", asyncHandler(controller.delete));
