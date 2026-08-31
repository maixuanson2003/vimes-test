import { AppDataSource } from "../../config/database.js";
import { InventoryAdjustment } from "../models/inventory-adjustment.entity.js";
import { BaseRepository } from "./base.repository.js";
export class InventoryAdjustmentRepository extends BaseRepository<InventoryAdjustment> {
  protected get repository() {
    return AppDataSource.getRepository(InventoryAdjustment);
  }
  findByProductId(productId: number) {
    return this.repository.find({
      where: { productId },
      relations: { product: true },
      order: { adjustmentDate: "DESC", createdAt: "DESC" },
    });
  }
  findByDateRange(from: string, to: string) {
    return this.repository
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.product", "product")
      .where("a.ngay_dieu_chinh BETWEEN :from AND :to", { from, to })
      .orderBy("a.ngay_dieu_chinh", "DESC")
      .getMany();
  }
}
