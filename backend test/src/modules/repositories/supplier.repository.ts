import { AppDataSource } from "../../config/database.js";
import { Supplier } from "../models/supplier.entity.js";
import { BaseRepository } from "./base.repository.js";

export class SupplierRepository extends BaseRepository<Supplier> {
  protected get repository() {
    return AppDataSource.getRepository(Supplier);
  }
  findByPhone(phone: string) {
    return this.repository.findOneBy({ phone });
  }
  findWithReceipts(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: { goodsReceipts: true },
    });
  }
}
