import { Supplier } from "../models/supplier.entity.js";
import { AppDataSource } from "../../config/database.js";
import { SupplierRepository } from "../repositories/supplier.repository.js";
import { BaseLogic } from "./base.logic.js";

export class SupplierLogic extends BaseLogic<Supplier> {
  constructor() {
    super(new SupplierRepository(AppDataSource), "Supplier");
  }
}
