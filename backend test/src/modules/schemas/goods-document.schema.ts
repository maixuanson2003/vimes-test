import { z } from "zod";

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD")
  .refine(
    (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
    "Ngày không hợp lệ",
  );
const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .nullish()
    .transform((value) => value ?? undefined);
const optionalId = z.number().int().positive().optional();
const receiptItem = z
  .object({
    productId: z.number().int().positive(),
    documentQuantity: z.number().finite().nonnegative(),
    actualQuantity: z.number().finite().positive(),
    unitPrice: z.number().finite().nonnegative(),
  })
  .strict();
const issueItem = z
  .object({
    productId: z.number().int().positive(),
    documentQuantity: z.number().finite().nonnegative(),
    quantity: z.number().finite().positive(),
    unitPrice: z.number().finite().nonnegative(),
  })
  .strict();

export const createGoodsReceiptSchema = z
  .object({
    receiptNumber: z
      .string()
      .trim()
      .regex(/^PNK\d+$/, "Số phiếu nhập phải có dạng PNK và chữ số"),
    receiptDate: date,
    postingDate: date,
    organizationId: optionalId,
    departmentId: optionalId,
    debitAccount: optionalText(50),
    creditAccount: optionalText(50),
    supplierId: optionalId,
    delivererName: z.string().trim().min(1, "Người giao là bắt buộc").max(150),
    sourceDocument: optionalText(255),
    warehouseName: optionalText(255),
    location: optionalText(255),
    totalAmountInWords: optionalText(500),
    attachedDocuments: optionalText(255),
    preparedById: optionalId,
    deliveredBy: optionalText(150),
    storekeeperId: optionalId,
    chiefAccountantId: optionalId,
    ItemReceipt: z
      .array(receiptItem)
      .min(1, "Phiếu phải có ít nhất một dòng hàng")
      .max(500)
      .superRefine((items, context) => {
        if (new Set(items.map((item) => item.productId)).size !== items.length)
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mỗi sản phẩm chỉ được xuất hiện một lần",
          });
      }),
  })
  .strict();

export const createGoodsIssueSchema = z
  .object({
    issueNumber: z
      .string()
      .trim()
      .regex(/^PXK\d+$/, "Số phiếu xuất phải có dạng PXK và chữ số"),
    issueDate: date,
    reason: optionalText(255),
    recipient: z.string().trim().min(1, "Người nhận là bắt buộc").max(150),
    recipientAddress: optionalText(255),
    debitAccount: optionalText(50),
    creditAccount: optionalText(50),
    warehouseName: optionalText(255),
    location: optionalText(255),
    totalAmountInWords: optionalText(500),
    attachedDocuments: optionalText(255),
    preparedById: optionalId,
    storekeeperId: optionalId,
    chiefAccountantId: optionalId,
    ItemIssue: z
      .array(issueItem)
      .min(1, "Phiếu phải có ít nhất một dòng hàng")
      .max(500)
      .superRefine((items, context) => {
        if (new Set(items.map((item) => item.productId)).size !== items.length)
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mỗi sản phẩm chỉ được xuất hiện một lần",
          });
      }),
  })
  .strict();
