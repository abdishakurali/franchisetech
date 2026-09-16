"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type SalesDay = { day: string; total: number };

export function ReportsTrendChart({ days, currency }: { days: SalesDay[]; currency: string }) {
  if (!days.length || days.every((day) => day.total === 0)) {
    return <div className="mt-3 flex min-h-56 items-center justify-center rounded-lg border border-dashed border-[#DFDCD2] bg-slate-50 text-sm text-slate-500">Nu există vânzări în această perioadă.</div>;
  }
  const format = (value: number) => new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 0 }).format(value);
  return <div className="mt-3 h-64 w-full rounded-lg bg-[#F7F9FF] p-3" role="img" aria-label="Graficul vânzărilor pe zile">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={days} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
        <defs><linearGradient id="reports-sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#165DFC" stopOpacity={0.28} /><stop offset="100%" stopColor="#165DFC" stopOpacity={0.01} /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke="#DFDCD2" strokeDasharray="3 4" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} minTickGap={20} />
        <YAxis tickFormatter={format} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} width={50} />
        <Tooltip formatter={(value) => [`${format(Number(value ?? 0))} ${currency}`, "Vânzări"]} contentStyle={{ border: "1px solid #DFDCD2", borderRadius: 10, boxShadow: "0 8px 24px #0d0f0e14" }} />
        <Area type="monotone" dataKey="total" stroke="#165DFC" strokeWidth={3} fill="url(#reports-sales-fill)" dot={false} activeDot={{ r: 5, fill: "#165DFC", stroke: "#fff", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
