import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppDataSource } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../shared/errors/app-error.js";
import { GoodsIssue, GoodsIssueAttachment } from "../models/index.js";

const allowedExtensions = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".zip",
]);
const uploadDirectory = path.resolve(env.UPLOAD_DIR);

export class GoodsIssueAttachmentLogic {
  private readonly repository =
    AppDataSource.getRepository(GoodsIssueAttachment);
  private readonly issueRepository = AppDataSource.getRepository(GoodsIssue);
  list(issueId: number) {
    return this.repository.find({
      where: { issueId },
      order: { createdAt: "DESC" },
    });
  }
  async upload(
    issueId: number,
    originalName: string,
    mimeType: string,
    content: Buffer,
  ) {
    if (!(await this.issueRepository.existsBy({ id: issueId })))
      throw new AppError(404, "Goods issue not found", "ENTITY_NOT_FOUND");
    const safeName = path.basename(originalName).trim();
    const extension = path.extname(safeName).toLowerCase();
    if (!safeName || !allowedExtensions.has(extension))
      throw new AppError(
        400,
        "Unsupported attachment type",
        "INVALID_ATTACHMENT_TYPE",
      );
    if (!content.length)
      throw new AppError(400, "Attachment is empty", "EMPTY_ATTACHMENT");
    await mkdir(uploadDirectory, { recursive: true });
    const storedName = `${randomUUID()}${extension}`;
    const filePath = path.join(uploadDirectory, storedName);
    await writeFile(filePath, content, { flag: "wx" });
    try {
      return await this.repository.save(
        this.repository.create({
          issueId,
          originalName: safeName,
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
  async get(issueId: number, attachmentId: number) {
    const attachment = await this.repository.findOneBy({
      id: attachmentId,
      issueId,
    });
    if (!attachment)
      throw new AppError(404, "Attachment not found", "ENTITY_NOT_FOUND");
    return {
      attachment,
      filePath: path.join(uploadDirectory, attachment.storedName),
    };
  }
  async delete(issueId: number, attachmentId: number) {
    const { attachment, filePath } = await this.get(issueId, attachmentId);
    await this.repository.remove(attachment);
    await unlink(filePath).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    });
  }
}
