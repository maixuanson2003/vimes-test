import { Router } from "express";
import { goodsIssueItemRouter } from "./goods-issue-item.routes.js";
import { goodsIssueRouter } from "./goods-issue.routes.js";
import { goodsReceiptItemRouter } from "./goods-receipt-item.routes.js";
import { goodsReceiptRouter } from "./goods-receipt.routes.js";
import { inventoryAdjustmentRouter } from "./inventory-adjustment.routes.js";
import { productRouter } from "./product.routes.js";
import { supplierRouter } from "./supplier.routes.js";
import { userRouter } from "./user.routes.js";
import { organizationRouter } from "./organization.routes.js";
import { departmentRouter } from "./department.routes.js";

export const apiRouter = Router();

apiRouter.use("/suppliers", supplierRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/organizations", organizationRouter);
apiRouter.use("/departments", departmentRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/goods-receipts", goodsReceiptRouter);
apiRouter.use("/goods-receipt-items", goodsReceiptItemRouter);
apiRouter.use("/goods-issues", goodsIssueRouter);
apiRouter.use("/goods-issue-items", goodsIssueItemRouter);
apiRouter.use("/inventory-adjustments", inventoryAdjustmentRouter);
