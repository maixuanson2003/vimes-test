import { BaseController } from "./base.controller.js";
import { SupplierLogic } from "../logic/index.js";
import { Supplier } from "../models/supplier.entity.js";

export class SupplierController extends BaseController<Supplier> {
  constructor() {
    super(new SupplierLogic());
  }
}
