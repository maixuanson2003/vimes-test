import { expect, it, vi } from "vitest";
const findAll=vi.hoisted(()=>vi.fn()); vi.mock("../../src/config/database.js",()=>({AppDataSource:{}})); vi.mock("../../src/modules/repositories/inventory-adjustment.repository.js",()=>({InventoryAdjustmentRepository:class{findAll=findAll;}}));
import { InventoryAdjustmentLogic } from "../../src/modules/logic/inventory-adjustment.logic.js";
it("InventoryAdjustmentLogic delegates listing to its repository",async()=>{findAll.mockResolvedValue([{id:1}]);await expect(new InventoryAdjustmentLogic().findAll()).resolves.toEqual([{id:1}]);});
