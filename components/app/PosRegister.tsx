"use client";
import { useMemo, useRef, useState } from "react";
import { addCustomerFromPos, closePosSession, completeSaleReturn, posCashMovement, voidTransaction } from "@/app/actions/kitchenops";
import { runZReport } from "@/app/actions/fiscalnet";
import { fiscalBrowserReceipt, fiscalBrowserCashIn, fiscalBrowserCashOut, fiscalBrowserZReport, downloadFiscalNetTxt, type BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Banknote, Coffee, Droplets, LockKeyhole, Package, ReceiptText, RefreshCcw, UserPlus, Users, Utensils } from "lucide-react";
import { openCashDrawer, type CashDrawerSettings } from "@/lib/cash-drawer";
import { downloadSlipAsTxt, cashInTxt, cashOutTxt } from "@/lib/pos-print";

type Product = {
  id: string; name: string; sale_price: number | string; vat_rate?: number | string | null;
  unit_of_measure?: string | null; image_url?: string | null; placeholder_type?: string | null;
  cost_price?: number | string | null;
  available_in_pos?: boolean | null; is_ingredient?: boolean | null; is_sellable?: boolean | null;
  has_sgr?: boolean | null;
  product_categories?: { id: string; name: string; color: string | null } | null;
};
type Category = { id: string; name: string; color: string | null };
type PaymentMethod = { id: string; name: string; type: string };
type CartItem = { product_id: string; product_name: string; quantity: number; unit_price: number; vat_rate: number; fiscalnet_vat_group?: number | null };
type SplitPayment = { id: string; payment_method_id: string; amount: number; reference?: string };
type Customer = { id: string; name: string; phone: string | null; email: string | null };
type Transaction = { id: string; transaction_number: string; customer_name: string | null; sold_at: string | null; total: number | string; status: string; payment_methods?: { name?: string | null; type?: string | null } | null };
type PosSummary = { openingCash: number; cashSales: number; cardSales: number; expectedCash: number; txCount: number; topProduct: string | null };
type FiscalDownloadPayload = { ok: boolean; message: string; filename?: string; content?: string; status?: string; mode?: string };

type PlaceholderCfg = { bg: string; text: string; icon: "coffee" | "drink" | "food" | "package"; style?: React.CSSProperties };

const PLACEHOLDERS: Record<string, PlaceholderCfg> = {
  coffee:     { bg: "bg-amber-50",  text: "text-amber-500",  icon: "coffee"  },
  drink:      { bg: "bg-sky-50",    text: "text-sky-500",    icon: "drink"   },
  food:       { bg: "bg-green-50",  text: "text-green-600",  icon: "food"    },
  snack:      { bg: "bg-yellow-50", text: "text-yellow-500", icon: "food"    },
  ingredient: { bg: "bg-slate-100", text: "text-slate-400",  icon: "package" },
  other:      { bg: "bg-slate-100", text: "text-slate-400",  icon: "package" },
};

async function downloadFiscalPayload(result: FiscalDownloadPayload, label: string) {
  console.info("[FiscalNet] client result received", {
    label,
    ok: result.ok,
    status: result.status,
    mode: result.mode,
    filename: result.filename,
    contentLength: result.content?.length ?? 0,
  });
  if (!result.filename || !result.content) return false;
  await downloadFiscalNetTxt(result.filename, result.content);
  return true;
}

function money(v: number, cur = "EUR") { if (cur === "RON") return `${v.toFixed(2)} lei`; return new Intl.NumberFormat("en-IE",{style:"currency",currency: cur || "EUR"}).format(v); }

function paymentLabel(type: string, name: string) {
  if (type === "cash") return "Cash";
  if (type === "card") return "Card";
  if (type === "online") return "Online";
  if (type === "other") return "Other";
  return name || "Payment";
}

function getPhCfg(p: Product): PlaceholderCfg {
  if (p.placeholder_type && PLACEHOLDERS[p.placeholder_type]) return PLACEHOLDERS[p.placeholder_type];
  const cat = p.product_categories?.name?.toLowerCase() ?? "";
  if (cat.includes("coffee")||cat.includes("espresso")||cat.includes("cappuccino")||cat.includes("blend")||cat.includes("speciality")) return PLACEHOLDERS.coffee;
  if (cat.includes("drink")||cat.includes("beverage")||cat.includes("juice")||cat.includes("limonada")||cat.includes("bauturi")||cat.includes("iced")) return PLACEHOLDERS.drink;
  if (cat.includes("food")||cat.includes("meal")||cat.includes("lunch")||cat.includes("snack")||cat.includes("bakery")||cat.includes("pastry")||cat.includes("hot beverage")) return PLACEHOLDERS.food;
  const col = p.product_categories?.color;
  if (col) return { bg: "", text: "text-white", icon: "package", style: { backgroundColor: col } };
  return PLACEHOLDERS.other;
}

function PlaceholderIcon({ icon, className }: { icon: PlaceholderCfg["icon"]; className?: string }) {
  const cls = className ?? "h-8 w-8";
  if (icon === "coffee")  return <Coffee className={cls} />;
  if (icon === "drink")   return <Droplets className={cls} />;
  if (icon === "food")    return <Utensils className={cls} />;
  return <Package className={cls} />;
}

// ── Cash movement dialog ────────────────────────────────────────────────────
// ── Product image with polished fallback ─────────────────────────────────────────
function ProductImage({ src, alt, cfg }: { src: string | null | undefined; alt: string; cfg: PlaceholderCfg }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex h-28 w-full shrink-0 items-center justify-center ${cfg.bg} ${cfg.text}`}
        style={cfg.style}
      >
        <PlaceholderIcon icon={cfg.icon} className="h-9 w-9 opacity-40" />
      </div>
    );
  }
  return (
    <div className="h-28 w-full shrink-0 overflow-hidden bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-opacity duration-200"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function ProductImageCompact({ src, alt, cfg }: { src: string | null | undefined; alt: string; cfg: PlaceholderCfg }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex h-16 w-full shrink-0 items-center justify-center ${cfg.bg} ${cfg.text}`}
        style={cfg.style}
      >
        <PlaceholderIcon icon={cfg.icon} className="h-6 w-6 opacity-40" />
      </div>
    );
  }
  return (
    <div className="h-16 w-full shrink-0 overflow-hidden bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
}

