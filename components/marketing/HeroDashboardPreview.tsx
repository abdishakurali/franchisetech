"use client";

/** Marketing preview of the owner dashboard — matches live /app Panou UI. */
export function HeroDashboardPreview() {
  const reports = [
    { label: "Raport vânzări", tag: "Cel mai folosit", color: "bg-accent0" },
    { label: "Raport închidere casă", tag: "Sfârșit de zi", color: "bg-reconciled/100" },
    { label: "Raport TVA", tag: "Fiscal", color: "bg-violet-500" },
    { label: "Raport stoc", tag: "", color: "bg-amber-500" },
    { label: "Raport achiziții", tag: "", color: "bg-orange-500" },
    { label: "Raport marje", tag: "", color: "bg-teal-500" },
  ];

  const topProducts = [
    ["Cappuccino", "x12", "119.50 lei"],
    ["Banana Oat Smoothie", "x16", "79.98 lei"],
    ["Chicken Salad Lunch Box", "x7", "66.50 lei"],
    ["Americano", "x17", "54.40 lei"],
    ["Chicken Caesar Sandwich", "x7", "48.65 lei"],
  ] as const;

  return (
    <div className="flex h-full min-h-[480px] flex-col bg-secondary text-[10px] text-foreground sm:text-[11px]">
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2">
        <span className="font-bold text-brass">franchisetech</span>
        <div className="flex flex-1 gap-1 overflow-hidden">
          {["Panou", "POS", "Produse", "Rețete", "Stoc", "Setări"].map((item, i) => (
            <span
              key={item}
              className={`shrink-0 rounded-md px-2 py-1 ${
                i === 0 ? "bg-accent font-semibold text-brass" : "text-muted-foreground"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brass text-[9px] font-bold text-ink">
          G
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">Panou</h2>
            <p className="text-muted-foreground">Vânzări, casă și rapoarte</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-full border border-reconciled/25 bg-reconciled/10 px-2 py-0.5 text-[9px] font-medium text-reconciled">
              <span className="h-1.5 w-1.5 rounded-full bg-reconciled/100" />
              Casă deschisă
            </span>
            {["Azi", "Săptămâna asta", "Luna asta"].map((p, i) => (
              <span
                key={p}
                className={`rounded-md px-2 py-1 text-[9px] ${
                  i === 2 ? "bg-brass font-semibold text-ink" : "bg-card text-mid ring-1 ring-border"
                }`}
              >
                {p}
              </span>
            ))}
            <span className="rounded-md bg-card px-2 py-1 ring-1 ring-border">Ghid configurare</span>
            <span className="rounded-md bg-brass px-2 py-1 font-semibold text-ink">Deschide POS</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "Vânzări", value: "801.83 lei", sub: "79 tranzacții", accent: "text-emerald-600", note: "+801.83 lei față de luna trecută" },
            { label: "Tranzacții", value: "79", sub: "Bon mediu: 10.15 lei", accent: "text-foreground", note: "" },
            { label: "Numerar în casă", value: "262.84 lei", sub: "Numerar 609.33 · Card 192.50", accent: "text-foreground", note: "" },
            { label: "Luna asta", value: "801.83 lei", sub: "Anulate: 1", accent: "text-foreground", note: "" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <p className="text-[9px] font-medium text-muted-foreground">{card.label}</p>
              <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${card.accent}`}>{card.value}</p>
              <p className="mt-0.5 text-[9px] text-muted-foreground">{card.sub}</p>
              {card.note && <p className="mt-1 text-[8px] font-medium text-emerald-600">{card.note}</p>}
            </div>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-foreground">Top produse</p>
            <ul className="space-y-1.5">
              {topProducts.map(([name, qty, total], i) => (
                <li key={name} className="flex items-center justify-between gap-2 text-[9px]">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-secondary text-[8px] font-bold text-mid">
                      {i + 1}
                    </span>
                    <span className="truncate">{name}</span>
                    <span className="text-muted-foreground">{qty}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{total}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[9px] font-medium text-brass">Raport complet vânzări →</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-foreground">Monitor stoc</p>
            <p className="text-[10px] text-mid">Stocul arată bine</p>
            <p className="mt-2 text-[9px] font-medium text-brass">Vezi stocul →</p>
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold text-foreground">Rapoarte</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {reports.map((r) => (
              <div key={r.label} className="rounded-lg border border-border bg-card p-2 shadow-sm">
                <span className={`mb-1.5 inline-block h-5 w-5 rounded-md ${r.color}`} />
                <p className="text-[8px] font-medium leading-tight text-foreground">{r.label}</p>
                {r.tag && <p className="mt-0.5 text-[7px] text-muted-foreground">{r.tag}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
