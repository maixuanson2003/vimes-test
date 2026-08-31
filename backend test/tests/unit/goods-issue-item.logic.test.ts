import { expect, it, vi } from "vitest";
const findAll = vi.hoisted(() => vi.fn());
vi.mock("../../src/config/database.js", () => ({ AppDataSource: {} }));
vi.mock(
  "../../src/modules/repositories/goods-issue-item.repository.js",
  () => ({
    GoodsIssueItemRepository: class {
      findAll = findAll;
    },
  }),
);
import { GoodsIssueItemLogic } from "../../src/modules/logic/goods-issue-item.logic.js";
it("GoodsIssueItemLogic delegates listing to its repository", async () => {
  findAll.mockResolvedValue([{ id: 1 }]);
  await expect(new GoodsIssueItemLogic().findAll()).resolves.toEqual([
    { id: 1 },
  ]);
});