// ── Customer combobox (search saved + add new) ────────────────────────────
function CustomerCombobox({ customers, value, onChange }: {
  customers: Customer[];
  value: Customer | null;
  onChange: (c: Customer | null) => void;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);

  const filtered = customers.filter((c) => {
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q) || (c.email ?? "").toLowerCase().includes(q);
  }).slice(0, 6);

  function handleSelect(c: Customer) { onChange(c); setQuery(c.name); setOpen(false); }
  function handleClear() { onChange(null); setQuery(""); setOpen(false); }

  return (
    <div className="relative">
      <div className="relative">
        <input
          name="customer_name"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(null); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder="Search customer…"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 pr-7 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={handleClear} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
        )}
      </div>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          {filtered.map((c) => (
            <button key={c.id} type="button" onMouseDown={() => handleSelect(c)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm border-b border-slate-50 last:border-0">
              <p className="font-medium text-slate-900">{c.name}</p>
              <p className="text-xs text-slate-400">{[c.phone, c.email].filter(Boolean).join(" · ") || "No contact details"}</p>
            </button>
          ))}
          {filtered.length === 0 && query && (
            <button type="button" onMouseDown={() => handleSelect({ id: "", name: query, phone: null, email: null })}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-blue-600">
              + Use &ldquo;{query}&rdquo; as walk-in name
            </button>
          )}
          {filtered.length === 0 && !query && (
            <p className="px-3 py-2 text-xs text-slate-400">Type to search saved customers</p>
          )}
        </div>
      )}
    </div>
  );
}

