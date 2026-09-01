import { expect, it, vi } from "vitest";
const findAll = vi.hoisted(() => vi.fn());
vi.mock("../../src/config/database.js", () => ({ AppDataSource: {} }));
vi.mock(
  "../../src/modules/repositories/goods-receipt-item.repository.js",
  () => ({
    GoodsReceiptItemRepository: class {
      findAll = findAll;
    },
  }),
);
import { GoodsReceiptItemLogic } from "../../src/modules/logic/goods-receipt-item.logic.js";
it("GoodsReceiptItemLogic delegates listing to its repository", async () => {
  findAll.mockResolvedValue([{ id: 1 }]);
  await expect(new GoodsReceiptItemLogic().findAll()).resolves.toEqual([
    { id: 1 },
  ]);
});
