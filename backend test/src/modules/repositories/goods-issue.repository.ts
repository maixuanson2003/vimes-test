import type { DeepPartial } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { GoodsIssue } from "../models/goods-issue.entity.js";
import { BaseRepository } from "./base.repository.js";
export class GoodsIssueRepository extends BaseRepository<GoodsIssue> {
  protected get repository() {
    return AppDataSource.getRepository(GoodsIssue);
  }
  findByIssueNumber(issueNumber: string) {
    return this.repository.findOne({
      where: { issueNumber },
      relations: { items: { product: true } },
    });
  }
  findDetail(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: { items: { product: true } },
    });
  }
  countNumberIssue(): Promise<number> {
    return this.repository.count();
  }
  createWithItems(data: DeepPartial<GoodsIssue>) {
    return AppDataSource.transaction((manager) =>
      manager.save(GoodsIssue, manager.create(GoodsIssue, data)),
    );
  }
}
