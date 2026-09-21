"use client";

/** Marketing preview of the daily Z-report — matches live /app/reports/z-report UI. */
export function HeroZReportPreview() {
  const vatRows = [
    { rate: "21%", net: "5.921,20 lei", vat: "1.243,45 lei", gross: "7.164,65 lei" },
    { rate: "11%", net: "1.048,30 lei", vat: "115,31 lei", gross: "1.163,61 lei" },
    { rate: "0%", net: "90,60 lei", vat: "0,00 lei", gross: "90,60 lei" },
  ] as const;

  return (
    <div className="flex h-full min-h-[480px] flex-col bg-secondary text-[10px] text-foreground sm:text-[11px]">
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2">
        <span className="font-bold text-brass">franchisetech</span>
        <span className="text-muted-foreground">Rapoarte → Raport Z zilnic</span>
      </div>

      <div className="flex-1 space-y-3 overflow-hidden p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-foreground sm:text-xl">Raport Z zilnic</h2>
            <p className="text-muted-foreground">Închidere de zi · 18.09.2026</p>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-reconciled/25 bg-reconciled/10 px-2 py-0.5 text-[9px] font-medium text-reconciled">
            <span className="h-1.5 w-1.5 rounded-full bg-reconciled/100" />Z emis
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {[
            { label: "Tranzacții", value: "148", sub: "" },
            { label: "Vânzări nete", value: "7.060,10 lei", sub: "" },
            { label: "TVA colectat", value: "1.358,76 lei", sub: "" },
            { label: "Vânzări brute", value: "8.418,86 lei", sub: "" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
              <p className="text-[9px] font-medium text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-base font-bold tabular-nums text-foreground sm:text-lg">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-2 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-foreground">Metodă de plată</p>
            <ul className="space-y-1.5">
              {[
                ["Numerar", "2.980,00 lei"],
                ["Card", "5.246,36 lei"],
                ["Online", "192,50 lei"],
              ].map(([label, value]) => (
                <li key={label} className="flex items-center justify-between text-[9px] text-foreground">
                  <span>{label}</span>
                  <span className="font-medium tabular-nums">{value}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-[9px] font-semibold text-amber-800">
              <span>Diferență sertar</span>
              <span>-12,00 lei</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-2.5 shadow-sm">
            <p className="mb-2 font-semibold text-foreground">TVA pe cote</p>
            <div className="grid grid-cols-4 gap-1 text-[8px] font-medium text-muted-foreground">
              <span>Cotă</span><span className="text-right">Net</span><span className="text-right">TVA</span><span className="text-right">Brut</span>
            </div>
            {vatRows.map((row) => (
              <div key={row.rate} className="mt-1 grid grid-cols-4 gap-1 border-t border-border pt-1 text-[9px] text-foreground">
                <span className="font-medium">{row.rate}</span>
                <span className="text-right tabular-nums">{row.net}</span>
                <span className="text-right tabular-nums">{row.vat}</span>
                <span className="text-right tabular-nums">{row.gross}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[9px] font-medium text-brass">Descarcă registrul de casă →</p>
      </div>
    </div>
  );
}
