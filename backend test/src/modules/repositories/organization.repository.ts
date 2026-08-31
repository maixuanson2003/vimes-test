import { AppDataSource } from "../../config/database.js";
import { Organization } from "../models/organization.entity.js";
import { BaseRepository } from "./base.repository.js";
export class OrganizationRepository extends BaseRepository<Organization> { protected get repository() { return AppDataSource.getRepository(Organization); } }
