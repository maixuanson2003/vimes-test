import { AppDataSource } from "../../config/database.js";
import { Department } from "../models/department.entity.js";
import { BaseRepository } from "./base.repository.js";
export class DepartmentRepository extends BaseRepository<Department> {
  protected get repository() {
    return AppDataSource.getRepository(Department);
  }
  findAll() {
    return this.repository.find({ relations: { organization: true } });
  }
}
