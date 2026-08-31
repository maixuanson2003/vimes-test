import type { ReactNode } from "react";
export function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) { return <label className="grid items-center gap-2 text-sm text-slate-700 sm:grid-cols-[122px_1fr]"><span>{label} {required && <b className="text-red-500">*</b>}</span>{children}</label>; }
