import { Router } from "express";
import { asyncHandler } from "../../middlewares/async-handler.js";
import { SupplierController } from "../controllers/supplier.controller.js";

const controller = new SupplierController();
export const supplierRouter = Router();

supplierRouter.get("/", asyncHandler(controller.findAll));
supplierRouter.get("/:id", asyncHandler(controller.findById));
supplierRouter.post("/", asyncHandler(controller.create));
supplierRouter.put("/:id", asyncHandler(controller.update));
supplierRouter.patch("/:id", asyncHandler(controller.update));
supplierRouter.delete("/:id", asyncHandler(controller.delete));
