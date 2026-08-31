import { BaseController } from "./base.controller.js";
import { GoodsReceiptItemLogic } from "../logic/index.js";
import { GoodsReceiptItem } from "../models/goods-receipt-item.entity.js";

export class GoodsReceiptItemController extends BaseController<GoodsReceiptItem> {
  constructor() {
    super(new GoodsReceiptItemLogic());
  }
}
