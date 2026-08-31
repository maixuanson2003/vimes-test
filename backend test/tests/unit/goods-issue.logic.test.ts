import { beforeEach, describe, expect, it, vi } from "vitest";
import { WarehouseDocumentStatus } from "../../src/modules/models/warehouse-document-status.enum.js";

vi.mock("../../src/config/database.js", () => ({ AppDataSource: {} }));

const mocks = vi.hoisted(() => ({
  transaction: vi.fn(),
  countNumberIssue: vi.fn(),
  findByIssueNumber: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  updateIssue: vi.fn(),
  findByIssueId: vi.fn(),
  createMany: vi.fn(),
  findByIdForUpdate: vi.fn(),
  findProductById: vi.fn(),
  updateProduct: vi.fn(),
}));

vi.mock("../../src/modules/repositories/goods-issue.repository.js", () => ({
  GoodsIssueRepository: class {
    transaction = mocks.transaction;
    countNumberIssue = mocks.countNumberIssue;
    findByIssueNumber = mocks.findByIssueNumber;
    findById = mocks.findById;
    create = mocks.create;
    update = mocks.updateIssue;
  },
}));

vi.mock(
  "../../src/modules/repositories/goods-issue-item.repository.js",
  () => ({
    GoodsIssueItemRepository: class {
      findByIssueId = mocks.findByIssueId;
      createMany = mocks.createMany;
    },
  }),
);

vi.mock("../../src/modules/repositories/product.repository.js", () => ({
  ProductRepository: class {
    findById = mocks.findProductById;
    findByIdForUpdate = mocks.findByIdForUpdate;
    update = mocks.updateProduct;
  },
}));

import { GoodsIssueLogic } from "../../src/modules/logic/goods-issue.logic.js";

describe("GoodsIssueLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation((work) => work({}));
  });

  it("creates an issue with generated number and calculated total", async () => {
    mocks.countNumberIssue.mockResolvedValue(2);
    mocks.findByIssueNumber.mockResolvedValue(null);
    mocks.findProductById.mockResolvedValue({ id: 10, stockQuantity: 10 });
    mocks.create.mockResolvedValue({ id: 5, issueNumber: "PXK00003" });
    mocks.createMany.mockResolvedValue([{ id: 1, issueId: 5 }]);

    const result = await new GoodsIssueLogic().createIssue({
      issueNumber: "",
      issueDate: "2026-08-30",
      ItemIssue: [{ productId: 10, quantity: 2, unitPrice: 12.5 }],
    });

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ issueNumber: "PXK00003", totalAmount: 25 }),
      {},
    );
    expect(result.items).toHaveLength(1);
  });

  it("rejects an invalid issue number", async () => {
    await expect(
      new GoodsIssueLogic().createIssue({
        issueNumber: "ISSUE-1",
        issueDate: "2026-08-30",
        ItemIssue: [{ productId: 10, quantity: 1, unitPrice: 10 }],
      }),
    ).rejects.toMatchObject({ code: "INVALID_ISSUE_NUMBER" });
  });

  it("rejects creation when total requested stock is insufficient", async () => {
    mocks.countNumberIssue.mockResolvedValue(0);
    mocks.findByIssueNumber.mockResolvedValue(null);
    mocks.findProductById.mockResolvedValue({ id: 10, stockQuantity: 4 });

    await expect(
      new GoodsIssueLogic().createIssue({
        issueNumber: "PXK1",
        issueDate: "2026-08-30",
        ItemIssue: [
          { productId: 10, quantity: 3, unitPrice: 10 },
          { productId: 10, quantity: 2, unitPrice: 10 },
        ],
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
      details: { productId: 10, available: 4, requested: 5 },
    });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("confirms an issue and subtracts product stock", async () => {
    mocks.findById.mockResolvedValue({
      id: 1,
      status: WarehouseDocumentStatus.DRAFT,
    });
    mocks.findByIssueId.mockResolvedValue([{ productId: 10, quantity: 3 }]);
    mocks.findByIdForUpdate.mockResolvedValue({ id: 10, stockQuantity: 8 });
    mocks.updateProduct.mockResolvedValue({ id: 10, stockQuantity: 5 });
    const confirmed = { id: 1, status: WarehouseDocumentStatus.CONFIRMED };
    mocks.updateIssue.mockResolvedValue(confirmed);

    await expect(new GoodsIssueLogic().confirmIssue(1)).resolves.toBe(confirmed);
    expect(mocks.updateProduct).toHaveBeenCalledWith(
      10,
      { stockQuantity: 5 },
      {},
    );
  });

  it("rejects confirmation when stock is insufficient", async () => {
    mocks.findById.mockResolvedValue({
      id: 1,
      status: WarehouseDocumentStatus.DRAFT,
    });
    mocks.findByIssueId.mockResolvedValue([{ productId: 10, quantity: 9 }]);
    mocks.findByIdForUpdate.mockResolvedValue({ id: 10, stockQuantity: 8 });

    await expect(new GoodsIssueLogic().confirmIssue(1)).rejects.toMatchObject({
      statusCode: 409,
      code: "INSUFFICIENT_STOCK",
    });
    expect(mocks.updateIssue).not.toHaveBeenCalled();
  });

  it("cancels an issue by changing only its status", async () => {
    const cancelled = { id: 1, status: WarehouseDocumentStatus.CANCELLED };
    mocks.updateIssue.mockResolvedValue(cancelled);

    await expect(new GoodsIssueLogic().cancelIssue(1)).resolves.toBe(cancelled);
    expect(mocks.updateIssue).toHaveBeenCalledWith(1, {
      status: WarehouseDocumentStatus.CANCELLED,
    });
  });
});
