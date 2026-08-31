import type { RequestHandler } from "express";
import { z } from "zod";
import { AuthLogic } from "../logic/auth.logic.js";
import type { AuthenticatedRequest } from "../../middlewares/auth.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
const logic = new AuthLogic();

export class AuthController {
  login: RequestHandler = async (req, res) => {
    const input = loginSchema.parse(req.body);
    res.json({
      success: true,
      data: await logic.login(input.email, input.password),
    });
  };
  me: RequestHandler = async (req, res) => {
    const user = (req as unknown as AuthenticatedRequest).user;
    res.json({ success: true, data: await logic.findPublicUser(user.sub) });
  };
}
