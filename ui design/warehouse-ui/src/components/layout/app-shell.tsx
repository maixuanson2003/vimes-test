"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const loginPage = pathname === "/login";
  const [ready, setReady] = useState(loginPage);
  // Đồng bộ trạng thái giao diện với session nằm trong localStorage.
  useEffect(() => {
    const redirectToLogin = () => router.replace("/login");
    window.addEventListener("auth-expired", redirectToLogin);
    const token = window.localStorage.getItem("access_token");
    if (!loginPage && !token) router.replace("/login");
    else if (loginPage && token) router.replace("/");
    queueMicrotask(() => setReady(true));
    return () => window.removeEventListener("auth-expired", redirectToLogin);
  }, [loginPage, router]);
  if (loginPage) return <>{children}</>;
  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Đang kiểm tra đăng nhập...
      </div>
    );
  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="lg:ml-[242px]">{children}</main>
    </>
  );
}
