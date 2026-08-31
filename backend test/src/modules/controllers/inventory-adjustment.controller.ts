import { BaseController } from "./base.controller.js";
import { InventoryAdjustmentLogic } from "../logic/index.js";
import { InventoryAdjustment } from "../models/inventory-adjustment.entity.js";

export class InventoryAdjustmentController extends BaseController<InventoryAdjustment> {
  constructor() {
    super(new InventoryAdjustmentLogic());
  }
}
