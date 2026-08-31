import { describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/database.js", () => ({
  AppDataSource: {},
}));

const { findLowStockMock } = vi.hoisted(() => ({
  findLowStockMock: vi.fn(),
}));

vi.mock("../../src/modules/repositories/product.repository.js", () => ({
  ProductRepository: class {
    findLowStock = findLowStockMock;
  },
}));

import { ProductLogic } from "../../src/modules/logic/product.logic.js";

describe("ProductLogic", () => {
  it("delegates the low-stock query to the repository", async () => {
    const products = [{ id: 1, name: "Low stock" }];
    findLowStockMock.mockResolvedValue(products);

    const result = await new ProductLogic().findLowStock();

    expect(findLowStockMock).toHaveBeenCalledOnce();
    expect(result).toBe(products);
  });
});
