import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppDataSource } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { GoodsReceipt } from "../models/goods-receipt.entity.js";
import { GoodsReceiptAttachment } from "../models/goods-receipt-attachment.entity.js";

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".zip",
]);
const uploadDirectory = path.resolve(env.UPLOAD_DIR);

export class GoodsReceiptAttachmentLogic {
  private readonly repository = AppDataSource.getRepository(
    GoodsReceiptAttachment,
  );
  private readonly receiptRepository =
    AppDataSource.getRepository(GoodsReceipt);

  list(receiptId: number): Promise<GoodsReceiptAttachment[]> {
    return this.repository.find({
      where: { receiptId },
      order: { createdAt: "DESC" },
    });
  }

  async upload(
    receiptId: number,
    originalName: string,
    mimeType: string,
    content: Buffer,
  ): Promise<GoodsReceiptAttachment> {
    if (!(await this.receiptRepository.existsBy({ id: receiptId }))) {
      throw new AppError(404, "Goods receipt not found", "ENTITY_NOT_FOUND");
    }
    const safeOriginalName = path.basename(originalName).trim();
    const extension = path.extname(safeOriginalName).toLowerCase();
    if (!safeOriginalName || !allowedExtensions.has(extension)) {
      throw new AppError(
        400,
        "Unsupported attachment type",
        "INVALID_ATTACHMENT_TYPE",
      );
    }
    if (!content.length) {
      throw new AppError(400, "Attachment is empty", "EMPTY_ATTACHMENT");
    }

    await mkdir(uploadDirectory, { recursive: true });
    const storedName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDirectory, storedName);
    await writeFile(filePath, content, { flag: "wx" });
    try {
      return await this.repository.save(
        this.repository.create({
          receiptId,
          originalName: safeOriginalName,
          storedName,
          mimeType: mimeType || "application/octet-stream",
          size: content.length,
        }),
      );
    } catch (error) {
      await unlink(filePath).catch(() => undefined);
      throw error;
    }
  }

  async get(
    receiptId: number,
    attachmentId: number,
  ): Promise<{
    attachment: GoodsReceiptAttachment;
    filePath: string;
  }> {
    const attachment = await this.repository.findOneBy({
      id: attachmentId,
      receiptId,
    });
    if (!attachment) {
      throw new AppError(404, "Attachment not found", "ENTITY_NOT_FOUND");
    }
    return {
      attachment,
      filePath: path.join(uploadDirectory, attachment.storedName),
    };
  }

  async delete(receiptId: number, attachmentId: number): Promise<void> {
    const { attachment, filePath } = await this.get(receiptId, attachmentId);
    await this.repository.remove(attachment);
    await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}
