"use client";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { friendlySaleError, paymentTypeLabel } from "@/lib/pos-i18n";
import { PosI18nProvider, usePosI18n, posIntlLocale } from "@/lib/pos-i18n-context";
import {
  readCartBackupFromStorage,
  writeCartBackupToStorage,
  clearCartBackupFromStorage,
} from "@/lib/pos-cart-backup";
import { holdCurrentSale, listHeldSales, resumeHeldSale, type HeldSale } from "@/lib/pos-held-sales";
import {
  clampDiscountPct,
  cartDiscountAmount,
  cartGrossAfter,
  cartGrossBefore,
  lineGrossAfter,
  lineGrossBefore,
  lineVatAmount,
  normalizeCartLines,
  transactionDiscountPct,
  type PosCartLine,
} from "@/lib/pos-line-discount";
import {
  dismissPendingFiscal,
  enqueueOfflineSale,
  formDataToPayload,
  isBrowserOnline,
  listOfflineQueue,
  listPendingSync,
  markOfflineSaleSynced,
  payloadToFormData,
  type QueuedSale,
} from "@/lib/pos-offline-queue";

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
type CartItem = PosCartLine;
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
        className={`flex h-20 w-full shrink-0 items-center justify-center ${cfg.bg} ${cfg.text}`}
        style={cfg.style}
      >
        <PlaceholderIcon icon={cfg.icon} className="h-7 w-7 opacity-40" />
      </div>
    );
  }
  return (
    <div className="h-20 w-full shrink-0 overflow-hidden bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setFailed(true)} />
    </div>
  );
}