function TillDialog({ sessionId, cashDrawerSettings, fiscalNet, isRO = false, currency = "EUR", orgName = "", userName = "" }: { sessionId?: string | null; cashDrawerSettings?: CashDrawerSettings; fiscalNet?: BrowserFiscalConfig | null; isRO?: boolean; currency?: string; orgName?: string; userName?: string }) {
  const [open, setOpen] = useState(false);
  const [movementType, setMovementType] = useState<"cash_in" | "cash_out">("cash_in");
  const [message, setMessage] = useState<string | null>(null);
  const [lastTxt, setLastTxt] = useState<{ filename: string; content: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCashMovement(formData: FormData) {
    setPending(true);
    setLastTxt(null);
    try {
      const amount = Number(formData.get("amount") ?? 0);
      await posCashMovement(formData);
      const result = await openCashDrawer(movementType, cashDrawerSettings);
      // FiscalNet cash in/out (browser → localhost:65400)
      if (fiscalNet?.enabled && amount > 0) {
        const fnRes = movementType === "cash_in"
          ? await fiscalBrowserCashIn(fiscalNet, amount)
          : await fiscalBrowserCashOut(fiscalNet, amount);
        if (fnRes.filename && fnRes.content) setLastTxt({ filename: fnRes.filename, content: fnRes.content });
        console.info("[FiscalNet] cash movement browser result", { type: movementType, ok: fnRes.ok, message: fnRes.message, mode: fiscalNet.connectionMode });
        const fnMsg = fnRes.ok ? ` | FiscalNet: ${fnRes.message}` : ` | ⚠️ FiscalNet: ${fnRes.message}`;
        setMessage((result.cashierMessage ? `✓ ${result.cashierMessage}` : "✓ Cash movement saved.") + fnMsg);
      } else {
        setMessage(result.cashierMessage ? `✓ ${result.cashierMessage}` : "✓ Cash movement saved.");
      }
      // Download TXT slip only when FiscalNet is not active. When FiscalNet is active,
      // avoid a second automatic download because browsers may block it.
      if (isRO && !fiscalNet?.enabled) {
        const slipAmount = Number(formData.get("amount") ?? 0);
        const slipReason = String(formData.get("reason") ?? "");
        if (movementType === "cash_in") {
          const { text, filename } = cashInTxt({ orgName, currency, amount: slipAmount, reason: slipReason, userName });
          downloadSlipAsTxt(text, filename);
        } else {
          const { text, filename } = cashOutTxt({ orgName, currency, amount: slipAmount, reason: slipReason, userName });
          downloadSlipAsTxt(text, filename);
        }
      }
      setTimeout(() => { setOpen(false); setMessage(null); setPending(false); }, 2000);
    } catch {
      setMessage("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!pending) { setOpen(v); if (!v) setMessage(null); } }}>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
        <Banknote className="h-4 w-4" />Cash
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cash movement</DialogTitle></DialogHeader>
        <form action={handleCashMovement} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <input type="hidden" name="movement_type" value={movementType} />
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => setMovementType("cash_in")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${movementType === "cash_in" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
              Cash in
            </button>
            <button type="button" onClick={() => setMovementType("cash_out")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${movementType === "cash_out" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
              Cash out
            </button>
          </div>
          <div>
            <Label>Amount ({currency === "RON" ? "lei" : "€"})</Label>
            <Input name="amount" type="number" step="0.01" min="0.01" required />
            <p className="mt-1 text-xs text-slate-500">{movementType === "cash_in" ? "Cash added to the drawer." : "Cash removed from the drawer."}</p>
          </div>
          <div><Label>Reason</Label><Input name="reason" required placeholder={movementType === "cash_in" ? "Extra float" : "Supplier payment"} /></div>
          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.startsWith("✓") ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-700"}`}>
              <p>{message}</p>
              {lastTxt && (
                <button
                  type="button"
                  onClick={() => downloadFiscalNetTxt(lastTxt.filename, lastTxt.content)}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Download TXT again
                </button>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={pending}>
              {pending ? "Recording…" : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Refund dialog ────────────────────────────────────────────────────────────
function RefundDialog({ recentTransactions, currency = "EUR" }: { recentTransactions: Transaction[]; currency?: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleVoid(formData: FormData) {
    setPending(true);
    try {
      await (voidTransaction as unknown as (fd: FormData) => Promise<void>)(formData);
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setPending(false);
      }, 1200);
    } catch {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!pending) setOpen(v); }}>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
        <RefreshCcw className="h-4 w-4" />Refund
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Refund / void</DialogTitle></DialogHeader>
        {done ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <p className="font-semibold text-slate-900">Transaction voided</p>
          </div>
        ) : (
          <form action={handleVoid} className="space-y-3">
            <select name="transaction_id" required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">Select recent transaction</option>
              {recentTransactions.filter((t) => t.status === "completed").map((tx) => (
                <option key={tx.id} value={tx.id}>{tx.transaction_number} · {money(Number(tx.total ?? 0), currency)}</option>
              ))}
            </select>
            <Input name="reason" required placeholder="Reason required" />
            <p className="text-xs text-slate-500">Full refund/void only. Partial refund coming soon.</p>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
              <Button type="submit" variant="outline" className="border-red-300 text-red-700" disabled={pending}>
                {pending ? "Processing…" : "Refund / void"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Close till dialog ────────────────────────────────────────────────────────
function CloseTillDialog({ sessionId, summary, fiscalNet, currency = "EUR", orgName = "", userName = "" }: { sessionId?: string | null; summary: PosSummary; fiscalNet?: BrowserFiscalConfig | null; currency?: string; orgName?: string; userName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
        <LockKeyhole className="h-4 w-4" />Close till
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Close till</DialogTitle></DialogHeader>
        <form action={async (fd: FormData) => {
          await (closePosSession as unknown as (fd: FormData) => Promise<void>)(fd);
        }} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span>Opening cash</span><strong>{money(summary.openingCash, currency)}</strong></div>
            <div className="flex justify-between"><span>Cash sales</span><strong>{money(summary.cashSales, currency)}</strong></div>
            <div className="flex justify-between"><span>Card sales</span><strong>{money(summary.cardSales, currency)}</strong></div>
            <div className="flex justify-between border-t pt-2"><span className="font-medium">Expected cash</span><strong className="text-blue-700">{money(summary.expectedCash, currency)}</strong></div>
          </div>
          <div>
            <Label>Counted cash ({currency === "RON" ? "lei" : "€"})</Label>
            <Input name="counted_cash" type="number" step="0.01" min="0" required />
            <p className="mt-1 text-xs text-slate-500">How much cash is actually in the drawer.</p>
          </div>
          <div><Label>Notes</Label><Input name="notes" /></div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Close till</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main PosRegister ─────────────────────────────────────────────────────────
export function PosRegister({
  products, categories, paymentMethods, sessionId, customers = [], recentTransactions = [], summary, cashDrawerSettings, fiscalNet = null, currency = "EUR", orgName = "", userName = "", sgrEnabled = false, sgrProduct = null,
  isRO = false, fiscalZReportDone: initialZReportDone = false,
  vatRateGroupMap = {},
  features = {},
}: {
  products: Product[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  sessionId?: string | null;
  customers?: Customer[];
  recentTransactions?: Transaction[];
  summary: PosSummary;
  cashDrawerSettings?: CashDrawerSettings;
  fiscalNet?: BrowserFiscalConfig | null;
  /** True when org country is Romania — enables txt slip downloads */
  isRO?: boolean;
  currency?: string;
  orgName?: string;
  userName?: string;
  /** Romania SGR: auto-add deposit product when SGR-applicable items are in cart */
  sgrEnabled?: boolean;
  /** The SGR deposit product for this org */
  sgrProduct?: Product | null;
  /** Whether Z report was already run in this POS session */
  fiscalZReportDone?: boolean;
  /** Romania FiscalNet: maps numeric VAT rate → fiscalnet_vat_group code from vat_rates table */
  vatRateGroupMap?: Record<number, number>;
  features?: {
    kitchenDisplay?: boolean;
    restaurantOrderFlow?: boolean;
    orderTypes?: boolean;
    tableService?: boolean;
    splitPayments?: boolean;
    tips?: boolean;
  };
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  // Lazy initializer: restore cart from sessionStorage if the page was reloaded mid-payment
  // (e.g. after a server-action build mismatch). Runs once before first render — no effect needed.
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (!sessionId) return [];
    try {
      const raw = sessionStorage.getItem("pos_cart_backup");
      if (!raw) return [];
      const backup = JSON.parse(raw) as { cart: CartItem[]; sessionId: string };
      if (backup.sessionId === sessionId && Array.isArray(backup.cart) && backup.cart.length > 0) {
        sessionStorage.removeItem("pos_cart_backup");
        return backup.cart;
      }
    } catch {}
    return [];
  });
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const router = useRouter();
  // Currency-aware formatter (RON for Romania, EUR for Ireland)
  const money = (v: number) =>
    new Intl.NumberFormat(currency === "RON" ? "ro-RO" : "en-IE", {
      style: "currency",
      currency: currency || "EUR",
    }).format(v);
  const chargeRef = useRef<HTMLButtonElement>(null);
  const [discountPct, setDiscountPct] = useState(0);
  const [saleStatus, setSaleStatus] = useState<{ ok: boolean; msg: string; transactionId?: string } | null>(null);
  const [lastFiscalTxt, setLastFiscalTxt] = useState<{ filename: string; content: string } | null>(null);
  const [salePending, setSalePending] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [txSearch, setTxSearch] = useState("");
  const [zReportDone, setZReportDone] = useState(initialZReportDone);
  const [zReportPending, setZReportPending] = useState(false);
  const [zReportOpen, setZReportOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [orderType, setOrderType] = useState("takeaway");
  const [tableLabel, setTableLabel] = useState("");
  const [kitchenNote, setKitchenNote] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  // Smart-button modal open states
  const [notesOpen, setNotesOpen] = useState(false);
  const [orderTypeOpen, setOrderTypeOpen] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState<number | "">("");

  const posProducts = useMemo(() =>
    products.filter((p) => p.available_in_pos !== false && p.is_ingredient !== true), [products]);

  const filtered = useMemo(() =>
    posProducts.filter((p) => {
      // When search is active, ignore category so users find products across all categories
      const matchCat = search.trim() ? true : activeCategory === "all" || p.product_categories?.id === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }), [posProducts, activeCategory, search]);

  const activeCategoryIds = useMemo(() => new Set(posProducts.map((p) => p.product_categories?.id).filter(Boolean)), [posProducts]);
  const visibleCategories = categories.filter((c) => activeCategoryIds.has(c.id));
  const hasCategories = visibleCategories.length > 0;
  const shownCustomers = customers.filter((c) =>
    [c.name, c.phone, c.email].filter(Boolean).join(" ").toLowerCase().includes(customerSearch.toLowerCase())
  ).slice(0, 8);
  const shownTransactions = recentTransactions.filter((t) =>
    [t.transaction_number, t.customer_name, t.payment_methods?.name].filter(Boolean).join(" ").toLowerCase().includes(txSearch.toLowerCase())
  ).slice(0, 12);

  const grossTotal = useMemo(() => cart.reduce((s, i) => s + i.quantity * i.unit_price, 0), [cart]);
  const discountAmount = grossTotal * (discountPct / 100);
  const afterDiscount = grossTotal - discountAmount;
  const safeTipAmount = features.tips ? Math.max(0, tipAmount) : 0;
  const totalDue = afterDiscount + safeTipAmount;
  const activeSplitPayments = splitPayments.filter((row) => row.amount > 0 && row.payment_method_id);
  const splitPaid = activeSplitPayments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const splitRemaining = totalDue - splitPaid;
  const selectedPaymentType = paymentMethods.find((m) => m.id === paymentMethodId)?.type ?? "other";
  const isCashSingle = selectedPaymentType === "cash" && activeSplitPayments.length === 0 && cart.length > 0;
  const changeDue = isCashSingle && typeof cashReceived === "number" && cashReceived > 0
    ? Number((cashReceived - totalDue).toFixed(2))
    : null;
  const cashUnderPaid = isCashSingle && typeof cashReceived === "number" && cashReceived > 0 && cashReceived < totalDue - 0.005;
  const totalVat = useMemo(() => cart.reduce((s, i) => {
    const gross = i.quantity * i.unit_price * (1 - discountPct / 100);
    const vat = gross - gross / (1 + i.vat_rate / 100);
    return s + vat;
  }, 0), [cart, discountPct]);

  /** Recalculates the SGR deposit line so its qty always equals sum of has_sgr product qtys */
  const syncSgr = (items: CartItem[]): CartItem[] => {
    if (!sgrEnabled || !sgrProduct) return items;
    const needed = items.reduce((sum, item) => {
      const prod = products.find((pr) => pr.id === item.product_id);
      return sum + (prod?.has_sgr ? item.quantity : 0);
    }, 0);
    const withoutSgr = items.filter((i) => i.product_id !== sgrProduct!.id);
    if (needed === 0) return withoutSgr;
    const sgrRate = Number(sgrProduct.vat_rate ?? 0);
    return [...withoutSgr, {
      product_id:           sgrProduct.id,
      product_name:         sgrProduct.name,
      quantity:             needed,
      unit_price:           Number(sgrProduct.sale_price),
      vat_rate:             sgrRate,
      fiscalnet_vat_group:  vatRateGroupMap[sgrRate] ?? null,
    }];
  };

  const addToCart = (p: Product) =>
    setCart((items) => {
      const ex = items.find((i) => i.product_id === p.id);
      const vatRate = Number(p.vat_rate ?? 0);
      const updated = ex
        ? items.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: Number(p.sale_price), vat_rate: vatRate, fiscalnet_vat_group: vatRateGroupMap[vatRate] ?? null }];
      return syncSgr(updated);
    });

  const setQty = (id: string, qty: number) =>
    setCart((items) => {
      const updated = items.flatMap((i) => i.product_id === id ? qty <= 0 ? [] : [{ ...i, quantity: qty }] : [i]);
      return syncSgr(updated);
    });

  const setLineTotal = (id: string, total: number) =>
    setCart((items) =>
      syncSgr(items.map((i) => {
        if (i.product_id !== id) return i;
        const safeQty = Math.max(1, i.quantity);
        return { ...i, unit_price: Math.max(0, total) / safeQty };
      }))
    );

  return (
    <div className="flex-1 lg:flex lg:overflow-hidden" style={{minHeight: 0}}>
      {/* Left: Products column */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden" style={{display: "flex", flexDirection: "column", overflow: "hidden", flex: "1 1 auto", minWidth: 0}}>
        {/* Products toolbar: title, categories, search */}
        <div className="space-y-3 p-3 sm:p-4 lg:px-4 lg:pt-4 lg:pb-3 lg:flex-none" style={{flexShrink: 0}}>
        <h1 className="text-2xl font-semibold text-slate-950">POS</h1>
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => setActiveCategory("all")}
            className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${activeCategory === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-50"}`}>
            All
          </button>
          {visibleCategories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`min-h-10 shrink-0 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${activeCategory === c.id ? "text-white border-transparent" : "bg-white hover:bg-slate-50"}`}
              style={activeCategory === c.id ? { backgroundColor: c.color ?? "#2563eb" } : undefined}>
              {c.name}
            </button>
          ))}
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="max-w-md" aria-label="Search products" />
        </div>
        {/* Scrollable products area */}
        <div className="p-3 sm:p-4 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:px-4 lg:py-4" style={{WebkitOverflowScrolling: "touch", flex: "1 1 auto", minHeight: 0, overflowY: "auto"}}>
        <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((p) => {
            const cfg = getPhCfg(p);
            const inCart = cart.find((i) => i.product_id === p.id);
            const price = Number(p.sale_price);
            const cost = Number(p.cost_price ?? 0);
            const lowMargin = cost > 0 && price > 0 && (price - cost) / price < 0.3;
            return (
              <button key={p.id} onClick={() => addToCart(p)}
                className={`group flex flex-col overflow-hidden rounded-lg border text-left shadow-sm transition-all hover:shadow-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${inCart ? "border-blue-400 ring-2 ring-blue-100 bg-blue-50/30" : "border-slate-200 bg-white hover:border-blue-300"}`}>
                <ProductImageCompact src={p.image_url} alt={p.name} cfg={cfg} />
                <div className="flex flex-1 flex-col bg-white p-1.5">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-slate-900" title={p.name}>{p.name}</p>
                  <div className="mt-1 flex items-end justify-between">
                    <div className="flex flex-col items-start gap-0.5">
                      {inCart && <span className="text-[9px] font-semibold text-blue-600">×{inCart.quantity}</span>}
                      {lowMargin && <span className="text-[9px] bg-red-50 border border-red-200 text-red-600 rounded px-0.5 leading-tight">!</span>}
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-none">{money(price)}</p>
                  </div>
                </div>
              </button>
            );
          })}
          {!filtered.length && (
            <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-slate-400">
              {posProducts.length === 0 ? "No products yet — add products in the Products menu." : "No products match the filter."}
            </div>
          )}
        </div>
        </div>
        {/* pos-utility-bar */}
        <div className="border-t border-slate-200 bg-white px-3 py-2 sm:px-4 overflow-x-auto" style={{WebkitOverflowScrolling: "touch", flexShrink: 0}}>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 px-4 shrink-0" onClick={() => setCart([])}>New sale</Button>

            {/* Customers sheet */}
            <Sheet>
              <SheetTrigger render={<Button type="button" variant="outline" className="h-11 px-4 shrink-0" />}>
                <Users className="h-4 w-4" />Customers
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader><SheetTitle>Customers</SheetTitle></SheetHeader>
                <div className="space-y-4 overflow-y-auto px-4 pb-4">
                  <Input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Search customer" />
                  <div className="space-y-2">
                    {shownCustomers.map((c) => (
                      <button key={c.id} type="button" onClick={() => setSelectedCustomer(c)} className="w-full rounded-lg border p-3 text-left hover:bg-slate-50">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-slate-500">{[c.phone, c.email].filter(Boolean).join(" · ") || "No contact details"}</p>
                      </button>
                    ))}
                  </div>
                  <form action={addCustomerFromPos as unknown as (fd: FormData) => Promise<void>} className="space-y-3 rounded-lg border p-3">
                    <p className="text-sm font-medium">Quick add customer</p>
                    <Input name="name" required placeholder="Name" />
                    <Input name="phone" placeholder="Phone" />
                    <Input name="email" type="email" placeholder="Email" />
                    <Button type="submit" size="sm"><UserPlus className="h-4 w-4" />Add customer</Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>

            {/* Orders / Transactions sheet */}
            <Sheet>
              <SheetTrigger render={<Button type="button" variant="outline" className="h-11 px-4 shrink-0" />}>
                <ReceiptText className="h-4 w-4" />Orders
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl">
                <SheetHeader><SheetTitle>Orders / Transactions</SheetTitle></SheetHeader>
                <div className="space-y-3 overflow-y-auto px-4 pb-4">
                  <Input value={txSearch} onChange={(e) => setTxSearch(e.target.value)} placeholder="Search transaction" />
                  {shownTransactions.map((tx) => (
                    <div key={tx.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{tx.transaction_number}</strong>
                        <span className="font-medium">{money(Number(tx.total ?? 0))}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.customer_name || "Walk-in"} · {tx.payment_methods?.name ?? "Payment"} · {tx.sold_at ? new Date(tx.sold_at).toLocaleString("en-IE") : ""}</p>
                      <div className="mt-2 flex gap-3">
                        <a className="text-blue-600 hover:underline text-xs" href={`/app/transactions/${tx.id}`}>View receipt</a>
                        <a className="text-red-600 hover:underline text-xs" href={`/app/transactions/${tx.id}`}>Refund / void</a>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Refund dialog (auto-closes) */}
            <RefundDialog recentTransactions={recentTransactions}  currency={currency}/>

            {/* Cash in/out dialog (auto-closes) */}
            <TillDialog sessionId={sessionId} cashDrawerSettings={cashDrawerSettings} fiscalNet={fiscalNet} isRO={isRO} currency={currency} orgName={orgName} userName={userName}/>

            {/* Z Report button — Romania FiscalNet only, explicit admin action, once per session */}
            {isRO && fiscalNet?.enabled && (
              <Dialog open={zReportOpen} onOpenChange={setZReportOpen}>
                <DialogTrigger render={
                  <Button
                    type="button"
                    variant="outline"
                    className={`h-11 px-4 shrink-0 ${zReportDone ? "border-green-300 text-green-700" : ""}`}
                    disabled={zReportDone || zReportPending}
                  />
                }>
                  {zReportPending ? "Procesare Z..." : zReportDone ? "✓ Raport Z" : "Raport Z"}
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader><DialogTitle>Confirmare Raport Z</DialogTitle></DialogHeader>
                  <p className="text-sm text-slate-600">
                    Raportul Z <strong>închide ziua fiscală</strong> pe casa fiscală. Această operațiune este
                    ireversibilă şi poate fi efectuată o singură dată pe sesiune.
                  </p>
                  {fiscalNet.mockMode && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">
                      Mod simulare activ — comanda nu va fi trimisă la casa fiscală.
                    </p>
                  )}
                  <DialogFooter>
                    <DialogClose render={<Button type="button" variant="outline" />}>Anulează</DialogClose>
                    <Button
                      type="button"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={async () => {
                        setZReportPending(true);
                        setZReportOpen(false);
                        try {
                          const fd = new FormData();
                          if (sessionId) fd.set("session_id", sessionId);
                          const res = await (runZReport as unknown as (fd: FormData) => Promise<FiscalDownloadPayload>)(fd);
                          if (res.status === "browser_api_pending" && fiscalNet) {
                            // API mode: FiscalNet is on this device — call it directly from the browser
                            const fnRes = await fiscalBrowserZReport(fiscalNet);
                            setZReportDone(true);
                            setSaleStatus({ ok: fnRes.ok, msg: fnRes.ok ? "Raport Z trimis: " + fnRes.message : "FiscalNet: " + fnRes.message });
                          } else {
                            const downloaded = res.ok ? await downloadFiscalPayload(res, "z_report") : false;
                            if (res.filename && res.content) setLastFiscalTxt({ filename: res.filename, content: res.content });
                            if (res.ok) setZReportDone(true);
                            setSaleStatus({ ok: res.ok, msg: downloaded ? "Z report TXT downloaded. Place it in FiscalNet Bonuri folder if needed." : res.message });
                          }
                          setTimeout(() => setSaleStatus(null), 4000);
                        } catch (e) {
                          setSaleStatus({ ok: false, msg: e instanceof Error ? e.message : "Eroare raport Z" });
                          setTimeout(() => setSaleStatus(null), 4000);
                        } finally {
                          setZReportPending(false);
                        }
                      }}
                    >
                      Confirmă Raport Z
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Close till dialog */}
            <CloseTillDialog sessionId={sessionId} summary={summary} fiscalNet={fiscalNet} currency={currency} orgName={orgName} userName={userName}/>
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (salePending) return;
        setSalePending(true);
        setSaleStatus(null);
        setLastFiscalTxt(null);
          const fd = new FormData(e.currentTarget);
          // Preserve cart before network call — restored if the page reloads before completion
          try { sessionStorage.setItem("pos_cart_backup", JSON.stringify({ cart, sessionId })); } catch {}
          if (features.splitPayments) {
            fd.set("split_payments_json", JSON.stringify(activeSplitPayments.map((row) => {
              const method = paymentMethods.find((m) => m.id === row.payment_method_id);
              return {
                payment_method_id: row.payment_method_id,
                method: method?.type ?? "other",
                amount: row.amount,
                reference: row.reference ?? "",
              };
            })));
          }
          try {
          const res = await completeSaleReturn(fd);
          if (!res.ok) {
            setSaleStatus({ ok: false, msg: res.error });
            setSalePending(false);
            return;
          }
          // FiscalNet receipt — called from browser → localhost:65400
          if (res.fiscalApiPending && fiscalNet) {
            const fnRes = await fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType);
            if (fnRes.filename && fnRes.content) setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
            console.info("[FiscalNet] receipt browser result", { ok: fnRes.ok, message: fnRes.message, mode: fiscalNet.connectionMode });
            setSaleStatus({ ok: fnRes.ok, msg: fnRes.ok ? `✓ Vândut ${money(res.total)} — ${fnRes.message}` : `✓ Vânzare salvată | ⚠️ FiscalNet: ${fnRes.message}`, transactionId: res.transactionId });
          } else {
            // Show why FiscalNet didn't fire (mock mode, not RO, or disabled)
            const mockActive = fiscalNet?.enabled && fiscalNet?.mockMode;
            const saleMsg = mockActive
              ? `✓ Vânzare ${money(res.total)} salvată. ⚠️ Simulare activă — bon fiscal neemis. Dezactivează "Mod simulare" în Setări.`
              : `✓ Vânzare ${money(res.total)} salvată.`;
            setSaleStatus({ ok: true, msg: saleMsg, transactionId: res.transactionId });
          }
          setCart([]);
          setDiscountPct(0);
          setTipAmount(0);
          setSplitPayments([]);
          setSelectedCustomer(null);
          setCashReceived("");
          setSalePending(false);
          try { sessionStorage.removeItem("pos_cart_backup"); } catch {}
          // Redirect to transaction page after brief success display
          setTimeout(() => {
            setSaleStatus(null);
            router.push(`/app/transactions/${res.transactionId}?recorded=1${res.cashSale ? "&drawer=cash_sale" : ""}`);
          }, res.fiscalApiPending ? 2500 : 1200);
        } catch (err) {
          const rawMsg = err instanceof Error ? err.message : "";
          // Detect framework/network errors (build mismatch, dropped connection, etc.)
          const isFrameworkError = /unexpected response|from the server|failed to fetch|networkerror|load failed|fetch/i.test(rawMsg);
          const safeMsg = isRO
            ? isFrameworkError
              ? "Aplicația s-a actualizat în fundal. Comanda ta este intactă — reîncarcă pagina și încearcă din nou."
              : "Vânzarea nu a fost finalizată. Nicio plată nu a fost înregistrată. Încearcă din nou."
            : isFrameworkError
              ? "The POS updated in the background. Your order is kept — reload and try again."
              : "Sale not completed. No payment recorded. Please try again.";
          setSaleStatus({ ok: false, msg: safeMsg });
          setSalePending(false);
        }
      }} className="flex min-h-[28rem] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:rounded-none lg:border-0 lg:border-l lg:shadow-none lg:min-h-0 lg:w-[380px] lg:flex-none lg:overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <CustomerCombobox customers={customers} value={selectedCustomer} onChange={setSelectedCustomer} />
          {/* Compact context pill — only shown when restaurant/order features are on */}
          {(features.kitchenDisplay || features.restaurantOrderFlow || features.orderTypes || features.tableService) && (
            <button type="button" onClick={() => setOrderTypeOpen(true)}
              className="mt-2 flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors">
              <span className="font-medium capitalize">
                {features.orderTypes ? orderType : "Order"}
                {features.tableService && tableLabel ? ` · Table ${tableLabel}` : ""}
              </span>
              <span className="text-slate-400">Edit ›</span>
            </button>
          )}
        </div>
        <div className="px-4 pt-3 pb-1 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order</span>
          {cart.length > 0 && <button type="button" onClick={() => setCart([])} className="text-xs text-slate-400 hover:text-red-500">Clear all</button>}
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 px-4 pb-2" style={{minHeight: 0, WebkitOverflowScrolling: "touch"}}>
          {cart.map((item) => (
            <div key={item.product_id} className="flex items-center gap-2 rounded-xl border border-transparent bg-white/80 px-2 py-2 transition-colors hover:border-blue-100 hover:bg-blue-50/40">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.product_name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => setQty(item.product_id, item.quantity - 1)} aria-label="Decrease quantity" className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">−</button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button type="button" onClick={() => setQty(item.product_id, item.quantity + 1)} aria-label="Increase quantity" className="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">+</button>
              </div>
              <input
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(item.quantity * item.unit_price) ? (item.quantity * item.unit_price).toFixed(2) : "0.00"}
                onChange={(e) => setLineTotal(item.product_id, Number(e.target.value) || 0)}
                aria-label={`Line total for ${item.product_name}`}
                className="h-9 w-20 rounded-lg border border-transparent bg-slate-100 px-2 text-right text-sm font-bold tabular-nums text-slate-950 outline-none transition-colors hover:bg-white focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button type="button" onClick={() => setQty(item.product_id, 0)} aria-label="Remove item" className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg text-sm text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200">×</button>
            </div>
          ))}
          {!cart.length && <p className="py-10 text-center text-sm text-slate-300">Tap a product to add it.</p>}
        </div>
        <div className="border-t border-slate-100 px-4 pt-4 pb-4 space-y-3 shrink-0">
          {/* Smart-action chip row — optional features as compact buttons */}
          {(features.tips || features.splitPayments || features.kitchenDisplay || features.restaurantOrderFlow) && cart.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(features.kitchenDisplay || features.restaurantOrderFlow) && (
                <button type="button" onClick={() => setNotesOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${(kitchenNote || customerNote) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  📝 Notes{(kitchenNote || customerNote) ? " ●" : ""}
                </button>
              )}
              {features.tips && (
                <button type="button" onClick={() => setTipOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${safeTipAmount > 0 ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  💰 {safeTipAmount > 0 ? `Tip ${money(safeTipAmount)}` : "Tip"}
                </button>
              )}
              {features.splitPayments && (
                <button type="button" onClick={() => setSplitOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeSplitPayments.length > 0 ? "border-purple-300 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  ⚡ {activeSplitPayments.length > 0 ? `Split (${activeSplitPayments.length})` : "Split"}
                </button>
              )}
            </div>
          )}
          {/* Discount row — compact, always available */}
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">Discount %</span>
              <input type="number" min="0" max="100" step="1" value={discountPct || ""} onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                placeholder="0" aria-label="Discount percentage" className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-sm text-right" />
              {discountPct > 0 && <span className="text-xs text-blue-600 font-medium">−{money(discountAmount)}</span>}
            </div>
          )}
          {/* Totals */}
          {discountPct > 0 && <div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>{money(grossTotal)}</span></div>}
          {totalVat > 0.01 && <div className="flex justify-between text-xs text-slate-400"><span>Incl. VAT</span><span>{money(totalVat)}</span></div>}
          {safeTipAmount > 0 && <div className="flex justify-between text-xs text-green-700"><span>Tip</span><span>{money(safeTipAmount)}</span></div>}
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-bold text-slate-950 tabular-nums">{money(totalDue)}</span>
          </div>
          {/* Payment methods — simple picker or split summary */}
          <input type="hidden" name="payment_method_id" value={paymentMethodId} />
          {(!features.splitPayments || activeSplitPayments.length === 0) && <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {paymentMethods.map((m) => {
              const selected = paymentMethodId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethodId(m.id)}
                  className={`min-h-11 rounded-lg border px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                >
                  {paymentLabel(m.type, m.name)}
                </button>
              );
            })}
          </div>}
          {features.splitPayments && activeSplitPayments.length > 0 && (
            <button type="button" onClick={() => setSplitOpen(true)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${splitRemaining > 0.01 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-300 bg-green-50 text-green-800"}`}>
              <span className="font-semibold">Split payment</span>
              {" · "}Paid {money(splitPaid)}
              {splitRemaining > 0.01 ? ` · Remaining ${money(splitRemaining)}` : " · Fully paid ✓"}
              <span className="float-right text-slate-500">Edit ›</span>
            </button>
          )}
          {features.splitPayments && activeSplitPayments.length === 0 && (
            <button type="button" onClick={() => setSplitOpen(true)}
              className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
              + Add split payment
            </button>
          )}
          {/* ── Cash received / change due (cash payment only, non-split) ── */}
          {isCashSingle && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <label htmlFor="cash-received-input" className="shrink-0 text-sm font-medium text-slate-700">
                  {isRO ? "Clientul a dat" : "Cash received"}
                </label>
                <input
                  id="cash-received-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCashReceived(v === "" ? "" : Math.max(0, parseFloat(v) || 0));
                  }}
                  placeholder={totalDue.toFixed(2)}
                  className="ml-auto h-9 w-28 rounded-lg border border-slate-200 bg-white px-2 text-right text-base font-bold tabular-nums text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {([
                  { label: isRO ? "Exact" : "Exact", v: Number(totalDue.toFixed(2)) },
                  { label: currency === "RON" ? "1 leu" : "€1",  v: Math.ceil(totalDue)                    },
                  { label: currency === "RON" ? "5 lei" : "€5",  v: Math.ceil(totalDue / 5)  * 5           },
                  { label: currency === "RON" ? "10 lei" : "€10", v: Math.ceil(totalDue / 10) * 10          },
                  { label: currency === "RON" ? "20 lei" : "€20", v: Math.ceil(totalDue / 20) * 20          },
                  { label: currency === "RON" ? "50 lei" : "€50", v: Math.ceil(totalDue / 50) * 50          },
                ] as { label: string; v: number }[])
                  .filter((btn, i) => i === 0 || btn.v !== Number(totalDue.toFixed(2)))
                  .filter((btn, i, arr) => arr.findIndex((b) => b.v === btn.v) === i)
                  .map(({ label, v }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCashReceived(v)}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        cashReceived === v
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
              </div>
              {changeDue !== null && (
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  cashUnderPaid ? "border border-red-200 bg-red-50" : "border border-green-200 bg-green-50"
                }`}>
                  <span className={`text-sm font-semibold ${cashUnderPaid ? "text-red-700" : "text-green-800"}`}>
                    {isRO ? "Rest de dat" : "Change due"}
                  </span>
                  <span className={`text-xl font-bold tabular-nums ${cashUnderPaid ? "text-red-700" : "text-green-800"}`}>
                    {cashUnderPaid
                      ? `−${money(Math.abs(changeDue))}`
                      : money(changeDue)}
                  </span>
                </div>
              )}
              {cashUnderPaid && (
                <p className="text-xs text-red-600">
                  {isRO ? "Suma primită este insuficientă." : "Amount received is less than the total due."}
                </p>
              )}
            </div>
          )}
          {/* ── Hidden form fields (state → server action) ── */}
          <input type="hidden" name="cash_received" value={isCashSingle && typeof cashReceived === "number" && cashReceived > 0 ? cashReceived.toFixed(2) : ""} />
          <input type="hidden" name="change_due" value={isCashSingle && changeDue !== null && changeDue >= 0 ? changeDue.toFixed(2) : ""} />
          <input type="hidden" name="cart_json" value={JSON.stringify(cart)} />
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <input type="hidden" name="payment_type" value={selectedPaymentType} />
          <input type="hidden" name="discount_pct" value={discountPct} />
          <input type="hidden" name="tip_amount" value={safeTipAmount} />
          <input type="hidden" name="order_type" value={features.orderTypes ? orderType : ""} />
          <input type="hidden" name="table_label" value={features.tableService ? tableLabel : ""} />
          <input type="hidden" name="kitchen_note" value={(features.kitchenDisplay || features.restaurantOrderFlow) ? kitchenNote : ""} />
          <input type="hidden" name="customer_note" value={features.restaurantOrderFlow ? customerNote : ""} />

          {/* ── Notes modal ── */}
          <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>Order notes</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {(features.kitchenDisplay || features.restaurantOrderFlow) && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Kitchen note</label>
                    <textarea
                      value={kitchenNote}
                      onChange={(e) => setKitchenNote(e.target.value)}
                      placeholder="e.g. no nuts, extra shot…"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                )}
                {features.restaurantOrderFlow && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Customer note</label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="e.g. birthday, VIP…"
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
                <Button type="button" onClick={() => setNotesOpen(false)}>Save notes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Order type modal ── */}
          <Dialog open={orderTypeOpen} onOpenChange={setOrderTypeOpen}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>Order type</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {features.orderTypes && (
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-50 p-1">
                    {["dine-in", "takeaway", "delivery"].map((type) => (
                      <button key={type} type="button" onClick={() => setOrderType(type)}
                        className={`rounded-md px-2 py-2 text-xs font-semibold capitalize transition-colors ${orderType === type ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                )}
                {features.tableService && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Table / Seat</label>
                    <Input value={tableLabel} onChange={(e) => setTableLabel(e.target.value)} placeholder="e.g. Table 4, Counter 2" className="h-9" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
                <Button type="button" onClick={() => setOrderTypeOpen(false)}>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Tip modal ── */}
          <Dialog open={tipOpen} onOpenChange={setTipOpen}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>Add a tip</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button key={pct} type="button"
                      onClick={() => setTipAmount(pct === 0 ? 0 : Number((afterDiscount * pct / 100).toFixed(2)))}
                      className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${(pct === 0 && safeTipAmount === 0) || (pct > 0 && Math.abs(safeTipAmount - afterDiscount * pct / 100) < 0.02) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                      {pct === 0 ? "No tip" : `${pct}%`}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Custom amount</label>
                  <Input type="number" min="0" step="0.01" value={tipAmount || ""} onChange={(e) => setTipAmount(Number(e.target.value) || 0)} placeholder="0.00" className="h-9" />
                </div>
                {safeTipAmount > 0 && (
                  <p className="text-center text-sm font-semibold text-green-700">Tip: {money(safeTipAmount)}</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
                <Button type="button" onClick={() => setTipOpen(false)}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Split payment sheet ── */}
          <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Split payment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {splitPayments.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_100px_32px] gap-2">
                    <select value={row.payment_method_id} onChange={(e) => setSplitPayments((rows) => rows.map((r) => r.id === row.id ? { ...r, payment_method_id: e.target.value } : r))}
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm">
                      {paymentMethods.map((m) => <option key={m.id} value={m.id}>{paymentLabel(m.type, m.name)}</option>)}
                    </select>
                    <Input type="number" min="0" step="0.01" value={row.amount || ""} onChange={(e) => setSplitPayments((rows) => rows.map((r) => r.id === row.id ? { ...r, amount: Number(e.target.value) || 0 } : r))} className="h-9" />
                    <button type="button" onClick={() => setSplitPayments((rows) => rows.filter((r) => r.id !== row.id))} className="flex h-9 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500">×</button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => {
                  const first = paymentMethods[0]?.id ?? "";
                  setSplitPayments((rows) => [...rows, { id: (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)), payment_method_id: first, amount: Math.max(0, Number(splitRemaining.toFixed(2))) }]);
                }}>+ Add payment row</Button>
                <div className={`rounded-lg p-2.5 text-xs font-medium ${splitRemaining > 0.01 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                  Total due: {money(totalDue)} · Paid: {money(splitPaid)} ·{" "}
                  {splitRemaining > 0.01 ? `Remaining ${money(splitRemaining)}` : splitRemaining < -0.01 ? `Change ${money(Math.abs(splitRemaining))}` : "Fully paid ✓"}
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">Cancel</Button>} />
                <Button type="button" onClick={() => setSplitOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {saleStatus && (
            <div className={`rounded-lg p-2 text-sm font-medium ${saleStatus.ok ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
              <p>{saleStatus.msg}</p>
              {lastFiscalTxt && (
                <button
                  type="button"
                  onClick={() => downloadFiscalNetTxt(lastFiscalTxt.filename, lastFiscalTxt.content)}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Download TXT again
                </button>
              )}
            </div>
          )}
          <Button ref={chargeRef} type="submit" disabled={!cart.length || !paymentMethods.length || salePending || cashUnderPaid || (features.splitPayments && activeSplitPayments.length > 0 && splitPaid + 0.0001 < totalDue)}
            className="h-14 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed">
            {salePending ? "Processing…" : cashUnderPaid ? (isRO ? "Sumă insuficientă" : "Insufficient cash") : !paymentMethods.length ? "Set up payment methods in Settings" : cart.length === 0 ? "Add items to charge" : `Charge ${money(totalDue)}`}
          </Button>
        </div>
      </form>

      {/* Mobile cart summary bar — visible only on small screens when cart has items */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-3 lg:hidden">
          <div className="flex w-full max-w-sm items-center gap-3 rounded-2xl bg-blue-600 px-4 py-3 shadow-xl">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-blue-200">
                {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}
              </p>
              <p className="text-lg font-bold text-white tabular-nums leading-tight">{money(totalDue)}</p>
            </div>
            <button
              type="button"
              onClick={() => chargeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm active:scale-95"
            >
              Charge →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
