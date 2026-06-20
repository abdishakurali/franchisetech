"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { addCustomerFromPos, closePosSession, completeSaleReturn, posCashMovement, voidTransaction } from "@/app/actions/kitchenops";
import { runZReport } from "@/app/actions/fiscalnet";
import { fiscalBrowserReceipt, fiscalBrowserCashIn, fiscalBrowserCashOut, fiscalBrowserZReport, downloadFiscalNetTxt, type BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { isFiscalNetClientActive } from "@/lib/fiscalnet/eligibility";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Banknote, ChevronDown, Coffee, Droplets, LayoutGrid, LockKeyhole, MoreHorizontal, Package, Percent, Plus, RefreshCcw, StickyNote, UserPlus, Utensils, Zap } from "lucide-react";
import { openCashDrawer, type CashDrawerSettings } from "@/lib/cash-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FIRST_SALE_DONE_KEY } from "@/lib/onboarding/demo-products";
import { FirstSaleCelebration } from "@/components/app/FirstSaleCelebration";
import { PosQuickAddProduct } from "@/components/app/PosQuickAddProduct";
import { PosQuickAccessSheet } from "@/components/app/PosQuickAccessSheet";

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
type Transaction = { id: string; transaction_number: string; customer_name: string | null; sold_at: string | null; total: number | string; discount_total?: number | string | null; status: string; payment_methods?: { name?: string | null; type?: string | null } | null };
type CashOperation = {
  id: string;
  movement_type: "cash_in" | "cash_out";
  amount: number;
  reason: string | null;
  performedAt: string | null;
};
type PosSummary = {
  openingCash: number;
  cashSales: number;
  cardSales: number;
  expectedCash: number;
  txCount: number;
  topProduct: string | null;
  cashInTotal: number;
  cashOutTotal: number;
  cashOperations: CashOperation[];
};
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

function pickDefaultPaymentId(methods: PaymentMethod[]) {
  return methods.find((m) => m.type === "card")?.id ?? methods[0]?.id ?? "";
}