function TillDialog({ sessionId, cashDrawerSettings, fiscalNet, isRO = false, currency = "EUR", orgName = "", userName = "" }: { sessionId?: string | null; cashDrawerSettings?: CashDrawerSettings; fiscalNet?: BrowserFiscalConfig | null; isRO?: boolean; currency?: string; orgName?: string; userName?: string }) {
  const { t } = usePosI18n();
  const currencySymbol = currency === "RON" ? "lei" : "€";
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
        setMessage((result.cashierMessage ? `✓ ${result.cashierMessage}` : t.cashMovementSaved) + fnMsg);
      } else {
        setMessage(result.cashierMessage ? `✓ ${result.cashierMessage}` : t.cashMovementSaved);
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
      setMessage(t.somethingWrong);
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!pending) { setOpen(v); if (!v) setMessage(null); } }}>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
        <Banknote className="h-4 w-4" />{t.cashBtn}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{t.cashMovement}</DialogTitle></DialogHeader>
        <form action={handleCashMovement} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <input type="hidden" name="movement_type" value={movementType} />
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => setMovementType("cash_in")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${movementType === "cash_in" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
              {t.cashIn}
            </button>
            <button type="button" onClick={() => setMovementType("cash_out")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${movementType === "cash_out" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
              {t.cashOut}
            </button>
          </div>
          <div>
            <Label>{t.amount} ({currencySymbol})</Label>
            <Input name="amount" type="number" step="0.01" min="0.01" required />
            <p className="mt-1 text-xs text-slate-500">{movementType === "cash_in" ? t.cashInHint : t.cashOutHint}</p>
          </div>
          <div><Label>{t.reason}</Label><Input name="reason" required placeholder={movementType === "cash_in" ? t.extraFloatPlaceholder : t.supplierPaymentPlaceholder} /></div>
          {message && (
            <div className={`rounded-lg p-3 text-sm ${message.startsWith("✓") ? "border border-green-200 bg-green-50 text-green-800" : "border border-red-200 bg-red-50 text-red-700"}`}>
              <p>{message}</p>
              {lastTxt && (
                <button
                  type="button"
                  onClick={() => downloadFiscalNetTxt(lastTxt.filename, lastTxt.content)}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {t.downloadTxtAgain}
                </button>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>{t.cancel}</DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={pending}>
              {pending ? t.recording : t.confirm}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Refund dialog ────────────────────────────────────────────────────────────
function RefundDialog({ recentTransactions, currency = "EUR" }: { recentTransactions: Transaction[]; currency?: string }) {
  const { t } = usePosI18n();
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
        <RefreshCcw className="h-4 w-4" />{t.refund}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{t.refundVoid}</DialogTitle></DialogHeader>
        {done ? (
          <div className="py-6 text-center space-y-2">
            <div className="text-3xl">✅</div>
            <p className="font-semibold text-slate-900">{t.transactionVoided}</p>
          </div>
        ) : (
          <form action={handleVoid} className="space-y-3">
            <select name="transaction_id" required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm">
              <option value="">{t.selectRecentTransaction}</option>
              {recentTransactions.filter((tx) => tx.status === "completed").map((tx) => (
                <option key={tx.id} value={tx.id}>{tx.transaction_number} · {money(Number(tx.total ?? 0), currency)}</option>
              ))}
            </select>
            <Input name="reason" required placeholder={t.reasonRequired} />
            <p className="text-xs text-slate-500">{t.fullRefundOnly}</p>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>{t.cancel}</DialogClose>
              <Button type="submit" variant="outline" className="border-red-300 text-red-700" disabled={pending}>
                {pending ? t.processing : t.refundVoid}
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
  const { t } = usePosI18n();
  const currencySymbol = currency === "RON" ? "lei" : "€";
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
        <LockKeyhole className="h-4 w-4" />{t.closeTill}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{t.closeTill}</DialogTitle></DialogHeader>
        <form action={async (fd: FormData) => {
          await (closePosSession as unknown as (fd: FormData) => Promise<void>)(fd);
        }} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span>{t.openingCash}</span><strong>{money(summary.openingCash, currency)}</strong></div>
            <div className="flex justify-between"><span>{t.cashSales}</span><strong>{money(summary.cashSales, currency)}</strong></div>
            <div className="flex justify-between"><span>{t.cardSales}</span><strong>{money(summary.cardSales, currency)}</strong></div>
            <div className="flex justify-between border-t pt-2"><span className="font-medium">{t.expectedCash}</span><strong className="text-blue-700">{money(summary.expectedCash, currency)}</strong></div>
          </div>
          <div>
            <Label>{t.countedCashLabel} ({currencySymbol})</Label>
            <Input name="counted_cash" type="number" step="0.01" min="0" required />
            <p className="mt-1 text-xs text-slate-500">{t.howMuchInDrawer}</p>
          </div>
          <div><Label>{t.notes}</Label><Input name="notes" /></div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>{t.cancel}</DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{t.closeTill}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function orderTypeLabel(type: string, t: ReturnType<typeof usePosI18n>["t"]): string {
  if (type === "dine-in") return t.dineIn;
  if (type === "takeaway") return t.takeaway;
  if (type === "delivery") return t.delivery;
  return type;
}

// ── Main PosRegister ─────────────────────────────────────────────────────────
function PosRegisterInner({
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
  const initialBackup = useMemo(() => readCartBackupFromStorage(sessionId), [sessionId]);
  const [cart, setCart] = useState<CartItem[]>(() =>
    normalizeCartLines(initialBackup?.cart ?? [], initialBackup?.discountPct ?? 0)
  );
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "");
  const router = useRouter();
  const { locale, t } = usePosI18n();
  const intlLocale = posIntlLocale(locale);
  const money = (v: number) =>
    new Intl.NumberFormat(intlLocale, { style: "currency", currency: currency || "EUR" }).format(v);
  const chargeRef = useRef<HTMLButtonElement>(null);
  const [discountEditId, setDiscountEditId] = useState<string | null>(null);
  const [discountEditValue, setDiscountEditValue] = useState<number | "">("");
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
  const [heldSales, setHeldSales] = useState<HeldSale[]>(() => listHeldSales());
  const [heldOpen, setHeldOpen] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<QueuedSale[]>(() => listOfflineQueue());
  const syncingOfflineRef = useRef(false);

  const pendingSyncSales = useMemo(
    () => offlineQueue.filter((q) => q.status === "pending_sync"),
    [offlineQueue]
  );
  const pendingFiscalSales = useMemo(
    () => offlineQueue.filter((q) => q.status === "pending_fiscal"),
    [offlineQueue]
  );

  useEffect(() => {
    async function flushOfflineQueue() {
      if (!isBrowserOnline() || syncingOfflineRef.current) return;
      const pending = listPendingSync();
      if (!pending.length) return;
      syncingOfflineRef.current = true;
      setSaleStatus({ ok: true, msg: t.offlineSyncing });
      let synced = 0;
      for (const entry of pending) {
        try {
          const res = await completeSaleReturn(payloadToFormData(entry.payload));
          if (res.ok && res.transactionId) {
            markOfflineSaleSynced(entry.id, res.transactionId);
            synced++;
          } else {
            break;
          }
        } catch {
          break;
        }
      }
      syncingOfflineRef.current = false;
      setOfflineQueue(listOfflineQueue());
      if (synced > 0) {
        setSaleStatus({ ok: true, msg: t.offlineSyncDone(synced) });
        setTimeout(() => setSaleStatus(null), 4000);
      }
    }
    window.addEventListener("online", flushOfflineQueue);
    flushOfflineQueue();
    return () => window.removeEventListener("online", flushOfflineQueue);
  }, [t.offlineSyncDone, t.offlineSyncing]);

  function resetCartAfterSale() {
    setCart([]);
    setTipAmount(0);
    setSplitPayments([]);
    setSelectedCustomer(null);
    setCashReceived("");
    clearCartBackupFromStorage();
  }

  const grossTotal = useMemo(() => cartGrossBefore(cart), [cart]);
  const discountAmount = useMemo(() => cartDiscountAmount(cart), [cart]);
  const afterDiscount = useMemo(() => cartGrossAfter(cart), [cart]);
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
  const totalVat = useMemo(() => cart.reduce((s, i) => s + lineVatAmount(i), 0), [cart]);
  const txDiscountPct = useMemo(() => transactionDiscountPct(cart), [cart]);

  const posProducts = useMemo(() =>
    products.filter((p) => p.available_in_pos !== false && p.is_ingredient !== true), [products]);

  const filtered = useMemo(() =>
    posProducts.filter((p) => {
      const matchCat = search.trim() ? true : activeCategory === "all" || p.product_categories?.id === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }), [posProducts, activeCategory, search]);

  const activeCategoryIds = useMemo(() => new Set(posProducts.map((p) => p.product_categories?.id).filter(Boolean)), [posProducts]);
  const visibleCategories = categories.filter((c) => activeCategoryIds.has(c.id));
  const shownTransactions = recentTransactions.filter((tx) =>
    [tx.transaction_number, tx.customer_name, tx.payment_methods?.name].filter(Boolean).join(" ").toLowerCase().includes(txSearch.toLowerCase())
  ).slice(0, 12);
  const shownCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q) || (c.email ?? "").toLowerCase().includes(q);
  }).slice(0, 12);
  const uniformCartDiscount = useMemo(() => {
    if (!cart.length) return 0;
    const pcts = cart.map((i) => i.discount_pct ?? 0);
    return pcts.every((p) => p === pcts[0]) ? pcts[0] : null;
  }, [cart]);

  function setItemDiscountPct(productId: string, pct: number) {
    setCart((items) =>
      syncSgr(items.map((i) =>
        i.product_id === productId ? { ...i, discount_pct: clampDiscountPct(pct) } : i
      ))
    );
  }

  function applyDiscountToAllCurrentItems(pct: number) {
    const clamped = clampDiscountPct(pct);
    setCart((items) => syncSgr(items.map((i) => ({ ...i, discount_pct: clamped }))));
  }

  function openItemOptions(productId: string) {
    const item = cart.find((i) => i.product_id === productId);
    if (!item) return;
    setDiscountEditId(productId);
    setDiscountEditValue(item.discount_pct && item.discount_pct > 0 ? item.discount_pct : "");
  }

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
      discount_pct:         0,
    }];
  };

  const addToCart = (p: Product) =>
    setCart((items) => {
      const ex = items.find((i) => i.product_id === p.id);
      const vatRate = Number(p.vat_rate ?? 0);
      const updated = ex
        ? items.map((i) => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: Number(p.sale_price), vat_rate: vatRate, fiscalnet_vat_group: vatRateGroupMap[vatRate] ?? null, discount_pct: 0 }];
      return syncSgr(updated);
    });

  const setQty = (id: string, qty: number) =>
    setCart((items) => {
      const updated = items.flatMap((i) => i.product_id === id ? qty <= 0 ? [] : [{ ...i, quantity: qty }] : [i]);
      return syncSgr(updated);
    });

  const vatLabel = isRO ? t.inclTva : t.inclVat;
  const chargeDisabled =
    !cart.length ||
    !paymentMethods.length ||
    salePending ||
    cashUnderPaid ||
    (features.splitPayments && activeSplitPayments.length > 0 && splitPaid + 0.0001 < totalDue);

  return (
    <div className="flex-1 lg:flex lg:overflow-hidden" style={{minHeight: 0}}>
      {/* Left: Products column */}
      <div className="min-w-0 lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden" style={{display: "flex", flexDirection: "column", overflow: "hidden", flex: "1 1 auto", minWidth: 0}}>
        {/* Products toolbar: categories, search */}
        <div className="space-y-2 p-2 sm:p-3 lg:px-4 lg:pt-3 lg:pb-2 lg:flex-none" style={{flexShrink: 0}}>
        <div className="-mx-2 flex gap-1.5 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button onClick={() => setActiveCategory("all")}
            className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${activeCategory === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-slate-50"}`}>
            {t.allCategories}
          </button>
          {visibleCategories.map((c) => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)}
              className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${activeCategory === c.id ? "text-white border-transparent" : "bg-white hover:bg-slate-50"}`}
              style={activeCategory === c.id ? { backgroundColor: c.color ?? "#2563eb" } : undefined}>
              {c.name}
            </button>
          ))}
        </div>
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchProducts} className="max-w-none" aria-label={t.searchProducts} />
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
              {posProducts.length === 0 ? t.noProductsYet : t.noProductsMatch}
            </div>
          )}
        </div>
        </div>
        {/* pos-utility-bar */}
        <div className="border-t border-slate-200 bg-white px-3 py-2 sm:px-4 overflow-x-auto" style={{WebkitOverflowScrolling: "touch", flexShrink: 0}}>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11 px-4 shrink-0" onClick={() => setCart([])}>{t.newSale}</Button>
            <Sheet>
              <SheetTrigger render={<Button type="button" variant="outline" className="h-11 px-4 shrink-0" />}>
                <Users className="h-4 w-4" />{t.customers}
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader><SheetTitle>{t.customers}</SheetTitle></SheetHeader>
                <div className="space-y-4 overflow-y-auto px-4 pb-4">
                  <Input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder={t.searchCustomer} aria-label={t.searchCustomer} />
                  <div className="space-y-2">
                    {shownCustomers.map((c) => (
                      <button key={c.id} type="button" onClick={() => setSelectedCustomer(c)} className="w-full rounded-lg border p-3 text-left hover:bg-slate-50">
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-slate-500">{[c.phone, c.email].filter(Boolean).join(" · ") || t.noContact}</p>
                      </button>
                    ))}
                  </div>
                  <form action={addCustomerFromPos as unknown as (fd: FormData) => Promise<void>} className="space-y-3 rounded-lg border p-3">
                    <p className="text-sm font-medium">{t.quickAddCustomer}</p>
                    <Input name="name" required placeholder={t.searchCustomer} />
                    <Input name="phone" placeholder="Phone" />
                    <Input name="email" type="email" placeholder="Email" />
                    <Button type="submit" size="sm"><UserPlus className="h-4 w-4" />{t.addCustomer}</Button>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger render={<Button type="button" variant="outline" className="h-11 px-4 shrink-0" />}>
                <ReceiptText className="h-4 w-4" />{t.orders}
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl">
                <SheetHeader><SheetTitle>{t.ordersTransactions}</SheetTitle></SheetHeader>
                <div className="space-y-3 overflow-y-auto px-4 pb-4">
                  <Input value={txSearch} onChange={(e) => setTxSearch(e.target.value)} placeholder={t.searchTransaction} aria-label={t.searchTransaction} />
                  {shownTransactions.map((tx) => (
                    <div key={tx.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <strong>{tx.transaction_number}</strong>
                        <span className="font-medium">{money(Number(tx.total ?? 0))}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.customer_name || t.walkIn} · {tx.payment_methods?.name ? paymentTypeLabel(tx.payment_methods.type ?? "other", tx.payment_methods.name, locale) : t.paymentGeneric}</p>
                      <a className="text-blue-600 hover:underline text-xs mt-2 inline-block" href={`/app/transactions/${tx.id}`}>{t.viewReceipt}</a>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            <RefundDialog recentTransactions={recentTransactions} currency={currency} />
            <TillDialog sessionId={sessionId} cashDrawerSettings={cashDrawerSettings} fiscalNet={fiscalNet} isRO={isRO} currency={currency} orgName={orgName} userName={userName}/>
            <CloseTillDialog sessionId={sessionId} summary={summary} fiscalNet={fiscalNet} currency={currency} orgName={orgName} userName={userName}/>
            {cart.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4 shrink-0"
                onClick={() => {
                  const held = holdCurrentSale({ cart, customerName: selectedCustomer?.name });
                  if (held) { setCart([]); setHeldSales(listHeldSales()); }
                }}
              >
                {t.holdOrder}
              </Button>
            )}
            {heldSales.length > 0 && (
              <Button type="button" variant="outline" className="h-11 px-4 shrink-0" onClick={() => setHeldOpen(true)}>
                {t.heldOrders} ({heldSales.length})
              </Button>
            )}
            {isRO && fiscalNet?.enabled && (
          <Dialog open={zReportOpen} onOpenChange={setZReportOpen}>
            <DialogTrigger render={
              <Button type="button" variant="outline" className={`h-10 px-4 ${zReportDone ? "border-green-300 text-green-700" : ""}`} disabled={zReportDone || zReportPending} />
            }>
              {zReportPending ? t.zReportProcessing : zReportDone ? t.zReportDone : t.zReport}
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>{t.zReportConfirmTitle}</DialogTitle></DialogHeader>
              <p className="text-sm text-slate-600">{t.zReportConfirmBody}</p>
              {fiscalNet.mockMode && (
                <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">{t.zReportMockMode}</p>
              )}
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline" />}>{t.cancel}</DialogClose>
                <Button type="button" className="bg-red-600 hover:bg-red-700 text-white" disabled={zReportPending} onClick={async () => {
                  setZReportPending(true);
                  setZReportOpen(false);
                  try {
                    const fd = new FormData();
                    if (sessionId) fd.set("session_id", sessionId);
                    const res = await (runZReport as unknown as (fd: FormData) => Promise<FiscalDownloadPayload>)(fd);
                    if (res.status === "browser_api_pending" && fiscalNet) {
                      const fnRes = await fiscalBrowserZReport(fiscalNet);
                      setZReportDone(true);
                      setSaleStatus({ ok: fnRes.ok, msg: fnRes.ok ? t.zReportSent(fnRes.message) : `FiscalNet: ${fnRes.message}` });
                    } else {
                      const downloaded = res.ok ? await downloadFiscalPayload(res, "z_report") : false;
                      if (res.filename && res.content) setLastFiscalTxt({ filename: res.filename, content: res.content });
                      if (res.ok) setZReportDone(true);
                      setSaleStatus({ ok: res.ok, msg: downloaded ? t.zReportDownloaded : res.message });
                    }
                    setTimeout(() => setSaleStatus(null), 4000);
                  } catch (e) {
                    setSaleStatus({ ok: false, msg: e instanceof Error ? e.message : t.zReportError });
                    setTimeout(() => setSaleStatus(null), 4000);
                  } finally {
                    setZReportPending(false);
                  }
                }}>{t.zReportConfirmBtn}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart + payment (one screen) */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (salePending || !cart.length) return;
        setSalePending(true);
        setSaleStatus(null);
        setLastFiscalTxt(null);
          const fd = new FormData(e.currentTarget);
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
          if (!isBrowserOnline()) {
            enqueueOfflineSale(
              formDataToPayload(fd),
              t.offlineQueueLabel(cart.length, money(totalDue))
            );
            resetCartAfterSale();
            setOfflineQueue(listOfflineQueue());
            setSaleStatus({ ok: true, msg: t.offlineQueued });
            setSalePending(false);
            return;
          }
          writeCartBackupToStorage({
            cart,
            sessionId: sessionId ?? "",
            paymentMethodId,
            cashReceived,
            discountPct: txDiscountPct,
          });
          const res = await completeSaleReturn(fd);
          if (!res.ok) {
            setSaleStatus({ ok: false, msg: friendlySaleError(res.error, locale) });
            setSalePending(false);
            return;
          }
          // FiscalNet receipt — called from browser → localhost:65400
          if (res.fiscalApiPending && fiscalNet) {
            const fnRes = await fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType);
            if (fnRes.filename && fnRes.content) setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
            console.info("[FiscalNet] receipt browser result", { ok: fnRes.ok, message: fnRes.message, mode: fiscalNet.connectionMode });
            setSaleStatus({ ok: fnRes.ok, msg: fnRes.ok ? t.saleSavedFiscal(money(res.total), fnRes.message) : t.saleSavedFiscalWarn(fnRes.message), transactionId: res.transactionId });
          } else {
            const mockActive = fiscalNet?.enabled && fiscalNet?.mockMode;
            const saleMsg = mockActive ? t.saleSavedMock(money(res.total)) : t.saleSaved(money(res.total));
            setSaleStatus({ ok: true, msg: saleMsg, transactionId: res.transactionId });
          }
          setCart([]);
          setTipAmount(0);
          setSplitPayments([]);
          setSelectedCustomer(null);
          setCashReceived("");
          setSalePending(false);
          clearCartBackupFromStorage();
          // Redirect to transaction page after brief success display
          setTimeout(() => {
            setSaleStatus(null);
            router.push(`/app/transactions/${res.transactionId}?recorded=1${res.cashSale ? "&drawer=cash_sale" : ""}`);
          }, res.fiscalApiPending ? 2500 : 1200);
        } catch (err) {
          const rawMsg = err instanceof Error ? err.message : "";
          // Detect framework/network errors (build mismatch, dropped connection, etc.)
          const isFrameworkError = /unexpected response|from the server|failed to fetch|networkerror|load failed|fetch/i.test(rawMsg);
          const safeMsg = isFrameworkError ? t.appUpdated : t.saleNotCompleted;
          setSaleStatus({ ok: false, msg: safeMsg });
          setSalePending(false);
        }
      }} className="flex min-h-[28rem] flex-col rounded-xl border border-slate-200 bg-white shadow-sm lg:min-h-0 lg:w-[380px] lg:flex-none lg:overflow-hidden lg:rounded-none lg:border-0 lg:border-l lg:shadow-none">
        <div className="px-4 pt-3 pb-1 flex items-center justify-between shrink-0 gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.order}</span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
          {(pendingSyncSales.length > 0 || pendingFiscalSales.length > 0) && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              {pendingSyncSales.length > 0 ? t.offlinePendingSync(pendingSyncSales.length) : t.offlinePendingFiscal(pendingFiscalSales.length)}
            </span>
          )}
          {cart.length > 0 && (
              <button type="button" onClick={() => setCart([])} className="text-xs text-slate-400 hover:text-red-500">{t.clearAll}</button>
          )}
          </div>
        </div>
        {(pendingSyncSales.length > 0 || pendingFiscalSales.length > 0) && (
          <div className="mx-4 mb-2 space-y-1.5 shrink-0">
            {pendingSyncSales.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                <span className="font-semibold">{t.offlinePendingSyncRow}</span>
                <span className="text-amber-800"> — {entry.label}</span>
              </div>
            ))}
            {pendingFiscalSales.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-900">
                <div className="min-w-0">
                  <span className="font-semibold">{t.offlinePendingFiscalRow}</span>
                  <span className="text-orange-800"> — {entry.label}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {entry.transactionId && (
                    <a
                      href={`/app/transactions/${entry.transactionId}`}
                      className="font-medium text-orange-700 underline hover:text-orange-900"
                    >
                      {t.offlineViewReceipt}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      dismissPendingFiscal(entry.id);
                      setOfflineQueue(listOfflineQueue());
                    }}
                    className="rounded-md border border-orange-300 bg-white px-2 py-0.5 font-medium text-orange-800 hover:bg-orange-100"
                  >
                    {t.offlineFiscalDismiss}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto space-y-1.5 px-4 pb-2" style={{minHeight: 0, WebkitOverflowScrolling: "touch"}}>
          {cart.map((item) => {
            const linePct = item.discount_pct ?? 0;
            const lineTotal = lineGrossAfter(item);
            const lineList = lineGrossBefore(item);
            return (
            <div key={item.product_id} className="flex flex-col gap-1 rounded-xl border border-transparent bg-white/80 px-2 py-2 transition-colors hover:border-blue-100 hover:bg-blue-50/40">
              <div className="flex items-center gap-2">
              <button type="button" onClick={() => openItemOptions(item.product_id)} className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-slate-900 truncate">{item.product_name}</p>
                {linePct > 0 && (
                  <span className="inline-block mt-0.5 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{t.discountBadge(linePct)}</span>
                )}
              </button>
              <div className="flex items-center gap-1">
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity - 1); }} aria-label={t.decreaseQty} className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">−</button>
                <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity + 1); }} aria-label={t.increaseQty} className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300">+</button>
              </div>
              <div className="text-right min-w-[4.5rem]">
                {linePct > 0 && <p className="text-[10px] text-slate-400 line-through tabular-nums">{money(lineList)}</p>}
                <p className="text-sm font-bold tabular-nums text-slate-950">{money(lineTotal)}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, 0); }} aria-label={t.removeItem} className="flex h-9 w-9 items-center justify-center rounded-lg text-sm text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200">×</button>
              </div>
            </div>
          );})}
          {!cart.length && <p className="py-10 text-center text-sm text-slate-300">{t.tapToAdd}</p>}
        </div>
        <div className="border-t border-slate-100 px-4 pt-4 pb-4 space-y-3 shrink-0">
          {(features.tips || features.splitPayments || features.kitchenDisplay || features.restaurantOrderFlow) && cart.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(features.kitchenDisplay || features.restaurantOrderFlow) && (
                <button type="button" onClick={() => setNotesOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${(kitchenNote || customerNote) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  📝 {t.notes}{(kitchenNote || customerNote) ? " ●" : ""}
                </button>
              )}
              {features.tips && (
                <button type="button" onClick={() => setTipOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${safeTipAmount > 0 ? "border-green-300 bg-green-50 text-green-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  💰 {safeTipAmount > 0 ? `${t.tip} ${money(safeTipAmount)}` : t.tip}
                </button>
              )}
              {features.splitPayments && (
                <button type="button" onClick={() => setSplitOpen(true)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${activeSplitPayments.length > 0 ? "border-purple-300 bg-purple-50 text-purple-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>
                  ⚡ {activeSplitPayments.length > 0 ? `${t.splitPayment} (${activeSplitPayments.length})` : t.splitPayment}
                </button>
              )}
            </div>
          )}
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 shrink-0">{t.discountPct}</span>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={uniformCartDiscount === null ? "" : uniformCartDiscount || ""}
                onChange={(e) => applyDiscountToAllCurrentItems(Number(e.target.value) || 0)}
                placeholder="0"
                aria-label={t.discountPctAria}
                className="h-8 w-16 rounded-lg border border-slate-200 px-2 text-sm text-right"
              />
              {discountAmount > 0 && <span className="text-xs text-blue-600 font-medium">−{money(discountAmount)}</span>}
              {uniformCartDiscount === null && cart.some((i) => (i.discount_pct ?? 0) > 0) && (
                <span className="text-[10px] text-slate-400">Mixed</span>
              )}
            </div>
          )}
          {discountAmount > 0 && <div className="flex justify-between text-xs text-slate-500"><span>{t.subtotal}</span><span>{money(grossTotal)}</span></div>}
          {totalVat > 0.01 && <div className="flex justify-between text-xs text-slate-400"><span>{vatLabel}</span><span>{money(totalVat)}</span></div>}
          {safeTipAmount > 0 && <div className="flex justify-between text-xs text-green-700"><span>{t.tip}</span><span>{money(safeTipAmount)}</span></div>}
          <div className="flex justify-between items-baseline">
            <span className="text-base font-semibold text-slate-700">{t.total}</span>
            <span className="text-3xl font-bold text-slate-950 tabular-nums">{money(totalDue)}</span>
          </div>
          {(!features.splitPayments || activeSplitPayments.length === 0) && cart.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {paymentMethods.map((m) => {
                const selected = paymentMethodId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethodId(m.id);
                      if (m.type !== "cash") setCashReceived("");
                    }}
                    className={`min-h-12 rounded-lg border px-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
                  >
                    {paymentTypeLabel(m.type, m.name, locale)}
                  </button>
                );
              })}
            </div>
          )}
          {features.splitPayments && activeSplitPayments.length > 0 && (
            <button type="button" onClick={() => setSplitOpen(true)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition-colors ${splitRemaining > 0.01 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-300 bg-green-50 text-green-800"}`}>
              <span className="font-semibold">{t.splitPayment}</span>
              {" · "}{t.splitPaid(money(splitPaid))}
              {splitRemaining > 0.01 ? ` · ${t.splitRemaining(money(splitRemaining))}` : ` · ${t.splitFullyPaid}`}
              <span className="float-right text-slate-500">{t.edit} ›</span>
            </button>
          )}
          {features.splitPayments && activeSplitPayments.length === 0 && cart.length > 0 && (
            <button type="button" onClick={() => setSplitOpen(true)}
              className="w-full rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
              {t.addSplitPayment}
            </button>
          )}
          {isCashSingle && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <label htmlFor="cash-received-input" className="shrink-0 text-sm font-medium text-slate-700">
                  {t.cashReceived}
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
              <div className="flex flex-wrap gap-1.5">
                {([
                  { label: t.exact, v: Number(totalDue.toFixed(2)) },
                  { label: t.quickCashAmount(5, currency), v: Math.ceil(totalDue / 5) * 5 },
                  { label: t.quickCashAmount(10, currency), v: Math.ceil(totalDue / 10) * 10 },
                  { label: t.quickCashAmount(20, currency), v: Math.ceil(totalDue / 20) * 20 },
                ] as { label: string; v: number }[])
                  .filter((btn, i, arr) => arr.findIndex((b) => b.v === btn.v) === i)
                  .map(({ label, v }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCashReceived(v)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
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
                    {t.changeDue}
                  </span>
                  <span className={`text-lg font-bold tabular-nums ${cashUnderPaid ? "text-red-700" : "text-green-800"}`}>
                    {cashUnderPaid ? `−${money(Math.abs(changeDue))}` : money(changeDue)}
                  </span>
                </div>
              )}
              {cashUnderPaid && (
                <p className="text-xs text-red-600">{t.cashUnderpaidMsg}</p>
              )}
            </div>
          )}
          {saleStatus && (
            <div className={`rounded-lg p-3 text-sm font-medium ${saleStatus.ok ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
              <p>{saleStatus.msg}</p>
              {lastFiscalTxt && (
                <button
                  type="button"
                  onClick={() => downloadFiscalNetTxt(lastFiscalTxt.filename, lastFiscalTxt.content)}
                  className="mt-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {t.downloadTxtAgain}
                </button>
              )}
            </div>
          )}
          <Button
            ref={chargeRef}
            type="submit"
            disabled={chargeDisabled}
            className="h-14 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {salePending
              ? t.processing
              : cashUnderPaid
                ? t.insufficientCash
                : !paymentMethods.length
                  ? t.setupPaymentMethods
                  : cart.length === 0
                    ? t.addItems
                    : `${t.validateCharge} ${money(totalDue)}`}
          </Button>
        </div>

          <input type="hidden" name="customer_name" value={selectedCustomer?.name ?? ""} />
          <input type="hidden" name="payment_method_id" value={paymentMethodId} />
          <input type="hidden" name="cash_received" value={isCashSingle && typeof cashReceived === "number" && cashReceived > 0 ? cashReceived.toFixed(2) : ""} />
          <input type="hidden" name="change_due" value={isCashSingle && changeDue !== null && changeDue >= 0 ? changeDue.toFixed(2) : ""} />
          <input type="hidden" name="cart_json" value={JSON.stringify(cart)} />
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <input type="hidden" name="payment_type" value={selectedPaymentType} />
          <input type="hidden" name="discount_pct" value={txDiscountPct} />
          <input type="hidden" name="tip_amount" value={safeTipAmount} />
          <input type="hidden" name="order_type" value={features.orderTypes ? orderType : ""} />
          <input type="hidden" name="table_label" value={features.tableService ? tableLabel : ""} />
          <input type="hidden" name="kitchen_note" value={(features.kitchenDisplay || features.restaurantOrderFlow) ? kitchenNote : ""} />
          <input type="hidden" name="customer_note" value={features.restaurantOrderFlow ? customerNote : ""} />

          {/* ── Notes modal ── */}
          <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>{t.orderNotes}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {(features.kitchenDisplay || features.restaurantOrderFlow) && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t.kitchenNote}</label>
                    <textarea
                      value={kitchenNote}
                      onChange={(e) => setKitchenNote(e.target.value)}
                      placeholder={t.kitchenNotePlaceholder}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                )}
                {features.restaurantOrderFlow && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t.customerNote}</label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder={t.customerNotePlaceholder}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">{t.cancel}</Button>} />
                <Button type="button" onClick={() => setNotesOpen(false)}>{t.saveNotes}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Order type modal ── */}
          <Dialog open={orderTypeOpen} onOpenChange={setOrderTypeOpen}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>{t.orderType}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {features.orderTypes && (
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-50 p-1">
                    {(["dine-in", "takeaway", "delivery"] as const).map((type) => (
                      <button key={type} type="button" onClick={() => setOrderType(type)}
                        className={`rounded-md px-2 py-2 text-xs font-semibold transition-colors ${orderType === type ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}>
                        {orderTypeLabel(type, t)}
                      </button>
                    ))}
                  </div>
                )}
                {features.tableService && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{t.tableSeat}</label>
                    <Input value={tableLabel} onChange={(e) => setTableLabel(e.target.value)} placeholder={t.tablePlaceholder} className="h-9" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">{t.cancel}</Button>} />
                <Button type="button" onClick={() => setOrderTypeOpen(false)}>{t.confirm}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Tip modal ── */}
          <Dialog open={tipOpen} onOpenChange={setTipOpen}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>{t.addTip}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button key={pct} type="button"
                      onClick={() => setTipAmount(pct === 0 ? 0 : Number((afterDiscount * pct / 100).toFixed(2)))}
                      className={`rounded-lg border py-2 text-xs font-semibold transition-colors ${(pct === 0 && safeTipAmount === 0) || (pct > 0 && Math.abs(safeTipAmount - afterDiscount * pct / 100) < 0.02) ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
                      {pct === 0 ? t.noTip : `${pct}%`}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">{t.customAmount}</label>
                  <Input type="number" min="0" step="0.01" value={tipAmount || ""} onChange={(e) => setTipAmount(Number(e.target.value) || 0)} placeholder="0.00" className="h-9" />
                </div>
                {safeTipAmount > 0 && (
                  <p className="text-center text-sm font-semibold text-green-700">{t.tipAmountLabel(money(safeTipAmount))}</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">{t.cancel}</Button>} />
                <Button type="button" onClick={() => setTipOpen(false)}>{t.apply}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Split payment sheet ── */}
          <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{t.splitPayment}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {splitPayments.map((row) => (
                  <div key={row.id} className="grid grid-cols-[1fr_100px_32px] gap-2">
                    <select value={row.payment_method_id} onChange={(e) => setSplitPayments((rows) => rows.map((r) => r.id === row.id ? { ...r, payment_method_id: e.target.value } : r))}
                      className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm">
                      {paymentMethods.map((m) => <option key={m.id} value={m.id}>{paymentTypeLabel(m.type, m.name, locale)}</option>)}
                    </select>
                    <Input type="number" min="0" step="0.01" value={row.amount || ""} onChange={(e) => setSplitPayments((rows) => rows.map((r) => r.id === row.id ? { ...r, amount: Number(e.target.value) || 0 } : r))} className="h-9" />
                    <button type="button" onClick={() => setSplitPayments((rows) => rows.filter((r) => r.id !== row.id))} className="flex h-9 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-500">×</button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => {
                  const first = paymentMethods[0]?.id ?? "";
                  setSplitPayments((rows) => [...rows, { id: (crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36)), payment_method_id: first, amount: Math.max(0, Number(splitRemaining.toFixed(2))) }]);
                }}>{t.addPaymentRow}</Button>
                <div className={`rounded-lg p-2.5 text-xs font-medium ${splitRemaining > 0.01 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                  {t.totalDueLabel}: {money(totalDue)} · {t.paidLabel}: {money(splitPaid)} ·{" "}
                  {splitRemaining > 0.01 ? t.splitRemaining(money(splitRemaining)) : splitRemaining < -0.01 ? `${t.changeLabel} ${money(Math.abs(splitRemaining))}` : t.splitFullyPaid}
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">{t.cancel}</Button>} />
                <Button type="button" onClick={() => setSplitOpen(false)}>{t.done}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Item options (qty + discount) ── */}
          <Dialog open={discountEditId !== null} onOpenChange={(open) => { if (!open) setDiscountEditId(null); }}>
            <DialogContent className="sm:max-w-xs">
              <DialogHeader><DialogTitle>{discountEditId ? cart.find((i) => i.product_id === discountEditId)?.product_name ?? t.itemDiscount : t.itemDiscount}</DialogTitle></DialogHeader>
              {discountEditId && (() => {
                const item = cart.find((i) => i.product_id === discountEditId);
                if (!item) return null;
                const preview = lineGrossAfter({ ...item, discount_pct: Number(discountEditValue) || 0 });
                return (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-slate-500">Qty</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <button type="button" onClick={() => setQty(item.product_id, item.quantity - 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold">−</button>
                    <span className="w-10 text-center text-lg font-bold tabular-nums">{item.quantity}</span>
                    <button type="button" onClick={() => setQty(item.product_id, item.quantity + 1)} className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold">+</button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="item-discount-pct">{t.discountPct}</Label>
                  <Input
                    id="item-discount-pct"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={discountEditValue}
                    onChange={(e) => {
                      const v = e.target.value === "" ? "" : Number(e.target.value) || 0;
                      setDiscountEditValue(v);
                      setItemDiscountPct(item.product_id, Number(v) || 0);
                    }}
                    className="mt-1 text-right text-lg font-bold"
                  />
                  <p className="mt-1 text-sm text-slate-500">{t.lineAfterDiscount}: {money(preview)}</p>
                </div>
              </div>
                );
              })()}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => { if (discountEditId) setItemDiscountPct(discountEditId, 0); setDiscountEditId(null); }}>{t.clearDiscount}</Button>
                <Button type="button" variant="destructive" onClick={() => { if (discountEditId) setQty(discountEditId, 0); setDiscountEditId(null); }}>{t.removeItem}</Button>
                <Button type="button" onClick={() => setDiscountEditId(null)}>{t.done}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* ── Held orders ── */}
          <Dialog open={heldOpen} onOpenChange={setHeldOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>{t.heldOrders}</DialogTitle></DialogHeader>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {heldSales.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">{t.noHeldOrders}</p>
                )}
                {heldSales.map((held) => (
                  <div key={held.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{held.label}</p>
                      <p className="text-xs text-slate-500">
                        {t.payItems(held.cart.reduce((s, i) => s + i.quantity, 0))}
                        {held.cart.some((i) => (i.discount_pct ?? 0) > 0)
                          ? ` · ${t.discountBadge(Math.max(...held.cart.map((i) => i.discount_pct ?? 0)))}`
                          : held.discountPct && held.discountPct > 0
                            ? ` · −${held.discountPct}%`
                            : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const resumed = resumeHeldSale(held.id);
                        if (resumed) {
                          setCart(resumed.cart);
                          setHeldSales(listHeldSales());
                          setHeldOpen(false);
                        }
                      }}
                    >
                      {t.resumeOrder}
                    </Button>
                  </div>
                ))}
              </div>
              {(pendingSyncSales.length > 0 || pendingFiscalSales.length > 0) && (
                <div className="mt-2 space-y-1.5 border-t pt-3">
                  {pendingSyncSales.map((entry) => (
                    <p key={entry.id} className="rounded bg-amber-50 p-2 text-xs text-amber-800">
                      {t.offlinePendingSyncRow}: {entry.label}
                    </p>
                  ))}
                  {pendingFiscalSales.map((entry) => (
                    <p key={entry.id} className="rounded bg-orange-50 p-2 text-xs text-orange-800">
                      {t.offlinePendingFiscalRow}: {entry.label}
                    </p>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
      </form>
    </div>
  );
}

export function PosRegister(props: Parameters<typeof PosRegisterInner>[0]) {
  return (
    <PosI18nProvider orgIsRO={props.isRO ?? false}>
      <PosRegisterInner {...props} />
    </PosI18nProvider>
  );
}
