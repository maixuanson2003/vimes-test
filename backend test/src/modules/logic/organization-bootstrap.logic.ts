import { AppDataSource } from "../../config/database.js";
import { Department } from "../models/department.entity.js";
import { Organization } from "../models/organization.entity.js";

export class OrganizationBootstrapLogic {
  async bootstrap(): Promise<void> {
    const organizationRepository = AppDataSource.getRepository(Organization);
    const departmentRepository = AppDataSource.getRepository(Department);

    let organization = await organizationRepository.findOneBy({ code: "VIMES" });
    if (!organization) {
      organization = await organizationRepository.save(
        organizationRepository.create({
          code: "VIMES",
          name: "Công ty VIMES",
          isActive: true,
        }),
      );
      console.log("Bootstrap organization created: VIMES");
    }

    const departments = [
      { code: "KHO", name: "Bộ phận Kho" },
      { code: "KE_TOAN", name: "Bộ phận Kế toán" },
      { code: "MUA_HANG", name: "Bộ phận Mua hàng" },
      { code: "SAN_XUAT", name: "Bộ phận Sản xuất" },
      { code: "BAN_GIAM_DOC", name: "Ban giám đốc" },
    ];
    const existing = await departmentRepository.find({
      where: departments.map((department) => ({ code: department.code })),
    });
    const existingCodes = new Set(existing.map((department) => department.code));
    const missing = departments.filter((department) => !existingCodes.has(department.code));
    if (!missing.length) return;
    await departmentRepository.save(
      missing.map((department) =>
        departmentRepository.create({
          ...department,
          organizationId: organization.id,
          isActive: true,
        }),
      ),
    );
    console.log(`Bootstrap departments created: ${missing.map((item) => item.code).join(", ")}`);
  }
}
