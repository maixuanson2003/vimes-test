"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { FormField } from "@/components/form/form-field";
import { Attachments } from "./attachments";
import { GoodsTable, type GoodsRow } from "./goods-table";
import { api } from "@/lib/api/client";
import type {
  CreateReceiptPayload,
  GoodsReceipt,
  Product,
  Supplier,
  User,
} from "@/lib/api/types";
const money = new Intl.NumberFormat("vi-VN");
const today = () => new Date().toISOString().slice(0, 10);

export function ReceiptWorkspace() {
  const [rows, setRows] = useState<GoodsRow[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [supplierId, setSupplierId] = useState(0);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [receiptId, setReceiptId] = useState<number>();
  const [status, setStatus] = useState<GoodsReceipt["status"]>("DRAFT");
  const [receiptDate, setReceiptDate] = useState(today);
  const [postingDate, setPostingDate] = useState(today);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [delivererName, setDelivererName] = useState("");
  const [warehouseName, setWarehouseName] = useState("Kho nguyên vật liệu");
  const [location, setLocation] = useState("KCN Thăng Long, Đông Anh, Hà Nội");
  const [reason, setReason] = useState("Nhập hàng hóa phục vụ sản xuất");
  const [preparedById, setPreparedById] = useState(0);
  const [storekeeperId, setStorekeeperId] = useState(0);
  const [chiefAccountantId, setChiefAccountantId] = useState(0);
  const [debitAccount, setDebitAccount] = useState("152");
  const [creditAccount, setCreditAccount] = useState("331");
  const [accountingNote, setAccountingNote] = useState("Nhập kho hàng hóa");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    Promise.all([
      api<Supplier[]>("/suppliers"),
      api<Product[]>("/products"),
      api<User[]>("/users"),
    ])
      .then(([s, p, u]) => {
        setSuppliers(s);
        setProducts(p);
        setUsers(u);
        setPreparedById(u.find((user) => user.isActive)?.id ?? 0);
        setStorekeeperId(
          u.find((user) => user.role === "STOREKEEPER")?.id ?? 0,
        );
        setChiefAccountantId(
          u.find((user) => user.role === "CHIEF_ACCOUNTANT")?.id ?? 0,
        );
        setSupplierId(s[0]?.id ?? 0);
        setDelivererName("Trần Văn Hùng");
        setRows(
          p.slice(0, 5).map((x, i) => ({
            id: i + 1,
            productId: x.id,
            name: x.name,
            code: x.sku,
            unit: x.unit,
            documentQty: 1,
            actualQty: 1,
            unitPrice: 1,
          })),
        );
      })
      .catch((e) => setMessage(`Không tải được dữ liệu: ${e.message}`));
  }, []);
  const totals = useMemo(
    () => ({
      total: rows.reduce((s, r) => s + r.actualQty * r.unitPrice, 0),
      quantity: rows.reduce((s, r) => s + r.actualQty, 0),
    }),
    [rows],
  );
  const addRow = () => {
    const p = products.find((x) => !rows.some((r) => r.productId === x.id));
    if (p)
      setRows((r) => [
        ...r,
        {
          id: Date.now(),
          productId: p.id,
          name: p.name,
          code: p.sku,
          unit: p.unit,
          documentQty: 1,
          actualQty: 1,
          unitPrice: 1,
        },
      ]);
  };
  const reset = () => {
    setReceiptId(undefined);
    setReceiptNumber("");
    setStatus("DRAFT");
    setMessage("");
    setRows([]);
    setPendingAttachments([]);
    setReceiptDate(today());
    setPostingDate(today());
    setInvoiceNumber("");
    setInvoiceDate("");
  };
  const cancel = async () => {
    if (!receiptId) {
      reset();
      return;
    }
    setLoading(true);
    try {
      const receipt = await api<GoodsReceipt>(
        `/goods-receipts/${receiptId}/cancel`,
        { method: "POST" },
      );
      setStatus(receipt.status);
      setMessage(`Đã hủy phiếu ${receipt.receiptNumber}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  const save = async (confirm: boolean) => {
    setLoading(true);
    setMessage("");
    try {
      const payload: CreateReceiptPayload = {
        receiptNumber,
        receiptDate,
        postingDate,
        supplierId: supplierId || undefined,
        delivererName,
        warehouseName,
        location,
        sourceDocument:
          [invoiceNumber, invoiceDate].filter(Boolean).join(" - ") || undefined,
        debitAccount,
        creditAccount,
        preparedById: preparedById || undefined,
        deliveredBy: delivererName,
        storekeeperId: storekeeperId || undefined,
        chiefAccountantId: chiefAccountantId || undefined,
        ItemReceipt: rows.map((r) => ({
          productId: r.productId,
          documentQuantity: r.documentQty,
          actualQuantity: r.actualQty,
          unitPrice: r.unitPrice,
        })),
      };
      let receipt: GoodsReceipt;
      if (receiptId) {
        receipt = await api(`/goods-receipts/${receiptId}`, {
          method: "PATCH",
          body: JSON.stringify({
            receiptDate,
            postingDate,
            supplierId: supplierId || null,
            delivererName,
            sourceDocument: payload.sourceDocument,
            warehouseName,
            location,
            debitAccount,
            creditAccount,
            preparedById: preparedById || null,
            deliveredBy: delivererName,
            storekeeperId: storekeeperId || null,
            chiefAccountantId: chiefAccountantId || null,
            ItemReceipt: payload.ItemReceipt,
          }),
        });
      } else {
        receipt = await api("/goods-receipts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setReceiptId(receipt.id);
        setReceiptNumber(receipt.receiptNumber);
      }
      if (pendingAttachments.length) {
        for (const file of pendingAttachments) {
          await api(`/goods-receipts/${receipt.id}/attachments`, {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
              "X-File-Name": encodeURIComponent(file.name),
            },
            body: file,
          });
          setPendingAttachments((current) =>
            current.filter((item) => item !== file),
          );
        }
      }
      if (confirm)
        receipt = await api(`/goods-receipts/${receipt.id}/confirm`, {
          method: "POST",
        });
      setMessage(
        confirm
          ? `Đã ghi sổ phiếu ${receipt.receiptNumber}`
          : `Đã lưu nháp phiếu ${receipt.receiptNumber}`,
      );
      setStatus(receipt.status);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1320px] p-4 md:p-6">
      <div className="mb-4 flex items-center gap-4">
        <ArrowLeft />
        <h1 className="text-2xl font-semibold md:text-[28px]">
          Tạo phiếu nhập kho
        </h1>
        <Badge>
          {status === "CONFIRMED"
            ? "Đã ghi sổ"
            : status === "CANCELLED"
              ? "Đã hủy"
              : receiptId
                ? "Đã lưu"
                : "Bản nháp"}
        </Badge>
        <div className="ml-auto flex gap-3">
          <Button className="w-11 px-0">
            <MoreHorizontal />
          </Button>
          <Button disabled={loading || status !== "DRAFT"} onClick={cancel}>
            Hủy bỏ
          </Button>
        </div>
      </div>
      {message && (
        <div className="mb-4 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          {message}
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_326px]">
        <div className="space-y-4">
          <Card className="p-5">
            <CardTitle>Thông tin phiếu</CardTitle>
            <div className="mt-4 grid gap-x-8 gap-y-3 lg:grid-cols-2">
              <FormField label="Ngày phiếu" required>
                <Input
                  type="date"
                  value={receiptDate}
                  onChange={(event) => setReceiptDate(event.target.value)}
                />
              </FormField>
              <FormField label="Ngày hạch toán" required>
                <Input
                  type="date"
                  value={postingDate}
                  onChange={(event) => setPostingDate(event.target.value)}
                />
              </FormField>
              <FormField label="Số phiếu" required>
                <Input
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Để trống để tự sinh"
                />
              </FormField>
              <FormField label="Số hóa đơn">
                <Input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="0002357"
                />
              </FormField>
              <FormField label="Nhà cung cấp" required>
                <div className="flex">
                  <Select
                    value={supplierId}
                    onChange={(e) => setSupplierId(Number(e.target.value))}
                    className="rounded-r-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                  <Button className="w-10 rounded-l-none px-0">
                    <Plus />
                  </Button>
                </div>
              </FormField>
              <FormField label="Ngày hóa đơn">
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(event) => setInvoiceDate(event.target.value)}
                />
              </FormField>
              <FormField label="Địa chỉ">
                <Input
                  value={
                    suppliers.find((s) => s.id === supplierId)?.address ?? ""
                  }
                  readOnly
                />
              </FormField>
              <FormField label="Phương thức nhập">
                <Select>
                  <option>Nhập mua trong nước</option>
                </Select>
              </FormField>
              <FormField label="Diễn giải">
                <Input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </FormField>
              <FormField label="Người giao hàng">
                <Input
                  value={delivererName}
                  onChange={(event) => setDelivererName(event.target.value)}
                />
              </FormField>
              <FormField label="Người lập phiếu">
                <Select
                  value={preparedById}
                  onChange={(event) =>
                    setPreparedById(Number(event.target.value))
                  }
                >
                  <option value={0}>-- Chọn --</option>
                  {users
                    .filter((user) => user.isActive)
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Select>
              </FormField>
              <FormField label="Kế toán trưởng">
                <Select
                  value={chiefAccountantId}
                  onChange={(event) =>
                    setChiefAccountantId(Number(event.target.value))
                  }
                >
                  <option value={0}>-- Chọn --</option>
                  {users
                    .filter(
                      (user) =>
                        user.role === "CHIEF_ACCOUNTANT" && user.isActive,
                    )
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                </Select>
              </FormField>
            </div>
          </Card>
          <Card className="p-5">
            <CardTitle>Chi tiết hàng hóa</CardTitle>
            <div className="mt-4">
              <GoodsTable
                rows={rows}
                products={products}
                onAdd={addRow}
                onDelete={(id) => setRows((r) => r.filter((x) => x.id !== id))}
                onChange={(id, patch) =>
                  setRows((current) =>
                    current.map((row) =>
                      row.id === id ? { ...row, ...patch } : row,
                    ),
                  )
                }
              />
            </div>
          </Card>
          <Attachments
            documentId={receiptId}
            pendingFiles={pendingAttachments}
            onPendingFilesChange={setPendingAttachments}
          />
        </div>
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex gap-3">
              <Warehouse className="text-brand-800" />
              <Input
                aria-label="Tên kho"
                value={warehouseName}
                onChange={(event) => setWarehouseName(event.target.value)}
                className="h-8 border-transparent px-1 text-base font-semibold text-brand-900"
              />
            </div>
            <Input
              aria-label="Địa chỉ kho"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-4"
            />
            <Select
              aria-label="Thủ kho"
              value={storekeeperId}
              onChange={(event) => setStorekeeperId(Number(event.target.value))}
              className="mt-3"
            >
              <option value={0}>-- Chọn thủ kho --</option>
              {users
                .filter((user) => user.role === "STOREKEEPER" && user.isActive)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
            </Select>
          </Card>
          <Card className="p-5">
            <CardTitle>Tổng giá trị</CardTitle>
            <p className="mt-4 text-right text-2xl font-semibold text-brand-800">
              {money.format(totals.total)} VND
            </p>
            <div className="mt-5 grid grid-cols-2 text-sm">
              <span>
                Số lượng
                <br />
                <b>{money.format(totals.quantity)}</b>
              </span>
              <span>
                Dòng hàng
                <br />
                <b>{rows.length}</b>
              </span>
            </div>
          </Card>
          <Card className="p-5">
            <CardTitle>Hạch toán</CardTitle>
            <Select
              className="mt-4"
              value={debitAccount}
              onChange={(event) => setDebitAccount(event.target.value)}
            >
              <option>152 – Nguyên liệu, vật liệu</option>
            </Select>
            <Select
              className="mt-3"
              value={creditAccount}
              onChange={(event) => setCreditAccount(event.target.value)}
            >
              <option>331 – Phải trả người bán</option>
            </Select>
            <Textarea
              className="mt-3"
              value={accountingNote}
              onChange={(event) => setAccountingNote(event.target.value)}
            />
          </Card>
          <div className="sticky bottom-4 grid grid-cols-[1fr_1.7fr] gap-2 bg-[#f7f8f8] pt-2">
            <Button
              disabled={loading || !rows.length || status !== "DRAFT"}
              onClick={() => save(false)}
            >
              Lưu nháp
            </Button>
            <Button
              disabled={loading || !rows.length || status !== "DRAFT"}
              onClick={() => save(true)}
              variant="primary"
            >
              {loading ? "Đang lưu..." : "Lưu & ghi sổ"}
              <ChevronDown />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
