export type ItemReceipt = {
  productId: number;
  documentQuantity: number;
  actualQuantity: number;
  unitPrice: number;
};

export type createReceipt = {
  receiptNumber: string;
  receiptDate: string;
  organization?: string;
  department?: string;
  debitNumber?: string;
  creditNumber?: string;
  supplierId?: number;
  delivererName: string;
  sourceDocument?: string;
  warehouseName?: string;
  location?: string;
  totalAmountInWords?: string;
  attachedDocuments?: string;
  preparedBy?: string;
  deliveredBy?: string;
  storekeeper?: string;
  chiefAccountant?: string;
  ItemReceipt: ItemReceipt[];
};
