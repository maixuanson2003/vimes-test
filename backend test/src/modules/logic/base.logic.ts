import type { DeepPartial, ObjectLiteral } from "typeorm";
import type { BaseRepository } from "../repositories/base.repository.js";
import { AppError } from "../../shared/errors/app-error.js";

export class BaseLogic<
  T extends ObjectLiteral,
  R extends BaseRepository<T> = BaseRepository<T>,
> {
  constructor(
    protected readonly repository: R,
    private readonly entityName: string,
  ) {}

  findAll(): Promise<T[]> {
    return this.repository.findAll();
  }

  async findById(id: number): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity)
      throw new AppError(
        404,
        `${this.entityName} not found`,
        "ENTITY_NOT_FOUND",
      );
    return entity;
  }

  create(data: DeepPartial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.repository.update(id, data);
    if (!entity)
      throw new AppError(
        404,
        `${this.entityName} not found`,
        "ENTITY_NOT_FOUND",
      );
    return entity;
  }

  async delete(id: number): Promise<void> {
    if (!(await this.repository.delete(id))) {
      throw new AppError(
        404,
        `${this.entityName} not found`,
        "ENTITY_NOT_FOUND",
      );
    }
  }
}
