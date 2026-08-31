import { AppDataSource } from "../../config/database.js";
import { Organization } from "../models/organization.entity.js";
import { OrganizationRepository } from "../repositories/organization.repository.js";
import { BaseLogic } from "./base.logic.js";
export class OrganizationLogic extends BaseLogic<Organization> { constructor() { super(new OrganizationRepository(AppDataSource), "Organization"); } }
