import { BaseController } from "./base.controller.js";
import { GoodsIssueItemLogic } from "../logic/index.js";
import { GoodsIssueItem } from "../models/goods-issue-item.entity.js";

export class GoodsIssueItemController extends BaseController<GoodsIssueItem> {
  constructor() {
    super(new GoodsIssueItemLogic());
  }
}
