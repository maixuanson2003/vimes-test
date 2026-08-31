import { Product } from "../models/product.entity.js";
import { AppDataSource } from "../../config/database.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { BaseLogic } from "./base.logic.js";

export class ProductLogic extends BaseLogic<Product> {
  private readonly productRepository: ProductRepository;

  constructor() {
    const productRepository = new ProductRepository(AppDataSource);
    super(productRepository, "Product");
    this.productRepository = productRepository;
  }

  findLowStock(): Promise<Product[]> {
    return this.productRepository.findLowStock();
  }
}
