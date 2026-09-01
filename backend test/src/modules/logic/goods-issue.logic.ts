import { GoodsIssue } from "../models/goods-issue.entity.js";
import { AppDataSource } from "../../config/database.js";
import { AppError } from "../../shared/errors/app-error.js";
import { WarehouseDocumentStatus } from "../models/warehouse-document-status.enum.js";
import { GoodsIssueItemRepository } from "../repositories/goods-issue-item.repository.js";
import { GoodsIssueRepository } from "../repositories/goods-issue.repository.js";
import { ProductRepository } from "../repositories/product.repository.js";
import type { CreateIssue } from "../types/goods-issue.types.js";
import { BaseLogic } from "./base.logic.js";

export class GoodsIssueLogic extends BaseLogic<
  GoodsIssue,
  GoodsIssueRepository
> {
  private readonly issueItemRepository: GoodsIssueItemRepository;
  private readonly productRepository: ProductRepository;

  constructor() {
    super(new GoodsIssueRepository(AppDataSource), "Goods issue");
    this.issueItemRepository = new GoodsIssueItemRepository(AppDataSource);
    this.productRepository = new ProductRepository(AppDataSource);
  }

  countNumberIssue(): Promise<number> {
    return this.repository.countNumberIssue();
  }

  async createIssue(data: CreateIssue): Promise<GoodsIssue> {
    if (data.ItemIssue.length === 0) {
      throw new AppError(
        400,
        "Goods issue must have at least one item",
        "EMPTY_ISSUE_ITEMS",
      );
    }

    const issueNumberInput = data.issueNumber.trim();
    if (issueNumberInput && !/^PXK\d+$/.test(issueNumberInput)) {
      throw new AppError(
        400,
        "Issue number must have format PXK followed by digits",
        "INVALID_ISSUE_NUMBER",
      );
    }

    const totalIssue = await this.repository.countNumberIssue();
    const issueNumber =
      issueNumberInput || `PXK${String(totalIssue + 1).padStart(5, "0")}`;
    if (await this.repository.findByIssueNumber(issueNumber)) {
      throw new AppError(
        409,
        "Issue number already exists",
        "DUPLICATE_ISSUE_NUMBER",
      );
    }

    const items = data.ItemIssue.map((item) => {
      const documentQuantity = item.documentQuantity ?? item.quantity;
      if (documentQuantity < 0 || item.quantity <= 0 || item.unitPrice < 0) {
        throw new AppError(
          400,
          "Issue quantity must be positive and unit price cannot be negative",
          "INVALID_ISSUE_ITEM",
        );
      }
      return {
        ...item,
        documentQuantity,
        lineAmount:
          Math.round((item.quantity * item.unitPrice + Number.EPSILON) * 100) /
          100,
      };
    });

    const requestedQuantityByProduct = new Map<number, number>();
    for (const item of items) {
      requestedQuantityByProduct.set(
        item.productId,
        (requestedQuantityByProduct.get(item.productId) ?? 0) + item.quantity,
      );
    }

    for (const [productId, requestedQuantity] of requestedQuantityByProduct) {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new AppError(
          404,
          `Product ${productId} not found`,
          "PRODUCT_NOT_FOUND",
        );
      }
      if (product.stockQuantity < requestedQuantity) {
        throw new AppError(
          409,
          `Insufficient stock for product ${productId}`,
          "INSUFFICIENT_STOCK",
          {
            productId,
            available: product.stockQuantity,
            requested: requestedQuantity,
          },
        );
      }
    }

    const totalAmount =
      Math.round(
        (items.reduce((sum, item) => sum + item.lineAmount, 0) +
          Number.EPSILON) *
          100,
      ) / 100;
    const { ItemIssue: _ItemIssue, ...issueData } = data;

    return this.repository.transaction(async (manager) => {
      const issue = await this.repository.create(
        { ...issueData, issueNumber, totalAmount },
        manager,
      );
      issue.items = await this.issueItemRepository.createMany(
        items.map((item) => ({ ...item, issueId: issue.id })),
        manager,
      );
      return issue;
    });
  }

  async confirmIssue(id: number): Promise<GoodsIssue> {
    return this.repository.transaction(async (manager) => {
      const issue = await this.repository.findById(id);
      const issueItems = await this.issueItemRepository.findByIssueId(id);

      if (!issue) {
        throw new AppError(404, "Goods issue not found", "ENTITY_NOT_FOUND");
      }
      if (issue.status !== WarehouseDocumentStatus.DRAFT) {
        throw new AppError(
          409,
          `Cannot confirm a goods issue with status ${issue.status}`,
          "INVALID_ISSUE_STATUS",
        );
      }

      for (const item of issueItems) {
        const product = await this.productRepository.findByIdForUpdate(
          manager,
          item.productId,
        );
        if (!product) {
          throw new AppError(
            404,
            `Product ${item.productId} not found`,
            "PRODUCT_NOT_FOUND",
          );
        }
        if (product.stockQuantity < item.quantity) {
          throw new AppError(
            409,
            `Insufficient stock for product ${item.productId}`,
            "INSUFFICIENT_STOCK",
            {
              productId: item.productId,
              available: product.stockQuantity,
              requested: item.quantity,
            },
          );
        }
        await this.productRepository.update(
          item.productId,
          { stockQuantity: product.stockQuantity - item.quantity },
          manager,
        );
      }

      const confirmedIssue = await this.repository.update(
        id,
        { status: WarehouseDocumentStatus.CONFIRMED },
        manager,
      );
      if (!confirmedIssue) {
        throw new AppError(404, "Goods issue not found", "ENTITY_NOT_FOUND");
      }
      return confirmedIssue;
    });
  }

  async cancelIssue(id: number): Promise<GoodsIssue> {
    const cancelledIssue = await this.repository.update(id, {
      status: WarehouseDocumentStatus.CANCELLED,
    });
    if (!cancelledIssue) {
      throw new AppError(404, "Goods issue not found", "ENTITY_NOT_FOUND");
    }
    return cancelledIssue;
  }
}
