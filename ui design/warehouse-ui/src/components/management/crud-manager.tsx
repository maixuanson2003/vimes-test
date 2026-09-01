"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form-controls";

type Row = Record<string, unknown> & { id: number };
type Field = {
  key: string;
  label: string;
  type?: "text" | "password" | "number" | "date" | "select";
  required?: boolean;
  readOnly?: boolean;
  options?: { value: string | number; label: string }[];
  lookup?: "products" | "receipts" | "issues" | "organizations";
};
type Config = {
  title: string;
  description: string;
  endpoint: string;
  fields: Field[];
  columns: string[];
};

const configs: Record<string, Config> = {
  organizations: {
    title: "Đơn vị",
    description: "Quản lý các đơn vị sử dụng chứng từ kho",
    endpoint: "/organizations",
    columns: ["code", "name", "isActive"],
    fields: [
      { key: "code", label: "Mã đơn vị", required: true },
      { key: "name", label: "Tên đơn vị", required: true },
      {
        key: "isActive",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "true", label: "Hoạt động" },
          { value: "false", label: "Ngừng hoạt động" },
        ],
      },
    ],
  },
  departments: {
    title: "Bộ phận",
    description: "Quản lý bộ phận trực thuộc đơn vị",
    endpoint: "/departments",
    columns: ["organizationId", "code", "name", "isActive"],
    fields: [
      {
        key: "organizationId",
        label: "Đơn vị",
        type: "select",
        lookup: "organizations",
        required: true,
      },
      { key: "code", label: "Mã bộ phận", required: true },
      { key: "name", label: "Tên bộ phận", required: true },
      {
        key: "isActive",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "true", label: "Hoạt động" },
          { value: "false", label: "Ngừng hoạt động" },
        ],
      },
    ],
  },
  users: {
    title: "Người dùng",
    description: "Quản lý tài khoản và vai trò trên phiếu nhập",
    endpoint: "/users",
    columns: ["name", "email", "role", "isActive"],
    fields: [
      { key: "name", label: "Họ và tên", required: true },
      { key: "email", label: "Email", required: true },
      { key: "password", label: "Mật khẩu", type: "password", required: true },
      {
        key: "role",
        label: "Vai trò",
        type: "select",
        options: [
          { value: "STOREKEEPER", label: "Thủ kho" },
          { value: "CHIEF_ACCOUNTANT", label: "Kế toán trưởng" },
          { value: "USER", label: "Người dùng" },
          { value: "ADMIN", label: "Quản trị viên" },
        ],
      },
      {
        key: "isActive",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "true", label: "Đang hoạt động" },
          { value: "false", label: "Ngừng hoạt động" },
        ],
      },
    ],
  },
  suppliers: {
    title: "Nhà cung cấp",
    description: "Quản lý thông tin nhà cung cấp",
    endpoint: "/suppliers",
    columns: ["name", "address", "phone"],
    fields: [
      { key: "name", label: "Tên nhà cung cấp", required: true },
      { key: "address", label: "Địa chỉ" },
      { key: "phone", label: "Số điện thoại" },
    ],
  },
  products: {
    title: "Sản phẩm",
    description: "Quản lý danh mục và tồn kho sản phẩm",
    endpoint: "/products",
    columns: [
      "sku",
      "name",
      "unit",
      "purchasePrice",
      "salePrice",
      "stockQuantity",
      "status",
    ],
    fields: [
      { key: "sku", label: "Mã sản phẩm", required: true },
      { key: "name", label: "Tên sản phẩm", required: true },
      { key: "unit", label: "Đơn vị tính", required: true },
      {
        key: "purchasePrice",
        label: "Giá nhập",
        type: "number",
        required: true,
      },
      { key: "salePrice", label: "Giá bán", type: "number", required: true },
      {
        key: "stockQuantity",
        label: "Số lượng tồn",
        type: "number",
        required: true,
      },
      {
        key: "status",
        label: "Trạng thái",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Đang hoạt động" },
          { value: "INACTIVE", label: "Ngừng hoạt động" },
        ],
      },
    ],
  },
  "goods-receipt-items": {
    title: "Chi tiết phiếu nhập",
    description: "Quản lý các dòng hàng của phiếu nhập",
    endpoint: "/goods-receipt-items",
    columns: [
      "receiptId",
      "productId",
      "documentQuantity",
      "actualQuantity",
      "unitPrice",
      "lineAmount",
    ],
    fields: [
      {
        key: "receiptId",
        label: "Phiếu nhập",
        type: "select",
        lookup: "receipts",
        required: true,
      },
      {
        key: "productId",
        label: "Sản phẩm",
        type: "select",
        lookup: "products",
        required: true,
      },
      {
        key: "documentQuantity",
        label: "SL chứng từ",
        type: "number",
        required: true,
      },
      {
        key: "actualQuantity",
        label: "SL thực nhập",
        type: "number",
        required: true,
      },
      { key: "unitPrice", label: "Đơn giá", type: "number", required: true },
    ],
  },
  "goods-issue-items": {
    title: "Chi tiết phiếu xuất",
    description: "Quản lý các dòng hàng của phiếu xuất",
    endpoint: "/goods-issue-items",
    columns: ["issueId", "productId", "quantity", "unitPrice", "lineAmount"],
    fields: [
      {
        key: "issueId",
        label: "Phiếu xuất",
        type: "select",
        lookup: "issues",
        required: true,
      },
      {
        key: "productId",
        label: "Sản phẩm",
        type: "select",
        lookup: "products",
        required: true,
      },
      {
        key: "quantity",
        label: "Số lượng xuất",
        type: "number",
        required: true,
      },
      { key: "unitPrice", label: "Đơn giá", type: "number", required: true },
    ],
  },
};
const labels: Record<string, string> = {
  name: "Tên",
  address: "Địa chỉ",
  phone: "Điện thoại",
  sku: "Mã SP",
  unit: "ĐVT",
  purchasePrice: "Giá nhập",
  salePrice: "Giá bán",
  stockQuantity: "Tồn kho",
  status: "Trạng thái",
  productId: "Sản phẩm",
  receiptId: "Phiếu nhập",
  issueId: "Phiếu xuất",
  quantityDelta: "SL điều chỉnh",
  reason: "Lý do",
  adjustmentDate: "Ngày",
  documentQuantity: "SL chứng từ",
  actualQuantity: "SL thực nhập",
  quantity: "Số lượng",
  unitPrice: "Đơn giá",
  lineAmount: "Thành tiền",
};
const moneyKeys = new Set([
  "purchasePrice",
  "salePrice",
  "unitPrice",
  "lineAmount",
]);

