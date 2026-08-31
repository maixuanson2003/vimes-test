export type ItemReceipt = {
  productId: number;
  documentQuantity: number;
  actualQuantity: number;
  unitPrice: number;
};

export type createReceipt = {
  receiptNumber: string;
  receiptDate: string;
  postingDate: string;
  organizationId?: number;
  departmentId?: number;
  debitAccount?: string;
  creditAccount?: string;
  supplierId?: number;
  delivererName: string;
  sourceDocument?: string;
  warehouseName?: string;
  location?: string;
  totalAmountInWords?: string;
  attachedDocuments?: string;
  preparedById?: number;
  deliveredBy?: string;
  storekeeperId?: number;
  chiefAccountantId?: number;
  ItemReceipt: ItemReceipt[];
};

export type updateReceipt = Omit<createReceipt, "receiptNumber" | "ItemReceipt"> & {
  ItemReceipt?: ItemReceipt[];
};
