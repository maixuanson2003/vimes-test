import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  className?: string;
  render: (row: T, index: number) => ReactNode;
};

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowKey: (row: T) => string | number;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead className="bg-brand-50 text-xs font-semibold text-brand-950">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`border-b border-r border-slate-200 px-3 py-3 last:border-r-0 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"} ${column.className ?? ""}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey(row)} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border-b border-r border-slate-200 px-3 py-3 last:border-r-0 ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
                >
                  {column.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
