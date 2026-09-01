import Link from "next/link";
import {
  ClipboardList,
  Package,
  PackageMinus,
  PackageOpen,
  Truck,
} from "lucide-react";
const modules = [
  ["Nhà cung cấp", "/suppliers", Truck, "Quản lý thông tin đối tác cung ứng"],
  ["Sản phẩm", "/products", Package, "Danh mục hàng hóa và số lượng tồn"],
  [
    "Phiếu nhập kho",
    "/goods-receipts",
    PackageOpen,
    "Tạo, xác nhận và theo dõi phiếu nhập",
  ],
  [
    "Phiếu xuất kho",
    "/goods-issues",
    PackageMinus,
    "Tạo, xác nhận và theo dõi phiếu xuất",
  ],
  [
    "Chi tiết chứng từ",
    "/goods-receipt-items",
    ClipboardList,
    "Quản lý các dòng hàng trong chứng từ",
  ],
] as const;
export default function Home() {
  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-7">
      <div className="mb-7">
        <p className="text-sm font-medium text-brand-700">TỔNG QUAN</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Quản lý kho
        </h1>
        <p className="mt-2 text-slate-500">
          Chọn một phân hệ để bắt đầu quản lý dữ liệu.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(([label, href, Icon, description]) => (
          <Link
            key={href}
            href={href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
          >
            <div className="mb-4 grid size-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <Icon size={22} />
            </div>
            <h2 className="font-semibold text-slate-900 group-hover:text-brand-700">
              {label}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
