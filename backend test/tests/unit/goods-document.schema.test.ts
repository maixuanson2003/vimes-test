import { describe, expect, it } from "vitest";
import {
  createGoodsIssueSchema,
  createGoodsReceiptSchema,
} from "../../src/modules/schemas/goods-document.schema.js";

describe("goods document validation schemas", () => {
  it("accepts a valid goods receipt", () => {
    expect(
      createGoodsReceiptSchema.safeParse({
        receiptNumber: "PNK00001",
        receiptDate: "2026-09-01",
        postingDate: "2026-09-01",
        delivererName: "Nguyễn Văn A",
        ItemReceipt: [
          {
            productId: 1,
            documentQuantity: 1,
            actualQuantity: 1,
            unitPrice: 1,
          },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects a receipt with an empty item list", () => {
    expect(
      createGoodsReceiptSchema.safeParse({
        receiptNumber: "PNK00001",
        receiptDate: "2026-09-01",
        postingDate: "2026-09-01",
        delivererName: "Nguyễn Văn A",
        ItemReceipt: [],
      }).success,
    ).toBe(false);
  });

  it("accepts a valid goods issue", () => {
    expect(
      createGoodsIssueSchema.safeParse({
        issueNumber: "PXK00001",
        issueDate: "2026-09-01",
        recipient: "Nguyễn Văn B",
        ItemIssue: [
          { productId: 1, documentQuantity: 1, quantity: 1, unitPrice: 1 },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects duplicated products and invalid quantities", () => {
    expect(
      createGoodsIssueSchema.safeParse({
        issueNumber: "PXK00001",
        issueDate: "2026-09-01",
        recipient: "Nguyễn Văn B",
        ItemIssue: [
          { productId: 1, documentQuantity: 1, quantity: 0, unitPrice: 1 },
          { productId: 1, documentQuantity: 1, quantity: 1, unitPrice: 1 },
        ],
      }).success,
    ).toBe(false);
  });
});
