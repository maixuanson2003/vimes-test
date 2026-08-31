import type {
  CalculatedReceipt,
  CreateReceiptInput,
} from "../types/warehouse-receipt.types.js";
const round = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
export const calculateReceipt = (
  input: CreateReceiptInput,
): CalculatedReceipt => {
  const items = input.items.map((item, index) => ({
    ...item,
    lineNo: index + 1,
    lineAmount: round(item.actualQuantity * item.unitPrice),
  }));
  return {
    ...input,
    items,
    totalAmount: round(items.reduce((sum, item) => sum + item.lineAmount, 0)),
  };
};
