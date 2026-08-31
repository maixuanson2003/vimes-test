"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CircleHelp, LogOut, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type AuthUser = { name: string; email: string; role: string };
export function Topbar() {
  const router = useRouter(); const [user, setUser] = useState<AuthUser | null>(null);
  // Đồng bộ thông tin user đã đăng nhập từ localStorage.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const raw = window.localStorage.getItem("auth_user"); if (raw) { try { setUser(JSON.parse(raw) as AuthUser); } catch { window.localStorage.removeItem("auth_user"); } } }, []);
  const logout = () => { window.localStorage.removeItem("access_token"); window.localStorage.removeItem("auth_user"); router.replace("/login"); };
  const initials = user?.name.split(" ").map(x => x[0]).slice(-2).join("").toUpperCase() || "AD";
  return <header className="sticky top-0 z-20 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:ml-[242px] lg:px-6"><Menu size={20} className="mr-5 text-slate-600 lg:hidden"/><div className="hidden h-10 w-full max-w-sm items-center gap-2 rounded-md border border-slate-300 px-3 text-slate-400 md:flex"><Search size={18}/><span className="text-sm">Tìm kiếm trong hệ thống</span></div><div className="ml-auto flex items-center gap-4 text-slate-700"><Bell size={20}/><CircleHelp size={20}/><span className="grid size-9 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white">{initials}</span><div className="hidden sm:block"><p className="text-sm font-medium">{user?.name ?? "Quản trị viên"}</p><p className="text-[11px] text-slate-400">{user?.role ?? "ADMIN"}</p></div><Button variant="ghost" className="h-9 px-2" title="Đăng xuất" onClick={logout}><LogOut size={18}/></Button></div></header>;
}
