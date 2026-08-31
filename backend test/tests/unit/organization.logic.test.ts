import { expect, it, vi } from "vitest";
const findAll=vi.hoisted(()=>vi.fn()); vi.mock("../../src/config/database.js",()=>({AppDataSource:{}})); vi.mock("../../src/modules/repositories/organization.repository.js",()=>({OrganizationRepository:class{findAll=findAll;}}));
import { OrganizationLogic } from "../../src/modules/logic/organization.logic.js";
it("OrganizationLogic delegates listing to its repository",async()=>{findAll.mockResolvedValue([{id:1}]);await expect(new OrganizationLogic().findAll()).resolves.toEqual([{id:1}]);});
