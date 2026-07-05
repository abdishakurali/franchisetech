"use client";

/** Marketing preview of the owner dashboard — matches live /app Panou UI. */
export function HeroDashboardPreview() {
  const reports = [
    { label: "Raport vânzări", tag: "Cel mai folosit", color: "bg-blue-500" },
    { label: "Raport închidere casă", tag: "Sfârșit de zi", color: "bg-emerald-500" },
    { label: "Raport TVA", tag: "Fiscal", color: "bg-violet-500" },
    { label: "Raport stoc", tag: "", color: "bg-amber-500" },
    { label: "Raport achiziții", tag: "", color: "bg-orange-500" },
    { label: "Raport marje", tag: "", color: "bg-teal-500" },
  ];

  const topProducts = [
    ["Chicken Caesar Image QA", "x12", "119.50 lei"],
    ["Banana Oat Smoothie", "x16", "79.98 lei"],
    ["Chicken Salad Lunch Box", "x7", "66.50 lei"],
    ["Americano", "x17", "54.40 lei"],
    ["Chicken Caesar Sandwich", "x7", "48.65 lei"],
  ] as const;

  return (
    <div className="flex h-full min-h-[480px] flex-col bg-slate-50 text-[10px] text-slate-800 sm:text-[11px]">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-3 py-2">
        <span className="font-bold text-blue-600">franchisetech</span>
        <div className="flex flex-1 gap-1 overflow-hidden">
          {["Panou", "POS", "Produse", "Rețete", "Stoc", "Setări"].map((item, i) => (
            <span
              key={item}
              className={`shrink-0 rounded-md px-2 py-1 ${
                i === 0 ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-500"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
          G
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Panou</h2>
            <p className="text-slate-500">Vânzări, casă și rapoarte</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Casă deschisă
            </span>
            {["Azi", "Săptămâna asta", "Luna asta"].map((p, i) => (
              <span
                key={p}
                className={`rounded-md px-2 py-1 text-[9px] ${
                  i === 2 ? "bg-blue-600 font-semibold text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {p}
              </span>
            ))}
            <span className="rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">Ghid configurare</span>
            <span className="rounded-md bg-blue-600 px-2 py-1 font-semibold text-white">Deschide POS</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "Vânzări", value: "801.83 lei", sub: "79 tranzacții", accent: "text-emerald-600", note: "+801.83 lei față de luna trecută" },
            { label: "Tranzacții", value: "79", sub: "Bon mediu: 10.15 lei", accent: "text-slate-900", note: "" },
            { label: "Numerar în casă", value: "262.84 lei", sub: "Numerar 609.33 · Card 192.50", accent: "text-slate-900", note: "" },
            { label: "Luna asta", value: "801.83 lei", sub: "Anulate: 1", accent: "text-slate-900", note: "" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
              <p className="text-[9px] font-medium text-slate-500">{card.label}</p>
              <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${card.accent}`}>{card.value}</p>
              <p className="mt-0.5 text-[9px] text-slate-500">{card.sub}</p>
              {card.note && <p className="mt-1 text-[8px] font-medium text-emerald-600">{card.note}</p>}
            </div>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-slate-900">Top produse</p>
            <ul className="space-y-1.5">
              {topProducts.map(([name, qty, total], i) => (
                <li key={name} className="flex items-center justify-between gap-2 text-[9px]">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-600">
                      {i + 1}
                    </span>
                    <span className="truncate">{name}</span>
                    <span className="text-slate-400">{qty}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{total}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[9px] font-medium text-blue-600">Raport complet vânzări →</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-slate-900">Monitor stoc</p>
            <p className="text-[10px] text-slate-600">Stocul arată bine</p>
            <p className="mt-2 text-[9px] font-medium text-blue-600">Vezi stocul →</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold text-slate-900">Rapoarte</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {reports.map((r) => (
              <div key={r.label} className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                <span className={`mb-1.5 inline-block h-5 w-5 rounded-md ${r.color}`} />
                <p className="text-[8px] font-medium leading-tight text-slate-800">{r.label}</p>
                {r.tag && <p className="mt-0.5 text-[7px] text-slate-400">{r.tag}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
