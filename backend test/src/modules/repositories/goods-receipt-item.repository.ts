import type { DeepPartial } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { GoodsReceiptItem } from "../models/goods-receipt-item.entity.js";
import { BaseRepository } from "./base.repository.js";
export class GoodsReceiptItemRepository extends BaseRepository<GoodsReceiptItem> {
  protected get repository() {
    return AppDataSource.getRepository(GoodsReceiptItem);
  }
  findByReceiptId(receiptId: number) {
    return this.repository.find({
      where: { receiptId },
      relations: { product: true },
      order: { id: "ASC" },
    });
  }

  async createMany(
    data: DeepPartial<GoodsReceiptItem>[],
  ): Promise<GoodsReceiptItem[]> {
    if (data.length === 0) return [];

    const items = this.repository.create(data);
    return this.repository.save(items);
  }
}
