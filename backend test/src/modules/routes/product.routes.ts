import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { ProductController } from "../controllers/product.controller.js";

const controller = new ProductController();
export const productRouter = Router();

productRouter.get("/low-stock", asyncHandler(controller.findLowStock));
productRouter.get("/", asyncHandler(controller.findAll));
productRouter.get("/:id", asyncHandler(controller.findById));
productRouter.post("/", asyncHandler(controller.create));
productRouter.put("/:id", asyncHandler(controller.update));
productRouter.patch("/:id", asyncHandler(controller.update));
productRouter.delete("/:id", asyncHandler(controller.delete));
