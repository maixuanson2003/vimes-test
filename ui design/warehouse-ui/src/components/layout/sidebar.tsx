"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Building2, ClipboardList, Network, Package, PackageMinus, PackageOpen, RefreshCcw, ShoppingCart, Truck, UserRoundCog, Warehouse } from "lucide-react";
const entries = [
  { label: "Tổng quan", href: "/", icon: Warehouse },
  { label: "Người dùng", href: "/users", icon: UserRoundCog },
  { label: "Đơn vị", href: "/organizations", icon: Building2 },
  { label: "Bộ phận", href: "/departments", icon: Network },
  { label: "Nhà cung cấp", href: "/suppliers", icon: Truck },
  { label: "Sản phẩm", href: "/products", icon: Package },
  { label: "Phiếu nhập kho", href: "/goods-receipts", icon: PackageOpen },
  { label: "Chi tiết phiếu nhập", href: "/goods-receipt-items", icon: ClipboardList },
  { label: "Phiếu xuất kho", href: "/goods-issues", icon: PackageMinus },
  { label: "Chi tiết phiếu xuất", href: "/goods-issue-items", icon: ShoppingCart },
  { label: "Điều chỉnh tồn", href: "/inventory-adjustments", icon: RefreshCcw },
];
export function Sidebar() {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 z-30 hidden w-[242px] flex-col bg-gradient-to-b from-[#064d36] to-[#003e2b] text-white lg:flex">
    <Link href="/" className="flex h-24 items-center gap-3 px-7 text-[#efc35a]"><Boxes size={38} strokeWidth={1.8}/><span className="font-serif text-3xl tracking-wide">VIMES</span></Link>
    <div className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-[.16em] text-white/50">Quản lý kho</div>
    <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">{entries.map(({ label, href, icon: Icon }) => { const active = href === "/" ? pathname === "/" : pathname.startsWith(href); return <Link key={href} href={href} className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm transition ${active ? "bg-white/15 font-semibold text-white" : "text-white/80 hover:bg-white/8 hover:text-white"}`}><Icon size={19} strokeWidth={1.8}/><span>{label}</span></Link>; })}</nav>
  </aside>;
}
