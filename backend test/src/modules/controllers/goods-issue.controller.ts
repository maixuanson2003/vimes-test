import { BaseController } from "./base.controller.js";
import { GoodsIssueLogic } from "../logic/index.js";
import { GoodsIssue } from "../models/goods-issue.entity.js";
import type { RequestHandler } from "express";
import { z } from "zod";
import type { CreateIssue } from "../types/goods-issue.types.js";

const idSchema = z.coerce.number().int().positive();

export class GoodsIssueController extends BaseController<GoodsIssue> {
  private readonly goodsIssueLogic: GoodsIssueLogic;

  constructor() {
    const logic = new GoodsIssueLogic();
    super(logic);
    this.goodsIssueLogic = logic;
  }

  createIssue: RequestHandler = async (req, res) => {
    const data = await this.goodsIssueLogic.createIssue(
      req.body as CreateIssue,
    );
    res.status(201).json({ success: true, data });
  };

  nextNumber: RequestHandler = async (_req, res) => {
    const count = await this.goodsIssueLogic.countNumberIssue();
    res.json({
      success: true,
      data: { issueNumber: `PXK${String(count + 1).padStart(5, "0")}` },
    });
  };

  confirmIssue: RequestHandler = async (req, res) => {
    const data = await this.goodsIssueLogic.confirmIssue(
      idSchema.parse(req.params.id),
    );
    res.json({ success: true, data });
  };

  cancelIssue: RequestHandler = async (req, res) => {
    const data = await this.goodsIssueLogic.cancelIssue(
      idSchema.parse(req.params.id),
    );
    res.json({ success: true, data });
  };
}
