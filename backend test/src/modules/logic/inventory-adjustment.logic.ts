import { InventoryAdjustment } from "../models/inventory-adjustment.entity.js";
import { AppDataSource } from "../../config/database.js";
import { InventoryAdjustmentRepository } from "../repositories/inventory-adjustment.repository.js";
import { BaseLogic } from "./base.logic.js";

export class InventoryAdjustmentLogic extends BaseLogic<InventoryAdjustment> {
  constructor() {
    super(
      new InventoryAdjustmentRepository(AppDataSource),
      "Inventory adjustment",
    );
  }
}
