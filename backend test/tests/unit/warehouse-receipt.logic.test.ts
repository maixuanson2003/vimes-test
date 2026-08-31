import { describe, expect, it } from "vitest";
import { calculateReceipt } from "../../src/modules/logic/warehouse-receipt.logic.js";
describe("calculateReceipt", () => {
  it("calculates line and total amounts", () => {
    const r = calculateReceipt({
      receiptNo: "PNK-01",
      receiptDate: "2026-08-27",
      warehouseName: "Kho A",
      items: [
        {
          itemName: "Thép",
          unitName: "Tấm",
          documentQuantity: 2,
          actualQuantity: 2,
          unitPrice: 10.25,
        },
      ],
    });
    expect(r.items[0]?.lineAmount).toBe(20.5);
    expect(r.totalAmount).toBe(20.5);
  });
});
