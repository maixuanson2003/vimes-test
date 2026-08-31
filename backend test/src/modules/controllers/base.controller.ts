import type { RequestHandler } from "express";
import type { DeepPartial, ObjectLiteral } from "typeorm";
import { z } from "zod";
import type { BaseLogic } from "../logic/index.js";
import { ApiResponse } from "../../shared/dto/ApiResponse.js";

const idSchema = z.coerce.number().int().positive();

export class BaseController<T extends ObjectLiteral> {
  constructor(protected readonly logic: BaseLogic<T>) {}

  findAll: RequestHandler = async (_req, res) => {
    const data = await this.logic.findAll();
    res.json({ success: true, data, meta: { total: data.length } });
  };

  findById: RequestHandler = async (req, res) => {
    const data = await this.logic.findById(idSchema.parse(req.params.id));
    res.json({ success: true, data });
  };

  create: RequestHandler = async (req, res) => {
    const data = await this.logic.create(req.body as DeepPartial<T>);
    res.status(201).json({ success: true, data });
  };

  update: RequestHandler = async (req, res) => {
    const data = await this.logic.update(
      idSchema.parse(req.params.id),
      req.body as DeepPartial<T>,
    );
    res.json({ success: true, data });
  };

  delete: RequestHandler = async (req, res) => {
    await this.logic.delete(idSchema.parse(req.params.id));
    res.status(204).send();
  };

  setSuccessApiResponse(result: Object | null, msg: string): ApiResponse {
    return new ApiResponse(result, "success", msg);
  }
}
