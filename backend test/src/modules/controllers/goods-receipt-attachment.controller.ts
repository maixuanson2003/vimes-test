import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../shared/errors/app-error.js";
import { GoodsReceiptAttachmentLogic } from "../logic/goods-receipt-attachment.logic.js";

const idSchema = z.coerce.number().int().positive();

export class GoodsReceiptAttachmentController {
  private readonly logic = new GoodsReceiptAttachmentLogic();

  list: RequestHandler = async (req, res) => {
    const data = await this.logic.list(idSchema.parse(req.params.id));
    res.json({ success: true, data });
  };

  upload: RequestHandler = async (req, res) => {
    const encodedName = req.header("x-file-name");
    if (!encodedName) {
      throw new AppError(400, "File name is required", "FILE_NAME_REQUIRED");
    }
    let originalName: string;
    try {
      originalName = decodeURIComponent(encodedName);
    } catch {
      throw new AppError(400, "Invalid file name", "INVALID_FILE_NAME");
    }
    if (!Buffer.isBuffer(req.body)) {
      throw new AppError(400, "File content is required", "FILE_REQUIRED");
    }
    const data = await this.logic.upload(
      idSchema.parse(req.params.id),
      originalName,
      req.header("content-type") ?? "application/octet-stream",
      req.body,
    );
    res.status(201).json({ success: true, data });
  };

  download: RequestHandler = async (req, res, next) => {
    const { attachment, filePath } = await this.logic.get(
      idSchema.parse(req.params.id),
      idSchema.parse(req.params.attachmentId),
    );
    res.type(attachment.mimeType);
    res.download(filePath, attachment.originalName, (error) => {
      if (error && !res.headersSent) next(error);
    });
  };

  delete: RequestHandler = async (req, res) => {
    await this.logic.delete(
      idSchema.parse(req.params.id),
      idSchema.parse(req.params.attachmentId),
    );
    res.status(204).send();
  };
}
