export type ApiResponse<T> =
  | { success: true; data: T; meta?: { total: number } }
  | { success: false; error: { code: string; message?: string } };

export type Entity = { id: number };
export type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";
export type UserRole = "ADMIN" | "USER" | "STOREKEEPER" | "CHIEF_ACCOUNTANT";
export type User = Entity & { email: string; name: string; role: UserRole; isActive: boolean; createdAt?: string };
export type Organization = Entity & { code: string; name: string; isActive: boolean };
export type Department = Entity & { organizationId: number; code: string; name: string; isActive: boolean; organization?: Organization };

export type Supplier = Entity & { name: string; address: string | null; phone: string | null };
export type Product = Entity & { sku: string; name: string; unit: string; purchasePrice: number; salePrice: number; stockQuantity: number; minimumStock: number; status: "ACTIVE" | "INACTIVE"; createdAt?: string };
export type GoodsReceiptItem = Entity & { receiptId: number; productId: number; documentQuantity: number; actualQuantity: number; unitPrice: number; lineAmount: number; product?: Product };
export type GoodsReceipt = Entity & { receiptNumber: string; receiptDate: string; postingDate: string; organizationId: number | null; organization?: Organization | null; departmentId: number | null; department?: Department | null; debitAccount: string | null; creditAccount: string | null; supplierId: number | null; supplier?: Supplier | null; delivererName: string; sourceDocument: string | null; warehouseName: string | null; location: string | null; status: ReceiptStatus; totalAmount: number; totalAmountInWords: string | null; attachedDocuments: string | null; preparedById: number | null; preparedBy?: User | null; deliveredBy: string | null; storekeeperId: number | null; storekeeper?: User | null; chiefAccountantId: number | null; chiefAccountant?: User | null; createdAt?: string; items?: GoodsReceiptItem[] };
export type GoodsReceiptAttachment = Entity & { receiptId: number; originalName: string; mimeType: string; size: number; createdAt: string };
export type GoodsIssueItem = Entity & { issueId: number; productId: number; quantity: number; unitPrice: number; lineAmount: number; product?: Product };
export type GoodsIssue = Entity & { issueNumber: string; issueDate: string; reason: string | null; recipient: string | null; status: ReceiptStatus; totalAmount: number; createdAt?: string; items?: GoodsIssueItem[] };
export type InventoryAdjustment = Entity & { productId: number; quantityDelta: number; reason: string; adjustmentDate: string; createdAt?: string; product?: Product };

export type CreateReceiptPayload = { receiptNumber: string; receiptDate: string; postingDate: string; organizationId?: number; departmentId?: number; debitAccount?: string; creditAccount?: string; supplierId?: number; delivererName: string; sourceDocument?: string; warehouseName?: string; location?: string; attachedDocuments?: string; preparedById?: number; deliveredBy?: string; storekeeperId?: number; chiefAccountantId?: number; ItemReceipt: Array<{ productId: number; documentQuantity: number; actualQuantity: number; unitPrice: number }> };
export type CreateIssuePayload = { issueNumber: string; issueDate: string; reason?: string; recipient?: string; ItemIssue: Array<{ productId: number; quantity: number; unitPrice: number }> };
