export type ItemIssue = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export type CreateIssue = {
  issueNumber: string;
  issueDate: string;
  reason?: string;
  recipient?: string;
  ItemIssue: ItemIssue[];
};
