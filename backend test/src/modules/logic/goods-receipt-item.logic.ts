import { GoodsReceiptItem } from "../models/goods-receipt-item.entity.js";
import { AppDataSource } from "../../config/database.js";
import { GoodsReceiptItemRepository } from "../repositories/goods-receipt-item.repository.js";
import { BaseLogic } from "./base.logic.js";

export class GoodsReceiptItemLogic extends BaseLogic<GoodsReceiptItem> {
  constructor() {
    super(new GoodsReceiptItemRepository(AppDataSource), "Goods receipt item");
  }
}
