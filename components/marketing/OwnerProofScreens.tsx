/**
 * Drawn replacements for the two real screenshots that used to sit here
 * (/marketing/live/dashboard.png, /marketing/live/reports.png). Both showed
 * English UI, EUR pricing, a 9% VAT line (the rate Romania stopped using),
 * and "Chicken Caesar Image QA" as a top-selling product — QA test data,
 * on the second section of the homepage a Romanian visitor sees. Replaced
 * with honest UI, real Romanian formatting and the current 21%/11% rates,
 * matching the pattern already used on the raport-x/raport-z landing pages
 * rather than waiting on a real screenshot pipeline.
 */
export function ChromeFrame({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-card px-4 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <span className="h-1.5 w-1.5 rounded-full bg-border" />
        <div className="mx-2 min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground">
          franchisetech.ro{path}
        </div>
      </div>
      {children}
    </div>
  );
}

export function OwnerDashboardProof({ compact = false }: { compact?: boolean }) {
  const products: [string, string, string][] = [
    ["FLATT WHITE H.B. 240ml", "×8", "96,00 lei"],
    ["DOUBLE ESPRESSO H.B. 60ml", "×5", "50,00 lei"],
    ["LATTE H.B. 480ml", "×2", "36,00 lei"],
  ];

  if (compact) {
    // Narrow hero slot, beside the video — one column, no product list,
    // just enough of the real UI to read as software rather than a mockup.
    return (
      <ChromeFrame path="/app">
        <div className="p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Panou</p>
          <div className="mt-2 space-y-2">
            <div className="rounded-lg border border-border p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Vânzări</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">316,00 lei</p>
              <p className="text-[9px] text-emerald-600">+37,00 lei față de ieri</p>
            </div>
            <div className="rounded-lg border border-border p-2.5">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Numerar în casă</p>
              <p className="mt-0.5 text-base font-semibold text-foreground">45,00 lei</p>
              <p className="text-[9px] text-muted-foreground">Card 271,00 lei</p>
            </div>
          </div>
        </div>
      </ChromeFrame>
    );
  }

  return (
    <ChromeFrame path="/app">
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Panou</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Vânzări</p>
            <p className="mt-1 text-lg font-semibold text-foreground">316,00 lei</p>
            <p className="text-[10px] text-emerald-600">+37,00 lei față de ieri</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tranzacții</p>
            <p className="mt-1 text-lg font-semibold text-foreground">21</p>
            <p className="text-[10px] text-muted-foreground">Bon mediu: 15,05 lei</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Numerar în casă</p>
            <p className="mt-1 text-lg font-semibold text-foreground">45,00 lei</p>
            <p className="text-[10px] text-muted-foreground">Card 271,00 lei</p>
          </div>
        </div>
        <p className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top produse</p>
        <div className="mt-2 space-y-1.5">
          {products.map(([name, qty, total]) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-1.5 text-xs">
              <span className="truncate text-foreground">{name}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">{qty}</span>
              <span className="ml-2 shrink-0 font-medium text-foreground">{total}</span>
            </div>
          ))}
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerZReportProof() {
  return (
    <ChromeFrame path="/app/reports/z-report">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Raport Z zilnic</p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-reconciled">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> Închis
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Vânzări nete</p>
            <p className="mt-1 text-base font-semibold text-foreground">263,83 lei</p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">TVA colectat</p>
            <p className="mt-1 text-base font-semibold text-brass">52,17 lei</p>
          </div>
        </div>
        {/* 231,40 + 32,43 = 263,83 net · 48,60 + 3,57 = 52,17 TVA · totals reconcile to 316,00 lei gross */}
        <div className="mt-3 space-y-1.5 rounded-xl border border-border p-3 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Cotă 21%</span>
            <span className="text-foreground">231,40 lei net · 48,60 lei TVA</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Cotă 11%</span>
            <span className="text-foreground">32,43 lei net · 3,57 lei TVA</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <span>Diferență sertar</span>
          <span>0,00 lei</span>
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerPosProof() {
  const cart: [string, string, string][] = [
    ["Cappuccino 240ml", "×2", "22,00 lei"],
    ["Croissant unt", "×1", "9,50 lei"],
    ["Flat White 240ml", "×1", "12,00 lei"],
  ];
  const total = "43,50 lei";

  return (
    <ChromeFrame path="/app/pos">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Comandă curentă</p>
          <span className="text-[10px] font-medium text-muted-foreground">Cafeneaua Centrală · Casa 1</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {cart.map(([name, qty, price]) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="truncate text-foreground">{name}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">{qty}</span>
              <span className="ml-2 shrink-0 font-medium text-foreground">{price}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border p-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">{total}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
          <div className="rounded-lg bg-brass px-3 py-2 text-center text-ink">Card</div>
          <div className="rounded-lg border border-border px-3 py-2 text-center text-mid">Numerar</div>
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerRecipeProof() {
  const ingredients: [string, string, string][] = [
    ["Croissant unt", "45g unt", "1,80 lei"],
    ["Făină", "120g", "0,60 lei"],
    ["Ciocolată", "30g", "2,10 lei"],
  ];

  return (
    <ChromeFrame path="/app/recipes">
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Cost rețetă</p>
        <p className="mt-1 text-sm font-semibold text-foreground">Croissant cu ciocolată</p>
        <div className="mt-3 space-y-1.5">
          {ingredients.map(([name, qty, cost]) => (
            <div key={name} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="truncate text-foreground">{name}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">{qty}</span>
              <span className="ml-2 shrink-0 font-medium text-foreground">{cost}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Cost total</p>
            <p className="mt-1 text-base font-semibold text-foreground">4,50 lei</p>
          </div>
          <div className="rounded-xl border border-reconciled/25 bg-reconciled/10 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-reconciled">Marjă la 12,00 lei</p>
            <p className="mt-1 text-base font-semibold text-reconciled">62,5%</p>
          </div>
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerKitchenProof() {
  const columns: { label: string; tone: string; orders: string[] }[] = [
    { label: "NOI", tone: "border-border bg-secondary text-muted-foreground", orders: ["Masa 3 — Cappuccino ×2"] },
    { label: "ÎN PREGĂTIRE", tone: "border-amber-200 bg-amber-50 text-amber-700", orders: ["Comandă la pachet — Croissant unt ×1"] },
    { label: "GATA", tone: "border-reconciled/25 bg-reconciled/10 text-reconciled", orders: ["Masa 1 — Flat White ×1"] },
    { label: "FINALIZATE", tone: "border-border bg-card text-muted-foreground", orders: [] },
  ];

  return (
    <ChromeFrame path="/app/kitchen">
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Display bucătărie</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {columns.map((col) => (
            <div key={col.label} className={`rounded-lg border p-2 ${col.tone}`}>
              <p className="text-[8px] font-bold uppercase tracking-wide">{col.label}</p>
              <div className="mt-1.5 space-y-1">
                {col.orders.map((order) => (
                  <div key={order} className="rounded bg-card/70 px-1.5 py-1 text-[8px] font-medium leading-tight text-foreground shadow-sm">
                    {order}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerStockProof() {
  const rows: { name: string; qty: string; unitCost: string; low?: boolean }[] = [
    { name: "Cafea boabe", qty: "4,2 kg", unitCost: "68,00 lei/kg" },
    { name: "Lapte", qty: "18 L", unitCost: "6,50 lei/L" },
    { name: "Zahăr", qty: "1,1 kg", unitCost: "4,20 lei/kg", low: true },
    { name: "Pahare carton 240ml", qty: "340 buc", unitCost: "0,45 lei/buc" },
  ];

  return (
    <ChromeFrame path="/app/stock">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Niveluri stoc</p>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> 1 stoc redus
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          {rows.map((row) => (
            <div
              key={row.name}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${row.low ? "bg-amber-50" : "bg-secondary"}`}
            >
              <span className="truncate text-foreground">{row.name}</span>
              <span className="ml-2 shrink-0 text-muted-foreground">{row.qty}</span>
              <span className="ml-2 shrink-0 font-medium text-foreground">{row.unitCost}</span>
            </div>
          ))}
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerSuppliersProof() {
  const suppliers: [string, string, string][] = [
    ["Prăjitorie Artizanală SRL", "0722 145 908", "3.240,00 lei"],
    ["Lactate Bio Mureș SRL", "0745 302 761", "1.180,00 lei"],
    ["Ambalaje Verzi SRL", "0731 987 214", "540,00 lei"],
  ];

  return (
    <ChromeFrame path="/app/suppliers">
      <div className="p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Furnizori</p>
        <div className="mt-3 space-y-1.5">
          {suppliers.map(([name, phone, total]) => (
            <div key={name} className="rounded-lg bg-secondary px-3 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-medium text-foreground">{name}</span>
                <span className="ml-2 shrink-0 font-medium text-foreground">{total}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{phone}</p>
            </div>
          ))}
        </div>
      </div>
    </ChromeFrame>
  );
}

export function OwnerSetupGuideProof() {
  const steps: { label: string; done: boolean }[] = [
    { label: "Adaugă detalii afacere", done: true },
    { label: "Adaugă produse", done: true },
    { label: "Deschide casa", done: true },
    { label: "Prima vânzare test", done: false },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <ChromeFrame path="/app/setup-checklist">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ghid configurare</p>
          <span className="text-[10px] font-semibold text-muted-foreground">{doneCount}/{steps.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-reconciled/100"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        <div className="mt-3 space-y-1.5">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-2.5 rounded-lg bg-secondary px-3 py-2 text-xs">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                  step.done ? "bg-reconciled/100 text-white" : "border border-border text-transparent"
                }`}
              >
                ✓
              </span>
              <span className={step.done ? "text-muted-foreground line-through decoration-border" : "font-medium text-foreground"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChromeFrame>
  );
}
