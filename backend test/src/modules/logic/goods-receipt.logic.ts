import { AppError } from "../../shared/errors/app-error.js";
import { AppDataSource } from "../../config/database.js";
import { In } from "typeorm";
import { GoodsReceipt } from "../models/goods-receipt.entity.js";
import { GoodsReceiptItem } from "../models/goods-receipt-item.entity.js";
import { User, UserRole } from "../models/user.entity.js";
import { WarehouseDocumentStatus } from "../models/warehouse-document-status.enum.js";
import { GoodsReceiptItemRepository } from "../repositories/goods-receipt-item.repository.js";
import { GoodsReceiptRepository } from "../repositories/goods-receipt.repository.js";
import { ProductRepository } from "../repositories/product.repository.js";
import { createReceipt, updateReceipt } from "../types/goods-receipt.types.js";
import { BaseLogic } from "./base.logic.js";
import { UserRepository } from "../repositories/user.repository.js";

export class GoodsReceiptLogic extends BaseLogic<
  GoodsReceipt,
  GoodsReceiptRepository
> {
  private goodReceiptItemRepository: GoodsReceiptItemRepository;
  private productRepository: ProductRepository;
  private userRepository: UserRepository;
  constructor() {
    super(new GoodsReceiptRepository(AppDataSource), "Goods receipt");
    this.goodReceiptItemRepository = new GoodsReceiptItemRepository(
      AppDataSource,
    );
    this.productRepository = new ProductRepository(AppDataSource);
    this.userRepository = new UserRepository(AppDataSource);
  }

  countNumberReceipt(): Promise<number> {
    return this.repository.countNumberReceipt();
  }

  private async validateAssignedUsers(data: {
    preparedById?: number | null;
    storekeeperId?: number | null;
    chiefAccountantId?: number | null;
  }): Promise<void> {
    const assignments = [
      { id: data.preparedById, role: null, field: "preparedById" },
      {
        id: data.storekeeperId,
        role: UserRole.STOREKEEPER,
        field: "storekeeperId",
      },
      {
        id: data.chiefAccountantId,
        role: UserRole.CHIEF_ACCOUNTANT,
        field: "chiefAccountantId",
      },
    ].filter(
      (
        assignment,
      ): assignment is { id: number; role: UserRole | null; field: string } =>
        typeof assignment.id === "number" && assignment.id > 0,
    );
    if (!assignments.length) return;
    const users = await this.userRepository.findBy({
      id: In(assignments.map((assignment) => assignment.id)),
      isActive: true,
    });
    for (const assignment of assignments) {
      const user = users.find((candidate) => candidate.id === assignment.id);
      if (
        !user ||
        (assignment.role !== null && user.role !== assignment.role)
      ) {
        throw new AppError(
          400,
          assignment.role === null
            ? `${assignment.field} must reference an active user`
            : `${assignment.field} must reference an active ${assignment.role} user`,
          "INVALID_RECEIPT_USER_ROLE",
          assignment,
        );
      }
    }
  }

  async confirmReceipt(id: number): Promise<GoodsReceipt> {
    return this.repository.transaction(async (manager) => {
      const receipt = await this.repository.findById(id);
      const receiptItem =
        await this.goodReceiptItemRepository.findByReceiptId(id);

      if (!receipt) {
        throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
      }

      if (
        [
          WarehouseDocumentStatus.CONFIRMED,
          WarehouseDocumentStatus.CANCELLED,
        ].includes(receipt.status)
      ) {
        throw new AppError(
          409,
          `Cannot confirm a goods receipt with status ${receipt.status}`,
          "INVALID_RECEIPT_STATUS",
          { id, status: receipt.status, action: "confirm" },
        );
      }

      for (const item of receiptItem) {
        await this.productRepository.changeStock(
          manager,
          item.productId,
          item.actualQuantity,
        );
      }

      const confirmedReceipt = await this.repository.update(
        id,
        { status: WarehouseDocumentStatus.CONFIRMED },
        manager,
      );

      if (!confirmedReceipt) {
        throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
      }

      return confirmedReceipt;
    });
  }

  async cancelReceipt(id: number): Promise<GoodsReceipt> {
    const receipt = await this.repository.findById(id);
    if (!receipt) {
      throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
    }
    if (receipt.status !== WarehouseDocumentStatus.DRAFT) {
      throw new AppError(
        409,
        `Cannot cancel a goods receipt with status ${receipt.status}`,
        "INVALID_RECEIPT_STATUS",
        { id, status: receipt.status, action: "cancel" },
      );
    }
    const cancelledReceipt = await this.repository.update(id, {
      status: WarehouseDocumentStatus.CANCELLED,
    });

    if (!cancelledReceipt) {
      throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
    }

    return cancelledReceipt;
  }

  async updateReceipt(id: number, data: updateReceipt): Promise<GoodsReceipt> {
    await this.validateAssignedUsers(data);
    return this.repository.transaction(async (manager) => {
      const receiptRepository = manager.getRepository(GoodsReceipt);
      const itemRepository = manager.getRepository(GoodsReceiptItem);
      const current = await receiptRepository.findOneBy({ id });
      if (!current) {
        throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
      }
      if (current.status !== WarehouseDocumentStatus.DRAFT) {
        throw new AppError(
          409,
          `Cannot update a goods receipt with status ${current.status}`,
          "INVALID_RECEIPT_STATUS",
          { id, status: current.status, action: "update" },
        );
      }

      const { ItemReceipt, ...header } = data;
      const totalAmount = ItemReceipt?.reduce(
        (total, item) => total + item.actualQuantity * item.unitPrice,
        0,
      );
      const updated = await receiptRepository.save(
        receiptRepository.merge(current, {
          ...header,
          ...(totalAmount === undefined
            ? {}
            : {
                totalAmount:
                  Math.round((totalAmount + Number.EPSILON) * 100) / 100,
              }),
        }),
      );
      if (ItemReceipt) {
        await itemRepository.delete({ receiptId: id });
        await itemRepository.save(
          ItemReceipt.map((item) =>
            itemRepository.create({ ...item, receiptId: id }),
          ),
        );
      }
      updated.items = await itemRepository.find({
        where: { receiptId: id },
        order: { id: "ASC" },
      });
      return updated;
    });
  }

  async createReceipt(data: createReceipt): Promise<GoodsReceipt> {
    await this.validateAssignedUsers(data);
    const totalReceipt = await this.repository.countNumberReceipt();
    const { ItemReceipt, ...receipt } = data;
    const calculatedItems = ItemReceipt.map((item) => ({
      ...item,
      lineAmount:
        Math.round(
          (item.actualQuantity * item.unitPrice + Number.EPSILON) * 100,
        ) / 100,
    }));
    const totalAmount = calculatedItems.reduce(
      (total, item) => total + item.lineAmount,
      0,
    );
    const receiptNum = data.receiptNumber.trim();
    if (receiptNum) {
      const match = /^PNK(\d+)$/.exec(receiptNum);
      if (!match) {
        throw new AppError(
          400,
          "Receipt number must have format PNK followed by digits",
          "INVALID_RECEIPT_NUMBER",
        );
      }
      const sequenceNumber = Number(match[1]);
      if (sequenceNumber <= totalReceipt) {
        throw new AppError(
          409,
          `Receipt number must be greater than PNK${String(totalReceipt).padStart(5, "0")}`,
          "RECEIPT_NUMBER_OUT_OF_SEQUENCE",
          { totalReceipt, sequenceNumber },
        );
      }
    }
    const receiptNumber =
      receiptNum || `PNK${String(totalReceipt + 1).padStart(5, "0")}`;
    const goodReceipt = await this.repository.createWithItems({
      ...receipt,
      receiptNumber,
      totalAmount: Math.round((totalAmount + Number.EPSILON) * 100) / 100,
    });

    const dataItem = calculatedItems.map((item) => {
      return {
        receiptId: goodReceipt.id,
        productId: item.productId,
        documentQuantity: item.documentQuantity,
        actualQuantity: item.actualQuantity,
        unitPrice: item.unitPrice,
        lineAmount: item.lineAmount,
      };
    });

    goodReceipt.items =
      await this.goodReceiptItemRepository.createMany(dataItem);
    return goodReceipt;
  }
}
