import {
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
  DataSource,
  EntityManager,
} from "typeorm";

export abstract class BaseRepository<T extends ObjectLiteral> {
  protected abstract get repository(): Repository<T>;
  constructor(protected readonly dataSource: DataSource) {}
  findAll(): Promise<T[]> {
    return this.repository.find();
  }
  findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
  }
  async create(data: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    const repository = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    return repository.save(repository.create(data));
  }

  async update(
    id: number,
    data: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T | null> {
    const repository = manager
      ? manager.getRepository<T>(this.repository.target)
      : this.repository;
    const entity = await repository.findOne({
      where: { id } as unknown as FindOptionsWhere<T>,
    });
    if (!entity) return null;
    return repository.save(repository.merge(entity, data));
  }
  async delete(id: number): Promise<boolean> {
    return (await this.repository.delete(id)).affected === 1;
  }

  async transaction<R>(
    callback: (manager: EntityManager) => Promise<R>,
  ): Promise<R> {
    return this.dataSource.transaction(callback);
  }
}
