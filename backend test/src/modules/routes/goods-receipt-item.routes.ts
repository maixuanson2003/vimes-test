import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { GoodsReceiptItemController } from "../controllers/goods-receipt-item.controller.js";

const controller = new GoodsReceiptItemController();
export const goodsReceiptItemRouter = Router();

goodsReceiptItemRouter.get("/", asyncHandler(controller.findAll));
goodsReceiptItemRouter.get("/:id", asyncHandler(controller.findById));
goodsReceiptItemRouter.post("/", asyncHandler(controller.create));
goodsReceiptItemRouter.put("/:id", asyncHandler(controller.update));
goodsReceiptItemRouter.patch("/:id", asyncHandler(controller.update));
goodsReceiptItemRouter.delete("/:id", asyncHandler(controller.delete));
