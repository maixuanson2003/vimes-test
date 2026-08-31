import { expect, it, vi } from "vitest";
const findAll = vi.hoisted(() => vi.fn());
vi.mock("../../src/config/database.js", () => ({ AppDataSource: {} }));
vi.mock("../../src/modules/repositories/department.repository.js", () => ({
  DepartmentRepository: class {
    findAll = findAll;
  },
}));
import { DepartmentLogic } from "../../src/modules/logic/department.logic.js";
it("DepartmentLogic delegates listing to its repository", async () => {
  findAll.mockResolvedValue([{ id: 1 }]);
  await expect(new DepartmentLogic().findAll()).resolves.toEqual([{ id: 1 }]);
});
