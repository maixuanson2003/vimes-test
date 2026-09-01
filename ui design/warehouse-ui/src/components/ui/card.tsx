import type { HTMLAttributes, ReactNode } from "react";
export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.02)] ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-brand-900">{children}</h2>;
}
