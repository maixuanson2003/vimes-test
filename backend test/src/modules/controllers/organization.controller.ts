import { BaseController } from "./base.controller.js";
import { OrganizationLogic } from "../logic/organization.logic.js";
import { Organization } from "../models/organization.entity.js";
export class OrganizationController extends BaseController<Organization> {
  constructor() {
    super(new OrganizationLogic());
  }
}
