"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export type SalesDay = { day: string; total: number };

export function ReportsTrendChart({ days, currency }: { days: SalesDay[]; currency: string }) {
  if (!days.length || days.every((day) => day.total === 0)) {
    return <div className="mt-3 flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border bg-secondary text-sm text-muted-foreground">Nu există vânzări în această perioadă.</div>;
  }
  const format = (value: number) => new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value);
  return <div className="mt-3 h-64 w-full" role="img" aria-label="Graficul vânzărilor pe zile">
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 256 }}>
      <BarChart data={days} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="12%">
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} minTickGap={20} />
        <Tooltip formatter={(value) => [`${format(Number(value ?? 0))} ${currency}`, "Vânzări"]} contentStyle={{ border: "1px solid #DFDCD2", borderRadius: 10, boxShadow: "0 8px 24px #0d0f0e14" }} />
        <Bar dataKey="total" radius={[3, 3, 0, 0]}>{days.map((day, index) => <Cell key={`${day.day}-${index}`} fill={index === days.length - 1 ? "#165DFC" : "#B9CCFC"} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>;
}
