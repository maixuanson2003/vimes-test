import { BaseController } from "./base.controller.js";
import { DepartmentLogic } from "../logic/department.logic.js";
import { Department } from "../models/department.entity.js";
export class DepartmentController extends BaseController<Department> { constructor() { super(new DepartmentLogic()); } }
