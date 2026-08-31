import { AppDataSource } from "../../config/database.js";
import type { FindOptionsWhere } from "typeorm";
import { User, UserRole } from "../models/user.entity.js";
import { BaseRepository } from "./base.repository.js";

export class UserRepository extends BaseRepository<User> {
  protected get repository() {
    return AppDataSource.getRepository(User);
  }

  findAllOrdered(): Promise<User[]> {
    return this.repository.find({ order: { name: "ASC" } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOneBy({ email: email.trim().toLowerCase() });
  }

  findBy(
    where: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User[]> {
    return this.repository.findBy(where);
  }

  findActiveByRole(role: UserRole): Promise<User[]> {
    return this.repository.find({
      where: { role, isActive: true },
      order: { name: "ASC" },
    });
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }
}
