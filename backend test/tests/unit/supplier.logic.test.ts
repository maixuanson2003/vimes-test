import { expect, it, vi } from "vitest";
const findAll = vi.hoisted(() => vi.fn());
vi.mock("../../src/config/database.js", () => ({ AppDataSource: {} }));
vi.mock("../../src/modules/repositories/supplier.repository.js", () => ({
  SupplierRepository: class {
    findAll = findAll;
  },
}));
import { SupplierLogic } from "../../src/modules/logic/supplier.logic.js";
it("SupplierLogic delegates listing to its repository", async () => {
  findAll.mockResolvedValue([{ id: 1 }]);
  await expect(new SupplierLogic().findAll()).resolves.toEqual([{ id: 1 }]);
});
