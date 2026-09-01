import { BaseController } from "./base.controller.js";
import { ProductLogic } from "../logic/index.js";
import { Product } from "../models/product.entity.js";

export class ProductController extends BaseController<Product> {
  constructor() {
    const productLogic = new ProductLogic();
    super(productLogic);
  }
}
