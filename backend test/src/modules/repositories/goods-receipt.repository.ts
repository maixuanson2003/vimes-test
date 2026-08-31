import type { DeepPartial, EntityManager } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { GoodsReceipt } from "../models/goods-receipt.entity.js";
import { BaseRepository } from "./base.repository.js";

export class GoodsReceiptRepository extends BaseRepository<GoodsReceipt> {
  protected get repository() {
    return AppDataSource.getRepository(GoodsReceipt);
  }
  findByReceiptNumber(receiptNumber: string) {
    return this.repository.findOne({
      where: { receiptNumber },
      relations: { supplier: true, items: { product: true } },
    });
  }
  findDetail(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: { supplier: true, items: { product: true } },
    });
  }

  countNumberReceipt(): Promise<number> {
    return this.repository.count();
  }
  async createWithItems(data: DeepPartial<GoodsReceipt>) {
    return AppDataSource.transaction((manager) =>
      manager.save(GoodsReceipt, manager.create(GoodsReceipt, data)),
    );
  }

  transaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    return AppDataSource.transaction(work);
  }

  findForConfirmation(
    manager: EntityManager,
    id: number,
  ): Promise<GoodsReceipt | null> {
    return manager
      .getRepository(GoodsReceipt)
      .createQueryBuilder("receipt")
      .setLock("pessimistic_write", undefined, ["receipt"])
      .leftJoinAndSelect("receipt.items", "item")
      .where("receipt.id = :id", { id })
      .getOne();
  }

}
