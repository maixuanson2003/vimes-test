import { GoodsIssueItem } from "../models/goods-issue-item.entity.js";
import { AppDataSource } from "../../config/database.js";
import { GoodsIssueItemRepository } from "../repositories/goods-issue-item.repository.js";
import { BaseLogic } from "./base.logic.js";

export class GoodsIssueItemLogic extends BaseLogic<GoodsIssueItem> {
  constructor() {
    super(new GoodsIssueItemRepository(AppDataSource), "Goods issue item");
  }
}
