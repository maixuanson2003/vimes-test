import { AppDataSource } from "../../config/database.js";
import { Department } from "../models/department.entity.js";
import { DepartmentRepository } from "../repositories/department.repository.js";
import { BaseLogic } from "./base.logic.js";
export class DepartmentLogic extends BaseLogic<Department> { constructor() { super(new DepartmentRepository(AppDataSource), "Department"); } }
