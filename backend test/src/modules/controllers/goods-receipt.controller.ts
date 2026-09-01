import type { RequestHandler } from "express";
import { BaseController } from "./base.controller.js";
import { GoodsReceiptLogic } from "../logic/index.js";
import { GoodsReceipt } from "../models/goods-receipt.entity.js";
import type {
  createReceipt,
  updateReceipt,
} from "../types/goods-receipt.types.js";
import { z } from "zod";

const idSchema = z.coerce.number().int().positive();

export class GoodsReceiptController extends BaseController<GoodsReceipt> {
  private readonly goodsReceiptLogic: GoodsReceiptLogic;

  constructor() {
    const logic = new GoodsReceiptLogic();
    super(logic);
    this.goodsReceiptLogic = logic;
  }

  createReceipt: RequestHandler = async (req, res) => {
    const data = await this.goodsReceiptLogic.createReceipt(
      req.body as createReceipt,
    );
    res.status(201).json({ success: true, data });
  };

  nextNumber: RequestHandler = async (_req, res) => {
    const count = await this.goodsReceiptLogic.countNumberReceipt();
    res.json({
      success: true,
      data: { receiptNumber: `PNK${String(count + 1).padStart(5, "0")}` },
    });
  };

  updateReceipt: RequestHandler = async (req, res) => {
    const data = await this.goodsReceiptLogic.updateReceipt(
      idSchema.parse(req.params.id),
      req.body as updateReceipt,
    );
    res.json({ success: true, data });
  };

  confirmReceipt: RequestHandler = async (req, res) => {
    const data = await this.goodsReceiptLogic.confirmReceipt(
      idSchema.parse(req.params.id),
    );
    res.json({ success: true, data });
  };

  cancelReceipt: RequestHandler = async (req, res) => {
    const data = await this.goodsReceiptLogic.cancelReceipt(
      idSchema.parse(req.params.id),
    );
    res.json({ success: true, data });
  };
}