function TillDialog({
  sessionId,
  cashDrawerSettings,
  fiscalNet,
  isRO = false,
  currency = "EUR",
  orgName = "",
  userName = "",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: {
  sessionId?: string | null;
  cashDrawerSettings?: CashDrawerSettings;
  fiscalNet?: BrowserFiscalConfig | null;
  isRO?: boolean;
  currency?: string;
  orgName?: string;
  userName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const { t } = usePosI18n();
  const currencySymbol = currency === "RON" ? "lei" : "€";
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
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
      {showTrigger ? (
        <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
          <Banknote className="h-4 w-4" />{t.cashBtn}
        </DialogTrigger>
      ) : null}
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
function RefundDialog({
  recentTransactions,
  currency = "EUR",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: {
  recentTransactions: Transaction[];
  currency?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const { t } = usePosI18n();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
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
      {showTrigger ? (
        <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
          <RefreshCcw className="h-4 w-4" />{t.refund}
        </DialogTrigger>
      ) : null}
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
function CloseTillDialog({
  sessionId,
  summary,
  fiscalNet,
  currency = "EUR",
  orgName = "",
  userName = "",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
}: {
  sessionId?: string | null;
  summary: PosSummary;
  fiscalNet?: BrowserFiscalConfig | null;
  currency?: string;
  orgName?: string;
  userName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}) {
  const { locale, t } = usePosI18n();
  const intlLocale = posIntlLocale(locale);
  const currencySymbol = currency === "RON" ? "lei" : "€";
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <DialogTrigger render={<Button type="button" variant="outline" className="h-11 px-4" />}>
          <LockKeyhole className="h-4 w-4" />{t.closeTill}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t.closeTill}</DialogTitle></DialogHeader>
        <form action={async (fd: FormData) => {
          await (closePosSession as unknown as (fd: FormData) => Promise<void>)(fd);
        }} className="space-y-3">
          <input type="hidden" name="session_id" value={sessionId ?? ""} />
          <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
            <div className="flex justify-between"><span>{t.openingCash}</span><strong>{money(summary.openingCash, currency)}</strong></div>
            {summary.cashInTotal > 0 && (
              <div className="flex justify-between text-green-700"><span>{t.cashInTotal}</span><strong>{money(summary.cashInTotal, currency)}</strong></div>
            )}
            {summary.cashOutTotal > 0 && (
              <div className="flex justify-between text-red-600"><span>{t.cashOutTotal}</span><strong>{money(summary.cashOutTotal, currency)}</strong></div>
            )}
            <div className="flex justify-between"><span>{t.cashSales}</span><strong>{money(summary.cashSales, currency)}</strong></div>
            <div className="flex justify-between"><span>{t.cardSales}</span><strong>{money(summary.cardSales, currency)}</strong></div>
            <div className="flex justify-between border-t pt-2"><span className="font-medium">{t.expectedCash}</span><strong className="text-blue-700">{money(summary.expectedCash, currency)}</strong></div>
          </div>
          {summary.cashOperations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t.cashOperations}</p>
              <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white">
                {summary.cashOperations.map((op) => (
                  <div key={op.id} className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium ${op.movement_type === "cash_in" ? "text-green-700" : "text-red-600"}`}>
                        {op.movement_type === "cash_in" ? `+ ${t.cashIn}` : `− ${t.cashOut}`}
                      </p>
                      <p className="truncate text-xs text-slate-500">{op.reason || "—"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold tabular-nums text-slate-900">{money(op.amount, currency)}</p>
                      {op.performedAt && (
                        <p className="text-[10px] text-slate-400">
                          {new Intl.DateTimeFormat(intlLocale, { timeStyle: "short" }).format(new Date(op.performedAt))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
  canManage = false,
  defaultVatRate = 0,
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
  canManage?: boolean;
  defaultVatRate?: number;
}) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const initialBackup = useMemo(() => readCartBackupFromStorage(sessionId), [sessionId]);
  const [cart, setCart] = useState<CartItem[]>(() =>
    normalizeCartLines(initialBackup?.cart ?? [], initialBackup?.discountPct ?? 0)
  );
  const [paymentMethodId, setPaymentMethodId] = useState(() => pickDefaultPaymentId(paymentMethods));
  const { locale, t } = usePosI18n();
  const intlLocale = posIntlLocale(locale);
  const money = (v: number) =>
    new Intl.NumberFormat(intlLocale, { style: "currency", currency: currency || "EUR" }).format(v);
  const chargeRef = useRef<HTMLButtonElement>(null);
  const [checkoutStep, setCheckoutStep] = useState<"order" | "payment" | "complete">("order");
  /** Frozen cart when entering payment — submit uses this so the sale is never sent with an empty cart. */
  const [paymentCartSnapshot, setPaymentCartSnapshot] = useState<CartItem[] | null>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [customersSheetOpen, setCustomersSheetOpen] = useState(false);
  const [ordersSheetOpen, setOrdersSheetOpen] = useState(false);
  const [tillDialogOpen, setTillDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [closeTillDialogOpen, setCloseTillDialogOpen] = useState(false);
  const [drawerNotice, setDrawerNotice] = useState<string | null>(null);
  const [lastCompletedSale, setLastCompletedSale] = useState<{ transactionId: string; amountLabel: string } | null>(null);
  const [pendingFirstSaleCelebration, setPendingFirstSaleCelebration] = useState<{ amountLabel: string } | null>(null);
  const focusedCheckout = checkoutStep === "payment" || checkoutStep === "complete";
  const [discountEditId, setDiscountEditId] = useState<string | null>(null);
  const [discountEditValue, setDiscountEditValue] = useState<number | "">("");
  const [saleStatus, setSaleStatus] = useState<{ ok: boolean; msg: string; transactionId?: string } | null>(null);
  const [firstSaleCelebration, setFirstSaleCelebration] = useState<{ amountLabel: string } | null>(null);
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
  const [cashCustomOpen, setCashCustomOpen] = useState(false);
  const [heldSales, setHeldSales] = useState<HeldSale[]>(() => listHeldSales());
  const [heldOpen, setHeldOpen] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<QueuedSale[]>(() => listOfflineQueue());
  const [quickAccessOpen, setQuickAccessOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
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
  const cashUnderPaid = isCashSingle && typeof cashReceived === "number" && cashReceived > 0 && cashReceived < totalDue - 0.005;
  const totalVat = useMemo(() => cart.reduce((s, i) => s + lineVatAmount(i), 0), [cart]);
  const txDiscountPct = useMemo(() => transactionDiscountPct(cart), [cart]);
  const checkoutCart = paymentCartSnapshot ?? cart;
  const checkoutTotalDue = useMemo(
    () => cartGrossAfter(checkoutCart) + safeTipAmount,
    [checkoutCart, safeTipAmount]
  );

  function buildSaleFormData(saleCart: CartItem[], dueTotal: number): FormData {
    const fd = new FormData();
    fd.set("cart_json", JSON.stringify(saleCart));
    fd.set("session_id", sessionId ?? "");
    fd.set("payment_method_id", paymentMethodId);
    fd.set("payment_type", selectedPaymentType);
    fd.set("customer_name", selectedCustomer?.name ?? "");
    fd.set("discount_pct", String(txDiscountPct));
    fd.set("tip_amount", String(safeTipAmount));
    fd.set("order_type", features.orderTypes ? orderType : "");
    fd.set("table_label", features.tableService ? tableLabel : "");
    fd.set("kitchen_note", (features.kitchenDisplay || features.restaurantOrderFlow) ? kitchenNote : "");
    fd.set("customer_note", features.restaurantOrderFlow ? customerNote : "");

    const cashSingle =
      selectedPaymentType === "cash" &&
      activeSplitPayments.length === 0 &&
      saleCart.length > 0;

    if (cashSingle) {
      const received =
        typeof cashReceived === "number" && cashReceived > 0
          ? Number(cashReceived.toFixed(2))
          : Number(dueTotal.toFixed(2));
      fd.set("cash_received", received.toFixed(2));
      fd.set("change_due", Math.max(0, received - dueTotal).toFixed(2));
    } else {
      fd.set("cash_received", "");
      fd.set("change_due", "");
    }

    if (features.splitPayments) {
      fd.set(
        "split_payments_json",
        JSON.stringify(
          activeSplitPayments.map((row) => {
            const method = paymentMethods.find((m) => m.id === row.payment_method_id);
            return {
              payment_method_id: row.payment_method_id,
              method: method?.type ?? "other",
              amount: row.amount,
              reference: row.reference ?? "",
            };
          })
        )
      );
    }

    return fd;
  }

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
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cashQuickBills = useMemo(() => [35, 40, 50, 100], []);
  const cashExactAmount = useMemo(() => Number(totalDue.toFixed(2)), [totalDue]);
  const displayedChangeDue = isCashSingle
    ? (typeof cashReceived === "number" && cashReceived > 0
        ? Number((cashReceived - totalDue).toFixed(2))
        : 0)
    : null;
  const fiscalActive = isFiscalNetClientActive(isRO, fiscalNet);

  return (
    <div className="relative flex w-full flex-1 flex-col bg-white min-h-0 lg:flex-row lg:overflow-hidden">
      {/* Left: Products column — order step only */}
      {checkoutStep === "order" && (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:min-h-0">
        {/* Top bar: quick access + add product + new sale */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-3 shrink-0"
            onClick={() => setQuickAccessOpen(true)}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">{t.quickAccess}</span>
          </Button>
          {canManage && (
            <Button
              type="button"
              variant="outline"
              className="h-11 px-3 shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => setAddProductOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t.addProduct}</span>
            </Button>
          )}
          <div className="flex-1" />
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 shrink-0"
            onClick={() => {
              setCart([]);
              setCheckoutStep("order");
              setLastCompletedSale(null);
              setSaleStatus(null);
            }}
          >
            {t.newSale}
          </Button>
        </div>
        {/* Products toolbar: categories, search */}
        <div className="space-y-3 px-3 py-3 sm:px-4 lg:flex-none shrink-0">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:mx-0 sm:px-0">
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
        <div className="grid flex-1 min-h-0 gap-2.5 overflow-y-auto px-3 pb-3 sm:gap-3 sm:px-4 lg:px-4 lg:pb-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5" style={{WebkitOverflowScrolling: "touch"}} data-tour="pos-product">
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
            <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-slate-400 space-y-3">
              <p>{posProducts.length === 0 ? t.noProductsYet : t.noProductsMatch}</p>
              {canManage && posProducts.length === 0 && (
                <Button type="button" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setAddProductOpen(true)}>
                  <Plus className="h-4 w-4" />
                  {t.addProduct}
                </Button>
              )}
            </div>
          )}
        </div>
        <PosQuickAccessSheet
          open={quickAccessOpen}
          onOpenChange={setQuickAccessOpen}
          canManage={canManage}
          onAddProduct={() => setAddProductOpen(true)}
          onCustomers={() => setCustomersSheetOpen(true)}
          onOrders={() => setOrdersSheetOpen(true)}
          onRefund={() => setRefundDialogOpen(true)}
          onCashMovement={() => setTillDialogOpen(true)}
          onCloseTill={() => setCloseTillDialogOpen(true)}
          onHoldOrder={() => {
            const held = holdCurrentSale({ cart, customerName: selectedCustomer?.name });
            if (held) {
              setCart([]);
              setHeldSales(listHeldSales());
              setCheckoutStep("order");
            }
          }}
          heldCount={heldSales.length}
          onHeldOrders={() => setHeldOpen(true)}
          fiscalActive={fiscalActive}
          onZReport={() => setZReportOpen(true)}
          zReportDone={zReportDone}
          zReportPending={zReportPending}
          cartHasItems={cart.length > 0}
        />
        {canManage && (
          <PosQuickAddProduct
            open={addProductOpen}
            onOpenChange={setAddProductOpen}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            defaultVatRate={defaultVatRate}
            currency={currency}
          />
        )}
        <Sheet open={customersSheetOpen} onOpenChange={setCustomersSheetOpen}>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader><SheetTitle>{t.customers}</SheetTitle></SheetHeader>
            <div className="space-y-4 overflow-y-auto px-4 pb-4">
              <Input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder={t.searchCustomer} aria-label={t.searchCustomer} />
              <div className="space-y-2">
                {shownCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedCustomer(c); setCustomersSheetOpen(false); }}
                    className="w-full rounded-lg border p-3 text-left hover:bg-slate-50"
                  >
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
        <Sheet open={ordersSheetOpen} onOpenChange={setOrdersSheetOpen}>
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
                  {Number(tx.discount_total ?? 0) > 0 && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">−{money(Number(tx.discount_total ?? 0))} discount</p>
                  )}
                  <p className="text-xs text-slate-500 mt-0.5">{tx.customer_name || t.walkIn} · {tx.payment_methods?.name ? paymentTypeLabel(tx.payment_methods.type ?? "other", tx.payment_methods.name, locale) : t.paymentGeneric}</p>
                  <a className="text-blue-600 hover:underline text-xs mt-2 inline-block" href={`/app/transactions/${tx.id}`}>{t.viewReceipt}</a>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <RefundDialog recentTransactions={recentTransactions} currency={currency} open={refundDialogOpen} onOpenChange={setRefundDialogOpen} showTrigger={false} />
        <TillDialog sessionId={sessionId} cashDrawerSettings={cashDrawerSettings} fiscalNet={fiscalNet} isRO={isRO} currency={currency} orgName={orgName} userName={userName} open={tillDialogOpen} onOpenChange={setTillDialogOpen} showTrigger={false} />
        <CloseTillDialog sessionId={sessionId} summary={summary} fiscalNet={fiscalNet} currency={currency} orgName={orgName} userName={userName} open={closeTillDialogOpen} onOpenChange={setCloseTillDialogOpen} showTrigger={false} />
        {fiscalActive && (
          <Dialog open={zReportOpen} onOpenChange={setZReportOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader><DialogTitle>{t.zReportConfirmTitle}</DialogTitle></DialogHeader>
              <p className="text-sm text-slate-600">{t.zReportConfirmBody}</p>
              {fiscalNet?.mockMode && (
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
      )}

      {/* Cart / payment / complete */}
      <form onSubmit={async (e) => {
        e.preventDefault();
        if (salePending || !checkoutCart.length || checkoutStep !== "payment") return;
        setSalePending(true);
        setSaleStatus(null);
        setLastFiscalTxt(null);
          const fd = buildSaleFormData(checkoutCart, checkoutTotalDue);
          try {
          if (!isBrowserOnline()) {
            enqueueOfflineSale(
              formDataToPayload(fd),
              t.offlineQueueLabel(checkoutCart.length, money(checkoutTotalDue))
            );
            resetCartAfterSale();
            setPaymentCartSnapshot(null);
            setOfflineQueue(listOfflineQueue());
            setSaleStatus({ ok: true, msg: t.offlineQueued });
            setSalePending(false);
            return;
          }
          writeCartBackupToStorage({
            cart: checkoutCart,
            sessionId: sessionId ?? "",
            paymentMethodId,
            cashReceived,
            discountPct: txDiscountPct,
          });
          const res = await completeSaleReturn(fd);
          if (!res.ok) {
            setSaleStatus({ ok: false, msg: friendlySaleError(res.error, locale) });
            setSalePending(false);
            setCheckoutStep("payment");
            return;
          }
          if (!res.transactionId) {
            setSaleStatus({ ok: false, msg: friendlySaleError("Failed to save transaction.", locale) });
            setSalePending(false);
            setCheckoutStep("payment");
            return;
          }
          // FiscalNet receipt — Romania + enabled in Settings only (browser → localhost:65400)
          if (res.fiscalApiPending && fiscalActive && fiscalNet) {
            const fnRes = await fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType);
            if (fnRes.filename && fnRes.content) setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
            console.info("[FiscalNet] receipt browser result", { ok: fnRes.ok, message: fnRes.message, mode: fiscalNet.connectionMode });
          }
          setSaleStatus(null);
          setCart([]);
          setPaymentCartSnapshot(null);
          setTipAmount(0);
          setSplitPayments([]);
          setSelectedCustomer(null);
          setCashReceived("");
          setSalePending(false);
          clearCartBackupFromStorage();
          const isFirstSale = typeof window !== "undefined" && !localStorage.getItem(FIRST_SALE_DONE_KEY);
          if (isFirstSale) {
            localStorage.setItem(FIRST_SALE_DONE_KEY, "1");
            setPendingFirstSaleCelebration({ amountLabel: money(res.total) });
          }
          if (res.cashSale) {
            openCashDrawer("cash_sale", cashDrawerSettings).then((drawerResult) => {
              if (drawerResult.cashierMessage) setDrawerNotice(drawerResult.cashierMessage);
            });
          }
          setLastCompletedSale({ transactionId: res.transactionId!, amountLabel: money(res.total) });
          setCheckoutStep("complete");
        } catch (err) {
          const rawMsg = err instanceof Error ? err.message : "";
          // Detect framework/network errors (build mismatch, dropped connection, etc.)
          const isFrameworkError = /unexpected response|from the server|failed to fetch|networkerror|load failed|fetch/i.test(rawMsg);
          const safeMsg = isFrameworkError ? t.appUpdated : t.saleNotCompleted;
          setSaleStatus({ ok: false, msg: safeMsg });
          setSalePending(false);
          setCheckoutStep("payment");
        }
      }} className={`flex min-h-0 flex-col bg-white ${focusedCheckout ? "absolute inset-0 z-20" : "w-full max-h-[min(52vh,32rem)] shrink-0 border-t border-slate-200 lg:max-h-none lg:w-[400px] lg:shrink-0 lg:overflow-hidden lg:border-t-0 lg:border-l lg:border-slate-100"}`} data-tour="pos-cart">
        <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${focusedCheckout ? "mx-auto w-full max-w-xl px-6" : ""}`}>
        {checkoutStep === "complete" && lastCompletedSale ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="text-4xl">✓</div>
            <p className="mt-3 text-lg font-semibold text-slate-900">{t.saleComplete}</p>
            <p className="mt-1 text-3xl font-bold text-slate-950 tabular-nums">{lastCompletedSale.amountLabel}</p>
            <div className="mt-8 flex w-full flex-col gap-2">
              <Button
                type="button"
                className="h-12 w-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  setCheckoutStep("order");
                  setPaymentCartSnapshot(null);
                  setLastCompletedSale(null);
                  setSaleStatus(null);
                  setDrawerNotice(null);
                  setLastFiscalTxt(null);
                  if (pendingFirstSaleCelebration) {
                    setFirstSaleCelebration(pendingFirstSaleCelebration);
                    setPendingFirstSaleCelebration(null);
                  }
                }}
              >
                {t.newSaleAfter}
              </Button>
              <a
                href={`/app/transactions/${lastCompletedSale.transactionId}`}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                {t.viewReceiptAfter}
              </a>
              {fiscalActive && lastFiscalTxt && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full"
                  onClick={() => downloadFiscalNetTxt(lastFiscalTxt.filename, lastFiscalTxt.content)}
                >
                  {t.printReceipt}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="h-10 w-full text-slate-500"
                onClick={() => {
                  setCheckoutStep("order");
                  setPaymentCartSnapshot(null);
                  setLastCompletedSale(null);
                  setSaleStatus(null);
                  setDrawerNotice(null);
                  setLastFiscalTxt(null);
                  if (pendingFirstSaleCelebration) {
                    setFirstSaleCelebration(pendingFirstSaleCelebration);
                    setPendingFirstSaleCelebration(null);
                  }
                }}
              >
                {t.noReceipt}
              </Button>
            </div>
          </div>
        ) : checkoutStep === "payment" ? (
          <div className="flex flex-1 flex-col py-5">
            <div className="mb-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setPaymentCartSnapshot(null);
                  setCashCustomOpen(false);
                  setCheckoutStep("order");
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                ← {t.backToOrder}
              </button>
              {features.splitPayments && (
                <button type="button" onClick={() => setSplitOpen(true)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  {t.splitAmount}
                </button>
              )}
            </div>
            <div className="flex-1 flex flex-col space-y-5">
              <div className="text-center py-2">
                <p className="text-5xl font-bold text-slate-950 tabular-nums">{money(totalDue)}</p>
                <p className="mt-2 text-sm text-slate-500">{t.howToPay}</p>
              </div>

              {features.splitPayments && activeSplitPayments.length > 0 ? (
                <button type="button" onClick={() => setSplitOpen(true)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${splitRemaining > 0.01 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-300 bg-green-50 text-green-800"}`}>
                  <span className="font-semibold">{t.splitPayment}</span>
                  {" · "}{t.splitPaid(money(splitPaid))}
                  {splitRemaining > 0.01 ? ` · ${t.splitRemaining(money(splitRemaining))}` : ` · ${t.splitFullyPaid}`}
                </button>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {paymentMethods.map((m) => {
                    const selected = paymentMethodId === m.id;
                    const isCash = m.type === "cash";
                    return (
                      <div key={m.id} className="bg-white first:rounded-t-xl last:rounded-b-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethodId(m.id);
                            if (m.type !== "cash") {
                              setCashReceived("");
                              setCashCustomOpen(false);
                            }
                          }}
                          className={`flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors ${selected && !isCash ? "bg-blue-50/40" : "hover:bg-slate-50/80"}`}
                        >
                          <span className={`text-base font-medium ${selected ? "text-slate-900" : "text-slate-700"}`}>
                            {paymentTypeLabel(m.type, m.name, locale)}
                          </span>
                          {selected && !isCash ? <span className="text-blue-600 text-sm font-semibold">✓</span> : null}
                        </button>
                        {isCash && selected && (
                          <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setCashReceived(cashExactAmount);
                                  setCashCustomOpen(false);
                                }}
                                className={`text-sm font-semibold transition-colors ${cashReceived === cashExactAmount && !cashCustomOpen ? "text-blue-700" : "text-blue-600 hover:text-blue-800"}`}
                              >
                                {t.exact}
                              </button>
                              {cashQuickBills.map((v) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => {
                                    setCashReceived(v);
                                    setCashCustomOpen(false);
                                  }}
                                  className={`text-sm font-semibold tabular-nums transition-colors ${cashReceived === v && !cashCustomOpen ? "text-blue-700" : "text-blue-600 hover:text-blue-800"}`}
                                >
                                  {money(v)}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setCashCustomOpen(true);
                                  setCashReceived("");
                                }}
                                className={`text-sm font-semibold transition-colors ${cashCustomOpen ? "text-blue-700" : "text-blue-600 hover:text-blue-800"}`}
                              >
                                {t.custom}
                              </button>
                            </div>
                            {cashCustomOpen && (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                autoFocus
                                placeholder={money(cashExactAmount)}
                                value={cashReceived === "" ? "" : cashReceived}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setCashReceived(raw === "" ? "" : Number(raw));
                                }}
                                className="h-11 text-lg font-semibold tabular-nums"
                                aria-label={t.cashReceived}
                              />
                            )}
                            <div className={`flex items-center justify-between rounded-lg px-3 py-2.5 ${cashUnderPaid ? "bg-red-50" : "bg-slate-50"}`}>
                              <span className={`text-sm font-medium ${cashUnderPaid ? "text-red-700" : "text-slate-600"}`}>
                                {t.changeDue}
                              </span>
                              <span className={`text-lg font-bold tabular-nums ${cashUnderPaid ? "text-red-700" : "text-slate-900"}`}>
                                {cashUnderPaid && displayedChangeDue !== null
                                  ? `−${money(Math.abs(displayedChangeDue))}`
                                  : money(displayedChangeDue ?? 0)}
                              </span>
                            </div>
                            {cashUnderPaid && <p className="text-xs text-red-600">{t.cashUnderpaidMsg}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {saleStatus && !saleStatus.ok && (
                <p className="text-center text-sm text-red-600">{saleStatus.msg}</p>
              )}
              <Button
                ref={chargeRef}
                type="submit"
                disabled={chargeDisabled}
                className="h-14 w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl disabled:opacity-40 mt-auto"
              >
                {salePending
                  ? t.processing
                  : cashUnderPaid
                    ? t.insufficientCash
                    : t.confirmPayment(money(totalDue))}
              </Button>
            </div>
          </div>
        ) : (
        <>
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4">
          <span className="text-sm font-semibold text-slate-800">{t.currentSale(cartItemCount)}</span>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {(pendingSyncSales.length > 0 || pendingFiscalSales.length > 0) && (
            <span className="hidden text-[10px] font-semibold uppercase tracking-wide text-amber-700 sm:inline">
              {pendingSyncSales.length > 0 ? t.offlinePendingSync(pendingSyncSales.length) : t.offlinePendingFiscal(pendingFiscalSales.length)}
            </span>
          )}
            <button
              type="button"
              onClick={() => setCustomersSheetOpen(true)}
              className="max-w-[7rem] truncate text-xs font-medium text-blue-600 hover:text-blue-800 sm:max-w-[10rem]"
            >
              {selectedCustomer ? selectedCustomer.name : t.addCustomerBtn}
            </button>
          {cart.length > 0 && (
              <button type="button" onClick={() => setCart([])} className="shrink-0 text-xs text-slate-400 hover:text-red-500">{t.clearAll}</button>
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
        {checkoutStep === "order" && (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2 sm:px-4" style={{WebkitOverflowScrolling: "touch"}}>
          {cart.map((item) => {
            const linePct = item.discount_pct ?? 0;
            const lineTotal = lineGrossAfter(item);
            const lineList = lineGrossBefore(item);
            return (
            <div key={item.product_id} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3">
              <div className="flex items-center gap-2 sm:gap-3">
              <button type="button" onClick={() => openItemOptions(item.product_id)} className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold text-slate-900">{item.product_name}</p>
                {linePct > 0 && (
                  <span className="mt-1 inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{t.discountBadge(linePct)}</span>
                )}
              </button>
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-100 bg-slate-50/80 p-0.5">
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity - 1); }} aria-label={t.decreaseQty} className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:h-10 sm:w-10">−</button>
                <span className="w-6 text-center text-sm font-bold tabular-nums sm:w-7">{item.quantity}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity + 1); }} aria-label={t.increaseQty} className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:h-10 sm:w-10">+</button>
              </div>
              <div className="shrink-0 text-right min-w-[4rem] sm:min-w-[4.5rem]">
                {linePct > 0 && <p className="text-[10px] text-slate-400 line-through tabular-nums">{money(lineList)}</p>}
                <p className="text-sm font-bold tabular-nums text-slate-950 sm:text-base">{money(lineTotal)}</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, 0); }} aria-label={t.removeItem} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200 sm:h-9 sm:w-9">×</button>
              </div>
            </div>
          );})}
          {!cart.length && <p className="py-8 text-center text-sm text-slate-300 sm:py-10">{t.tapToAdd}</p>}
        </div>
        )}
        <div className="shrink-0 space-y-3 border-t border-slate-100 bg-white px-3 pt-3 pb-3 shadow-[0_-6px_16px_rgba(15,23,42,0.06)] sm:px-4 sm:pb-4 lg:shadow-none">
              {cart.length > 0 && (
                <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setOptionsOpen((v) => !v)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span>{t.moreOptions}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${optionsOpen ? "rotate-180" : ""}`} />
                </button>
              {optionsOpen && (
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  {(features.kitchenDisplay || features.restaurantOrderFlow || features.tips || features.splitPayments) && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {(features.kitchenDisplay || features.restaurantOrderFlow) && (
                      <button type="button" onClick={() => setNotesOpen(true)}
                        className={`flex min-h-[3.5rem] flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-colors ${(kitchenNote || customerNote) ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-white"}`}>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <StickyNote className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          {t.notes}
                        </span>
                        {(kitchenNote || customerNote) && <span className="mt-1 text-[11px] font-medium text-blue-600">●</span>}
                      </button>
                    )}
                    {features.tips && (
                      <button type="button" onClick={() => setTipOpen(true)}
                        className={`flex min-h-[3.5rem] flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-colors ${safeTipAmount > 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-white"}`}>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Banknote className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          {t.tip}
                        </span>
                        {safeTipAmount > 0
                          ? <span className="mt-1 text-sm font-bold tabular-nums text-emerald-700">{money(safeTipAmount)}</span>
                          : <span className="mt-1 text-[11px] text-slate-400">{t.addTip}</span>}
                      </button>
                    )}
                    {features.splitPayments && (
                      <button type="button" onClick={() => setSplitOpen(true)}
                        className={`flex min-h-[3.5rem] flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-colors ${activeSplitPayments.length > 0 ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-white"}`}>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <Zap className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                          {t.splitPayment}
                        </span>
                        {activeSplitPayments.length > 0
                          ? <span className="mt-1 text-sm font-bold tabular-nums text-violet-700">{activeSplitPayments.length}×</span>
                          : <span className="mt-1 text-[11px] text-slate-400">{t.splitAmount}</span>}
                      </button>
                    )}
                    </div>
                  )}
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Percent className="h-4 w-4 text-slate-500" />
                        {t.discountPct}
                      </span>
                      {discountAmount > 0 && (
                        <span className="text-sm font-bold tabular-nums text-blue-600">−{money(discountAmount)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={uniformCartDiscount === null ? "" : uniformCartDiscount || ""}
                        onChange={(e) => applyDiscountToAllCurrentItems(Number(e.target.value) || 0)}
                        placeholder="0"
                        aria-label={t.discountPctAria}
                        className="h-11 flex-1 text-center text-lg font-bold tabular-nums"
                      />
                      <span className="w-6 shrink-0 text-sm font-semibold text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              )}
                </div>
              )}
              <div className="space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3">
              {discountAmount > 0 && <div className="flex justify-between text-xs text-slate-500"><span>{t.subtotal}</span><span className="tabular-nums">{money(grossTotal)}</span></div>}
              {discountAmount > 0 && <div className="flex justify-between text-xs text-blue-600"><span>{t.discount}</span><span className="font-medium tabular-nums">−{money(discountAmount)}</span></div>}
              {totalVat > 0.01 && <div className="flex justify-between text-xs text-slate-400"><span>{vatLabel}</span><span className="tabular-nums">{money(totalVat)}</span></div>}
              {safeTipAmount > 0 && <div className="flex justify-between text-xs text-emerald-700"><span>{t.tip}</span><span className="font-medium tabular-nums">{money(safeTipAmount)}</span></div>}
              <div className="flex items-baseline justify-between border-t border-slate-200/80 pt-2">
                <span className="text-sm font-semibold text-slate-700 sm:text-base">{t.total}</span>
                <span className="text-2xl font-bold tabular-nums text-slate-950 sm:text-3xl">{money(totalDue)}</span>
              </div>
              </div>
              <Button
                type="button"
                disabled={!cart.length || !paymentMethods.length}
                data-tour="pos-charge"
                className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-40 sm:h-14 sm:text-lg"
                onClick={() => {
                  setPaymentCartSnapshot(normalizeCartLines(cart, txDiscountPct));
                  setCheckoutStep("payment");
                }}
              >
                {!paymentMethods.length ? t.setupPaymentMethods : cart.length === 0 ? t.addItems : t.chargeAmount(money(totalDue))}
              </Button>
        </div>
        </>
        )}
        </div>

          <input type="hidden" name="customer_name" value={selectedCustomer?.name ?? ""} />
          <input type="hidden" name="payment_method_id" value={paymentMethodId} />
          <input type="hidden" name="cash_received" value={isCashSingle && typeof cashReceived === "number" && cashReceived > 0 ? cashReceived.toFixed(2) : ""} />
          <input type="hidden" name="change_due" value={isCashSingle && typeof cashReceived === "number" && cashReceived > 0 && !cashUnderPaid ? Math.max(0, displayedChangeDue ?? 0).toFixed(2) : ""} />
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
      {checkoutStep === "order" && firstSaleCelebration ? (
        <FirstSaleCelebration
          amountLabel={firstSaleCelebration.amountLabel}
          onClose={() => setFirstSaleCelebration(null)}
        />
      ) : null}
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
