import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/table/data-table";
import type { Product } from "@/lib/api/types";

export type GoodsRow = {
  id: number;
  productId: number;
  name: string;
  code: string;
  unit: string;
  documentQty: number;
  actualQty: number;
  unitPrice: number;
};
const money = new Intl.NumberFormat("vi-VN");

export function GoodsTable({
  rows,
  products,
  onAdd,
  onDelete,
  onChange,
}: {
  rows: GoodsRow[];
  products: Product[];
  onAdd: () => void;
  onDelete: (id: number) => void;
  onChange: (id: number, patch: Partial<GoodsRow>) => void;
}) {
  const numberInput =
    (field: "documentQty" | "actualQty" | "unitPrice", min: number) =>
    // eslint-disable-next-line react/display-name
    (row: GoodsRow) => (
      <input
        aria-label={`${field} ${row.name}`}
        type="number"
        min={min}
        step="any"
        value={row[field]}
        onChange={(event) =>
          onChange(row.id, { [field]: Number(event.target.value) })
        }
        className="h-8 w-24 rounded border border-transparent bg-transparent px-2 text-right outline-none hover:border-slate-300 focus:border-brand-600 focus:bg-white"
      />
    );
  const columns: Column<GoodsRow>[] = [
    { key: "index", title: "STT", align: "center", render: (_r, i) => i + 1 },
    {
      key: "name",
      title: "Hàng hóa",
      render: (r) => (
        <select
          value={r.productId}
          aria-label={`Hàng hóa dòng ${r.id}`}
          onChange={(event) => {
            const product = products.find(
              (item) => item.id === Number(event.target.value),
            );
            if (product)
              onChange(r.id, {
                productId: product.id,
                name: product.name,
                code: product.sku,
                unit: product.unit,
                unitPrice: product.purchasePrice,
              });
          }}
          className="h-8 min-w-44 rounded border border-transparent bg-transparent outline-none hover:border-slate-300 focus:border-brand-600 focus:bg-white"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      ),
    },
    { key: "code", title: "Mã hàng", render: (r) => r.code },
    { key: "unit", title: "ĐVT", align: "center", render: (r) => r.unit },
    {
      key: "documentQty",
      title: "Theo CT",
      align: "right",
      render: numberInput("documentQty", 0),
    },
    {
      key: "actualQty",
      title: "Thực nhập",
      align: "right",
      render: numberInput("actualQty", 0.001),
    },
    {
      key: "unitPrice",
      title: "Đơn giá",
      align: "right",
      render: numberInput("unitPrice", 0),
    },
    {
      key: "amount",
      title: "Thành tiền",
      align: "right",
      render: (r) => (
        <b className="font-medium">{money.format(r.actualQty * r.unitPrice)}</b>
      ),
    },
    {
      key: "action",
      title: "",
      align: "center",
      render: (r) => (
        <button
          aria-label={`Xóa ${r.name}`}
          onClick={() => onDelete(r.id)}
          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button onClick={onAdd}>
          <Plus size={17} /> Thêm dòng
        </Button>
        <Button onClick={onAdd}>
          <Plus size={17} /> Thêm hàng hóa
        </Button>
        <Button disabled>
          <Trash2 size={16} /> Xóa dòng
        </Button>
        <Button disabled>
          <ArrowUp size={16} /> Xuất lên
        </Button>
        <Button disabled>
          <ArrowDown size={16} /> Xuất xuống
        </Button>
        <Button className="ml-auto">
          <Settings2 size={16} /> Tiện ích
        </Button>
      </div>
      <DataTable rows={rows} columns={columns} getRowKey={(r) => r.id} />
      <div className="flex items-center border-x border-b border-slate-200 px-3 py-2 text-sm">
        <span>Tổng số: {rows.length} dòng</span>
        <div className="ml-auto flex items-center gap-2">
          <Button className="h-9">20 dòng/trang</Button>
          <Button className="h-9 w-9 px-0" disabled>
            <ChevronLeft size={16} />
          </Button>
          <Button className="h-9 w-9 border-brand-600 px-0 text-brand-700">
            1
          </Button>
          <Button className="h-9 w-9 px-0" disabled>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </>
  );
}
