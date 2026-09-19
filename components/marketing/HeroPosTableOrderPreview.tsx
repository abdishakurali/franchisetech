"use client";

/** Compact POS table-tab checkout — Trimite / Încasează, matches live table service UI. */
export function HeroPosTableOrderPreview() {
  return (
    <div className="flex h-full min-h-[140px] bg-secondary text-[10px] sm:text-[11px]">
      <div className="flex w-8 shrink-0 flex-col items-center gap-2 border-r border-border bg-card py-2 sm:w-9">
        {["grid", "list", "card", "box", "chart", "chef"].map((key) => (
          <span
            key={key}
            className={`h-2 w-2 rounded-sm ${key === "grid" ? "bg-brass" : "bg-border"}`}
          />
        ))}
      </div>

      <div className="relative min-w-0 flex-1 overflow-hidden bg-card">
        <div className="absolute inset-0 grid grid-cols-3 gap-1 p-1.5 opacity-40 blur-[1.5px]">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-md bg-secondary" />
          ))}
        </div>
        <div className="absolute inset-x-0 top-0 flex gap-1 border-b border-border bg-card/90 px-2 py-1">
          <span className="rounded-full bg-brass px-2 py-0.5 text-[8px] font-medium text-ink">Toate</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] text-muted-foreground">Sandwich</span>
        </div>
      </div>

      <div className="flex w-[42%] shrink-0 flex-col border-l border-border bg-card sm:w-[44%]">
        <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
          <span className="font-semibold text-foreground">Vânzare curentă (2)</span>
          <span className="text-[8px] text-brass">Adaugă client</span>
        </div>
        <div className="flex-1 space-y-1.5 overflow-hidden px-2 py-1.5">
          <div className="flex justify-between gap-1 text-foreground">
            <span className="truncate">Chicken Salad Lunch Box</span>
            <span className="shrink-0 font-medium tabular-nums">9,50</span>
          </div>
          <div className="flex justify-between gap-1 text-foreground">
            <span className="truncate">Egg Mayo Sandwich</span>
            <span className="shrink-0 font-medium tabular-nums">11,70</span>
          </div>
        </div>
        <div className="border-t border-border px-2 py-1.5">
          <div className="flex justify-between font-semibold text-foreground">
            <span>Total de încasat</span>
            <span className="tabular-nums">21,20 RON</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              className="rounded-lg bg-emerald-600 py-1.5 text-[9px] font-semibold text-white sm:text-[10px]"
            >
              Trimite
            </button>
            <button
              type="button"
              className="rounded-lg bg-brass py-1.5 text-[9px] font-semibold text-ink sm:text-[10px]"
            >
              Încasează
            </button>
          </div>
          <p className="mt-1 text-center text-[8px] text-muted-foreground">Notă de plată</p>
        </div>
      </div>
    </div>
  );
}
