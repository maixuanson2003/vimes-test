import { z } from "zod";
const optional = z.string().trim().max(255).optional();
export const createReceiptSchema = z
  .object({
    receiptNo: z.string().trim().min(1).max(50),
    receiptDate: z.string().date(),
    organizationName: optional,
    departmentName: optional,
    debitAccount: z.string().trim().max(50).optional(),
    creditAccount: z.string().trim().max(50).optional(),
    delivererName: optional,
    sourceDocumentNo: z.string().trim().max(100).optional(),
    sourceDocumentDate: z.string().date().optional(),
    reason: z.string().trim().max(2000).optional(),
    warehouseName: z.string().trim().min(1).max(255),
    attachedDocumentCount: z.number().int().nonnegative().default(0),
    items: z
      .array(
        z.object({
          itemName: z.string().trim().min(1).max(500),
          itemCode: z.string().trim().max(100).optional(),
          unitName: z.string().trim().min(1).max(50),
          documentQuantity: z.number().nonnegative(),
          actualQuantity: z.number().positive(),
          unitPrice: z.number().nonnegative(),
        }),
      )
      .min(1)
      .max(500),
  })
  .strict();
