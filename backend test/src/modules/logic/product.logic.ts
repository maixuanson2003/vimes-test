import { Product } from "../models/product.entity.js";
import { AppDataSource } from "../../config/database.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { BaseLogic } from "./base.logic.js";

export class ProductLogic extends BaseLogic<Product> {
  constructor() {
    super(new ProductRepository(AppDataSource), "Product");
  }
}
