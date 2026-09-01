import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  organization: { findOneBy: vi.fn(), save: vi.fn(), create: vi.fn((x) => x) },
  department: { find: vi.fn(), save: vi.fn(), create: vi.fn((x) => x) },
}));
vi.mock("../../src/config/database.js", () => ({
  AppDataSource: {
    getRepository: (entity: { name: string }) =>
      entity.name === "Organization" ? mocks.organization : mocks.department,
  },
}));
import { OrganizationBootstrapLogic } from "../../src/modules/logic/organization-bootstrap.logic.js";
describe("OrganizationBootstrapLogic", () => {
  beforeEach(() => vi.clearAllMocks());
  it("creates the organization and missing departments", async () => {
    mocks.organization.findOneBy.mockResolvedValue(null);
    mocks.organization.save.mockResolvedValue({ id: 10, code: "VIMES" });
    mocks.department.find.mockResolvedValue([]);
    await new OrganizationBootstrapLogic().bootstrap();
    expect(mocks.organization.save).toHaveBeenCalled();
    expect(mocks.department.save).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ organizationId: 10, code: "KHO" }),
        expect.objectContaining({ code: "KE_TOAN" }),
      ]),
    );
  });
  it("does nothing when all seed data exists", async () => {
    mocks.organization.findOneBy.mockResolvedValue({ id: 10, code: "VIMES" });
    mocks.department.find.mockResolvedValue([
      { code: "KHO" },
      { code: "KE_TOAN" },
      { code: "MUA_HANG" },
      { code: "SAN_XUAT" },
      { code: "BAN_GIAM_DOC" },
    ]);
    await new OrganizationBootstrapLogic().bootstrap();
    expect(mocks.organization.save).not.toHaveBeenCalled();
    expect(mocks.department.save).not.toHaveBeenCalled();
  });
});
