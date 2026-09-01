import type { RequestHandler } from "express";
import { z } from "zod";
import { AppDataSource } from "../../config/database.js";
import { hashPassword } from "../../shared/security/password.js";
import { User, UserRole } from "../models/user.entity.js";
import { UserRepository } from "../repositories/user.repository.js";

const idSchema = z.coerce.number().int().positive();
const inputSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(150),
  role: z.nativeEnum(UserRole),
  isActive: z
    .preprocess(
      (value) => (value === "true" ? true : value === "false" ? false : value),
      z.boolean(),
    )
    .default(true),
  password: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(8).optional(),
  ),
});
const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

export class UserController {
  private readonly repository = new UserRepository(AppDataSource);

  list: RequestHandler = async (_req, res) => {
    const users = await this.repository.findAllOrdered();
    res.json({ success: true, data: users.map(publicUser) });
  };

  create: RequestHandler = async (req, res) => {
    const input = inputSchema
      .extend({ password: z.string().min(8) })
      .parse(req.body);
    const user = await this.repository.create({
      email: input.email.trim().toLowerCase(),
      name: input.name,
      role: input.role,
      isActive: input.isActive,
      passwordHash: await hashPassword(input.password),
    });
    res.status(201).json({ success: true, data: publicUser(user) });
  };

  update: RequestHandler = async (req, res) => {
    const input = inputSchema.partial().parse(req.body);
    const user = await this.repository.findById(idSchema.parse(req.params.id));
    if (!user) {
      res
        .status(404)
        .json({ success: false, error: { code: "ENTITY_NOT_FOUND" } });
      return;
    }
    if (input.email !== undefined)
      user.email = input.email.trim().toLowerCase();
    if (input.name !== undefined) user.name = input.name;
    if (input.role !== undefined) user.role = input.role;
    if (input.isActive !== undefined) user.isActive = input.isActive;
    if (input.password) user.passwordHash = await hashPassword(input.password);
    res.json({
      success: true,
      data: publicUser(await this.repository.save(user)),
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.repository.delete(idSchema.parse(req.params.id));
    res.status(204).send();
  };
}