export function CrudManager({ resource }: { resource: keyof typeof configs }) {
  const config = configs[resource];
  const [rows, setRows] = useState<Row[]>([]);
  const [lookups, setLookups] = useState<Record<string, Row[]>>({});
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const needed = [
        ...new Set(config.fields.map((f) => f.lookup).filter(Boolean)),
      ] as string[];
      const [data, ...related] = await Promise.all([
        api<Row[]>(config.endpoint),
        ...needed.map((x) =>
          api<Row[]>(
            x === "products"
              ? "/products"
              : x === "receipts"
                ? "/goods-receipts"
                : x === "organizations"
                  ? "/organizations"
                  : "/goods-issues",
          ),
        ),
      ]);
      setRows(data);
      setLookups(Object.fromEntries(needed.map((x, i) => [x, related[i]])));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [config]);
  // Dữ liệu đến từ REST API; effect này đồng bộ component với nguồn dữ liệu ngoài.
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);
  const filtered = useMemo(
    () =>
      rows.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  const display = (key: string, value: unknown) => {
    const field = config.fields.find((f) => f.key === key);
    if (field?.lookup) {
      const item = lookups[field.lookup]?.find((x) => x.id === Number(value));
      return String(
        item?.name ?? item?.receiptNumber ?? item?.issueNumber ?? `#${value}`,
      );
    }
    if (key === "status")
      return value === "ACTIVE" ? "Đang hoạt động" : "Ngừng hoạt động";
    if (moneyKeys.has(key))
      return `${new Intl.NumberFormat("vi-VN").format(Number(value ?? 0))} ₫`;
    return value === null || value === undefined || value === ""
      ? "—"
      : String(value);
  };
  const relatedDocumentHref = (row: Row) =>
    resource === "goods-receipt-items"
      ? `/goods-receipts?document=${row.receiptId}`
      : resource === "goods-issue-items"
        ? `/goods-issues?document=${row.issueId}`
        : null;
  const startCreate = () => {
    const initial: Row = { id: 0 };
    const isDocumentItem =
      resource === "goods-receipt-items" || resource === "goods-issue-items";
    config.fields.forEach((f) => {
      initial[f.key] = f.lookup
        ? (lookups[f.lookup]?.[0]?.id ?? 0)
        : f.type === "number"
          ? isDocumentItem
            ? 1
            : 0
          : f.type === "date"
            ? new Date().toISOString().slice(0, 10)
            : (f.options?.[0]?.value ?? "");
    });
    setEditing(initial);
    setOpen(true);
  };
  const save = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const body = Object.fromEntries(
        config.fields.map((f) => [f.key, editing[f.key]]),
      );
      if (editing.id)
        await api(`${config.endpoint}/${editing.id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      else
        await api(config.endpoint, {
          method: "POST",
          body: JSON.stringify(body),
        });
      setOpen(false);
      setMessage(editing.id ? "Đã cập nhật bản ghi." : "Đã thêm bản ghi.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không lưu được dữ liệu");
      setLoading(false);
    }
  };
  const remove = async (row: Row) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa bản ghi này?")) return;
    try {
      await api(`${config.endpoint}/${row.id}`, { method: "DELETE" });
      setMessage("Đã xóa bản ghi.");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không xóa được dữ liệu");
    }
  };
  return (
    <div className="mx-auto max-w-[1380px] p-4 md:p-7">
      <div className="mb-5 flex flex-wrap items-end gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">DANH MỤC</p>
          <h1 className="mt-1 text-3xl font-semibold">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <Button variant="primary" className="ml-auto" onClick={startCreate}>
          <Plus size={17} />
          Thêm mới
        </Button>
      </div>
      {message && (
        <div className="mb-4 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          {message}
        </div>
      )}
      <Card>
        <div className="flex gap-3 border-b border-slate-200 p-4">
          <div className="relative max-w-md flex-1">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <Input
              className="pl-10"
              placeholder="Tìm trong danh sách..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => void load()}>
            <RefreshCw size={16} />
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                {config.columns.map((c) => (
                  <th key={c} className="px-4 py-3">
                    {labels[c] ?? c}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => {
                const documentHref = relatedDocumentHref(row);
                return (
                  <tr
                    key={row.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                    {config.columns.map((c) => (
                      <td key={c} className="px-4 py-3">
                        {documentHref &&
                        (c === "receiptId" || c === "issueId") ? (
                          <Link
                            href={documentHref}
                            className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                            title="Xem chứng từ liên quan"
                          >
                            {display(c, row[c])}
                          </Link>
                        ) : (
                          display(c, row[c])
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {documentHref && (
                          <Link
                            href={documentHref}
                            className="inline-flex h-8 items-center rounded-md px-2 text-brand-700 hover:bg-brand-50"
                            title="Xem chứng từ liên quan"
                          >
                            <Eye size={16} />
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          className="h-8 px-2"
                          onClick={() => {
                            setEditing({ ...row });
                            setOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-red-600"
                          onClick={() => void remove(row)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              Chưa có dữ liệu.
            </div>
          )}
          {loading && (
            <div className="p-10 text-center text-sm text-slate-500">
              Đang tải dữ liệu...
            </div>
          )}
        </div>
      </Card>
      {open && editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center border-b px-5 py-4">
              <h2 className="text-lg font-semibold">
                {editing.id
                  ? `Sửa ${config.title.toLowerCase()}`
                  : `Thêm ${config.title.toLowerCase()}`}
              </h2>
              <button
                className="ml-auto rounded p-1 hover:bg-slate-100"
                onClick={() => setOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              {config.fields.map((field) => (
                <label
                  key={field.key}
                  className="block text-sm font-medium text-slate-700"
                >
                  <span>
                    {field.label}
                    {field.required && <b className="text-red-500"> *</b>}
                  </span>
                  {field.type === "select" ? (
                    <Select
                      className="mt-1.5"
                      value={String(editing[field.key] ?? "")}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [field.key]:
                            field.lookup ||
                            typeof field.options?.[0]?.value === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    >
                      {field.lookup
                        ? (lookups[field.lookup] ?? []).map((item) => (
                            <option key={item.id} value={item.id}>
                              {String(
                                item.name ??
                                  item.receiptNumber ??
                                  item.issueNumber ??
                                  item.id,
                              )}
                            </option>
                          ))
                        : field.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                    </Select>
                  ) : (
                    <Input
                      className="mt-1.5"
                      type={field.type ?? "text"}
                      step={field.type === "number" ? "any" : undefined}
                      required={field.required}
                      value={String(editing[field.key] ?? "")}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          [field.key]:
                            field.type === "number"
                              ? Number(e.target.value)
                              : e.target.value,
                        })
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t bg-slate-50 px-5 py-4">
              <Button onClick={() => setOpen(false)}>Đóng</Button>
              <Button
                variant="primary"
                disabled={loading}
                onClick={() => void save()}
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
