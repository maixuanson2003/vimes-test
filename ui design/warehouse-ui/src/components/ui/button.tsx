import type { ButtonHTMLAttributes, ReactNode } from "react";
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export function Button({ children, variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: ButtonVariant }) {
  const variants: Record<ButtonVariant, string> = { primary: "border-brand-700 bg-brand-700 text-white hover:bg-brand-800", secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50", ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100", danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" };
  return <button className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`} {...props}>{children}</button>;
}
