import { beforeEach, describe, expect, it, vi } from "vitest";
import { WarehouseDocumentStatus } from "../../src/modules/models/warehouse-document-status.enum.js";

vi.mock("../../src/config/database.js", () => ({
  AppDataSource: {},
}));

const {
  transactionMock,
  findByIdMock,
  findByReceiptIdMock,
  updateMock,
  changeStockMock,
} = vi.hoisted(() => ({
  transactionMock: vi.fn(),
  findByIdMock: vi.fn(),
  findByReceiptIdMock: vi.fn(),
  updateMock: vi.fn(),
  changeStockMock: vi.fn(),
}));

vi.mock("../../src/modules/repositories/goods-receipt.repository.js", () => ({
  GoodsReceiptRepository: class {
    transaction = transactionMock;
    findById = findByIdMock;
    update = updateMock;
  },
}));

vi.mock("../../src/modules/repositories/product.repository.js", () => ({
  ProductRepository: class {
    changeStock = changeStockMock;
  },
}));

vi.mock(
  "../../src/modules/repositories/goods-receipt-item.repository.js",
  () => ({
    GoodsReceiptItemRepository: class {
      findByReceiptId = findByReceiptIdMock;
    },
  }),
);

import { GoodsReceiptLogic } from "../../src/modules/logic/goods-receipt.logic.js";

describe("GoodsReceiptLogic status transitions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transactionMock.mockImplementation((work) => work({}));
  });

  it("confirms a draft receipt", async () => {
    const receipt = {
      id: 1,
      status: WarehouseDocumentStatus.DRAFT,
    };
    const items = [
      { productId: 10, actualQuantity: 2 },
      { productId: 20, actualQuantity: 3 },
    ];
    findByIdMock.mockResolvedValue(receipt);
    findByReceiptIdMock.mockResolvedValue(items);
    const confirmedReceipt = {
      ...receipt,
      status: WarehouseDocumentStatus.CONFIRMED,
    };
    updateMock.mockResolvedValue(confirmedReceipt);

    await expect(new GoodsReceiptLogic().confirmReceipt(1)).resolves.toBe(
      confirmedReceipt,
    );
    expect(changeStockMock).toHaveBeenNthCalledWith(1, {}, 10, 2);
    expect(changeStockMock).toHaveBeenNthCalledWith(2, {}, 20, 3);
    expect(updateMock).toHaveBeenCalledWith(
      1,
      { status: WarehouseDocumentStatus.CONFIRMED },
      {},
    );
  });

  it("cancels a draft receipt", async () => {
    const receipt = { id: 1, status: WarehouseDocumentStatus.CANCELLED };
    findByIdMock.mockResolvedValue({
      id: 1,
      status: WarehouseDocumentStatus.DRAFT,
    });
    updateMock.mockResolvedValue(receipt);

    await expect(new GoodsReceiptLogic().cancelReceipt(1)).resolves.toBe(
      receipt,
    );
    expect(updateMock).toHaveBeenCalledWith(1, {
      status: WarehouseDocumentStatus.CANCELLED,
    });
  });

  it("rejects confirming a cancelled receipt", async () => {
    findByIdMock.mockResolvedValue({
      id: 1,
      status: WarehouseDocumentStatus.CANCELLED,
    });
    findByReceiptIdMock.mockResolvedValue([]);

    await expect(new GoodsReceiptLogic().confirmReceipt(1)).rejects.toMatchObject(
      { statusCode: 409, code: "INVALID_RECEIPT_STATUS" },
    );
  });

  it("returns 404 when cancelling a missing receipt", async () => {
    findByIdMock.mockResolvedValue(null);

    await expect(new GoodsReceiptLogic().cancelReceipt(99)).rejects.toMatchObject(
      { statusCode: 404, code: "ENTITY_NOT_FOUND" },
    );
  });

  it("rejects cancelling a confirmed receipt", async () => {
    findByIdMock.mockResolvedValue({
      id: 1,
      status: WarehouseDocumentStatus.CONFIRMED,
    });

    await expect(new GoodsReceiptLogic().cancelReceipt(1)).rejects.toMatchObject(
      { statusCode: 409, code: "INVALID_RECEIPT_STATUS" },
    );
    expect(updateMock).not.toHaveBeenCalled();
  });
});
