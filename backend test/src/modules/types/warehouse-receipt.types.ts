export type ReceiptItemInput = {
  itemName: string;
  itemCode?: string;
  unitName: string;
  documentQuantity: number;
  actualQuantity: number;
  unitPrice: number;
};
export type CreateReceiptInput = {
  receiptNo: string;
  receiptDate: string;
  organizationName?: string;
  departmentName?: string;
  debitAccount?: string;
  creditAccount?: string;
  delivererName?: string;
  sourceDocumentNo?: string;
  sourceDocumentDate?: string;
  reason?: string;
  warehouseName: string;
  attachedDocumentCount?: number;
  items: ReceiptItemInput[];
};
export type CalculatedItem = ReceiptItemInput & {
  lineNo: number;
  lineAmount: number;
};
export type CalculatedReceipt = Omit<CreateReceiptInput, "items"> & {
  items: CalculatedItem[];
  totalAmount: number;
};
