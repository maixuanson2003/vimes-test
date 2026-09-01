import type { EntityManager } from "typeorm";
import { AppDataSource } from "../../config/database.js";
import { Product, ProductStatus } from "../models/product.entity.js";
import { BaseRepository } from "./base.repository.js";

export class ProductRepository extends BaseRepository<Product> {
  protected get repository() {
    return AppDataSource.getRepository(Product);
  }
  findBySku(sku: string) {
    return this.repository.findOneBy({ sku });
  }
  findActive() {
    return this.repository.find({
      where: { status: ProductStatus.ACTIVE },
      order: { name: "ASC" },
    });
  }
  async changeStock(
    manager: EntityManager,
    productId: number,
    delta: number,
  ): Promise<Product> {
    const repo = manager.getRepository(Product);
    const product = await repo
      .createQueryBuilder("p")
      .setLock("pessimistic_write")
      .where("p.id = :productId", { productId })
      .getOneOrFail();
    const next = product.stockQuantity + delta;
    if (next < 0) throw new Error("INSUFFICIENT_STOCK");
    product.stockQuantity = next;
    return repo.save(product);
  }

  findByIdForUpdate(
    manager: EntityManager,
    productId: number,
  ): Promise<Product | null> {
    return manager
      .getRepository(Product)
      .createQueryBuilder("product")
      .setLock("pessimistic_write")
      .where("product.id = :productId", { productId })
      .getOne();
  }
}
