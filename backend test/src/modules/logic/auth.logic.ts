import { AppDataSource } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import {
  hashPassword,
  verifyPassword,
} from "../../shared/security/password.js";
import { createAccessToken } from "../../shared/security/token.js";
import { User, UserRole } from "../models/user.entity.js";

const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
});

export class AuthLogic {
  private get users() {
    return AppDataSource.getRepository(User);
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (
      !user ||
      !user.isActive ||
      !(await verifyPassword(password, user.passwordHash))
    )
      throw new AppError(
        401,
        "Email hoặc mật khẩu không đúng",
        "INVALID_CREDENTIALS",
      );
    return {
      accessToken: createAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      tokenType: "Bearer",
      expiresIn: env.JWT_EXPIRES_IN_SECONDS,
      user: publicUser(user),
    };
  }

  async findPublicUser(id: number) {
    const user = await this.users.findOne({ where: { id, isActive: true } });
    if (!user)
      throw new AppError(
        401,
        "User is inactive or no longer exists",
        "INVALID_USER",
      );
    return publicUser(user);
  }

  async bootstrapAdmin(): Promise<void> {
    const email = env.ADMIN_EMAIL.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) return;
    await this.users.save(
      this.users.create({
        email,
        name: env.ADMIN_NAME,
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
    console.log(`Bootstrap admin created: ${email}`);
  }

  async bootstrapRoleUsers(): Promise<void> {
    const seedUsers = [
      {
        email: "user@vimes.local",
        name: "Người dùng kho",
        role: UserRole.USER,
      },
      {
        email: "preparer@vimes.local",
        name: "Nguyễn Văn Lập",
        role: UserRole.USER,
      },
      {
        email: "storekeeper@vimes.local",
        name: "Trần Thị Thủ Kho",
        role: UserRole.STOREKEEPER,
      },
      {
        email: "accountant@vimes.local",
        name: "Lê Văn Kế Toán",
        role: UserRole.CHIEF_ACCOUNTANT,
      },
    ];
    const existing = await this.users.find({
      select: { email: true },
      where: seedUsers.map((seed) => ({ email: seed.email })),
    });
    const existingEmails = new Set(existing.map((user) => user.email));
    const missingUsers = seedUsers.filter(
      (seed) => !existingEmails.has(seed.email),
    );
    if (!missingUsers.length) return;
    const passwordHash = await hashPassword(env.SEED_USER_PASSWORD);
    for (const seed of missingUsers) {
      await this.users.save(
        this.users.create({
          ...seed,
          passwordHash,
          isActive: true,
        }),
      );
      console.log(`Bootstrap ${seed.role} user created: ${seed.email}`);
    }
  }
}
