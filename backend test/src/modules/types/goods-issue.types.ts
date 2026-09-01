export type ItemIssue = {
  productId: number;
  documentQuantity?: number;
  quantity: number;
  unitPrice: number;
};

export type CreateIssue = {
  issueNumber: string;
  issueDate: string;
  reason?: string;
  recipient?: string;
  recipientAddress?: string;
  debitAccount?: string;
  creditAccount?: string;
  warehouseName?: string;
  location?: string;
  totalAmountInWords?: string;
  attachedDocuments?: string;
  preparedById?: number;
  storekeeperId?: number;
  chiefAccountantId?: number;
  ItemIssue: ItemIssue[];
};
