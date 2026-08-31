import type { RequestHandler } from "express";
import { BaseController } from "./base.controller.js";
import { ProductLogic } from "../logic/index.js";
import { Product } from "../models/product.entity.js";

export class ProductController extends BaseController<Product> {
  private readonly productLogic: ProductLogic;

  constructor() {
    const productLogic = new ProductLogic();
    super(productLogic);
    this.productLogic = productLogic;
  }

  findLowStock: RequestHandler = async (_req, res) => {
    const data = await this.productLogic.findLowStock();
    res.json({ success: true, data, meta: { total: data.length } });
  };
}
