"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boxes, LockKeyhole, Mail } from "lucide-react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form-controls";

type LoginResult = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: { id: number; email: string; name: string; role: "ADMIN" | "USER" };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@vimes.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await api<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (result.user.role !== "ADMIN")
        throw new Error("Tài khoản không có quyền quản trị.");
      window.localStorage.setItem("access_token", result.accessToken);
      window.localStorage.setItem("auth_user", JSON.stringify(result.user));
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,#d9eee2,transparent_38%),linear-gradient(135deg,#f8fafc,#edf7f1)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-7 flex items-center gap-3 text-brand-800">
          <span className="grid size-12 place-items-center rounded-xl bg-brand-800 text-[#efc35a]">
            <Boxes size={28} />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-wide">
              VIMES
            </h1>
            <p className="text-sm text-slate-500">Hệ thống quản lý kho</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Đăng nhập</h2>
        <p className="mt-1 text-sm text-slate-500">
          Sử dụng tài khoản quản trị để tiếp tục.
        </p>
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <div className="relative mt-1.5">
              <Mail
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <Input
                className="pl-10"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mật khẩu
            <div className="relative mt-1.5">
              <LockKeyhole
                className="absolute left-3 top-2.5 text-slate-400"
                size={18}
              />
              <Input
                className="pl-10"
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>
          <Button
            className="mt-2 w-full"
            variant="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </main>
  );
}
