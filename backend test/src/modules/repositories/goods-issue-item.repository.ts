import type { DeepPartial, EntityManager } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { GoodsIssueItem } from "../models/goods-issue-item.entity.js";
import { BaseRepository } from "./base.repository.js";
export class GoodsIssueItemRepository extends BaseRepository<GoodsIssueItem> {
  protected get repository() {
    return AppDataSource.getRepository(GoodsIssueItem);
  }
  findByIssueId(issueId: number) {
    return this.repository.find({
      where: { issueId },
      relations: { product: true },
      order: { id: "ASC" },
    });
  }

  async createMany(
    data: DeepPartial<GoodsIssueItem>[],
    manager?: EntityManager,
  ): Promise<GoodsIssueItem[]> {
    if (data.length === 0) return [];
    const repository = manager
      ? manager.getRepository(GoodsIssueItem)
      : this.repository;
    return repository.save(repository.create(data));
  }
}
