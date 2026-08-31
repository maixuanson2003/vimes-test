import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { InventoryAdjustmentController } from "../controllers/inventory-adjustment.controller.js";

const controller = new InventoryAdjustmentController();
export const inventoryAdjustmentRouter = Router();

inventoryAdjustmentRouter.get("/", asyncHandler(controller.findAll));
inventoryAdjustmentRouter.get("/:id", asyncHandler(controller.findById));
inventoryAdjustmentRouter.post("/", asyncHandler(controller.create));
inventoryAdjustmentRouter.put("/:id", asyncHandler(controller.update));
inventoryAdjustmentRouter.patch("/:id", asyncHandler(controller.update));
inventoryAdjustmentRouter.delete("/:id", asyncHandler(controller.delete));
