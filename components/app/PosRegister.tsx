"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { addCustomerFromPos, closePosSession, completeSaleReturn, posCashMovement, voidTransaction } from "@/app/actions/kitchenops";
import { runZReport } from "@/app/actions/fiscalnet";
import { fiscalBrowserReceipt, fiscalBrowserCashIn, fiscalBrowserCashOut, fiscalBrowserZReport, downloadFiscalNetTxt, type BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { useFiscalNetActive } from "@/lib/fiscalnet/use-fiscalnet-active";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Banknote, Check, ChevronDown, Coffee, Droplets, LayoutGrid, LockKeyhole, MoreHorizontal, Package, Percent, Plus, RefreshCcw, StickyNote, UserPlus, Utensils, Zap } from "lucide-react";
import { openCashDrawer, type CashDrawerSettings } from "@/lib/cash-drawer";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PosPaymentPanel } from "@/components/app/PosPaymentPanel";
import { PosOfflineBar } from "@/components/app/PosOfflineBar";
import { friendlySaleError, paymentTypeLabel, type PosLocale } from "@/lib/pos-i18n";
import { PosI18nProvider, usePosI18n, posIntlLocale } from "@/lib/pos-i18n-context";
import {
  readCartBackupFromStorage,
  writeCartBackupToStorage,
  clearCartBackupFromStorage,
} from "@/lib/pos-cart-backup";
import { holdCurrentSale, listHeldSales, resumeHeldSale, type HeldSale } from "@/lib/pos-held-sales";
import {
  clampDiscountPct,
  clampDiscountLei,
  cartDiscountAmount,
  cartGrossAfter,
  cartGrossAfterLei,
  cartGrossBefore,
  cartLeiDiscountAmount,
  lineGrossAfter,
  lineGrossBefore,
  normalizeCartLines,
  transactionDiscountPct,
  type PosCartLine,
} from "@/lib/pos-line-discount";
import {
  enqueueOfflineSale,
  formDataToPayload,
  isBrowserOnline,
  isRetryableNetworkError,
  listOfflineQueue,
  listPendingSync,
  markOfflineSaleSynced,
  payloadToFormData,
  removeOfflineSale,
  markOfflineSaleSyncFailed,
  type QueuedSale,
} from "@/lib/pos-offline-queue";
import { PosQuickAddProduct } from "@/components/app/PosQuickAddProduct";
import { PosQuickAccessSheet } from "@/components/app/PosQuickAccessSheet";
import { sortCategoriesByName } from "@/lib/product-categories";

type Product = {
  id: string; name: string; sale_price: number | string; vat_rate?: number | string | null;
  unit_of_measure?: string | null; image_url?: string | null; placeholder_type?: string | null;
  cost_price?: number | string | null;
  available_in_pos?: boolean | null; is_ingredient?: boolean | null; is_sellable?: boolean | null;
  has_sgr?: boolean | null;
  product_categories?: { id: string; name: string; color: string | null } | null;
  pos_category?: { id: string; name: string; color: string | null } | null;
  inventory_category?: { id: string; name: string; color: string | null } | null;
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

async function downloadFiscalPayload(
  result: FiscalDownloadPayload,
  label: string,
  fiscalEnabled: boolean,
) {
  if (!fiscalEnabled) return false;
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

type PlaceholderCfg = {
  bg: string;
  iconColor: string;
  icon: typeof Coffee;
  style?: React.CSSProperties;
};

const PLACEHOLDER_STYLES: Record<string, PlaceholderCfg> = {
  coffee: { bg: "bg-amber-50", iconColor: "text-amber-400", icon: Coffee },
  drink: { bg: "bg-sky-50", iconColor: "text-sky-400", icon: Droplets },
  food: { bg: "bg-emerald-50", iconColor: "text-emerald-500", icon: Utensils },
  snack: { bg: "bg-yellow-50", iconColor: "text-yellow-500", icon: Utensils },
  ingredient: { bg: "bg-slate-100", iconColor: "text-slate-400", icon: Package },
  other: { bg: "bg-slate-100", iconColor: "text-slate-400", icon: Package },
};

function productPlaceholderCfg(
  placeholderType: string | null | undefined,
  categoryName: string | null | undefined,
  categoryColor: string | null | undefined,
): PlaceholderCfg {
  if (placeholderType && PLACEHOLDER_STYLES[placeholderType]) return PLACEHOLDER_STYLES[placeholderType];
  const cat = categoryName?.toLowerCase() ?? "";
  if (cat.includes("coffee") || cat.includes("espresso") || cat.includes("cafe")) return PLACEHOLDER_STYLES.coffee;
  if (cat.includes("drink") || cat.includes("beverage") || cat.includes("bauturi")) return PLACEHOLDER_STYLES.drink;
  if (cat.includes("food") || cat.includes("meal") || cat.includes("snack")) return PLACEHOLDER_STYLES.food;
  if (categoryColor) {
    return { bg: "", iconColor: "text-white/80", icon: Package, style: { backgroundColor: categoryColor } };
  }
  return PLACEHOLDER_STYLES.other;
}

function ProductTileMedia({
  imageUrl,
  name,
  placeholderType,
  categoryName,
  categoryColor,
}: {
  imageUrl: string | null | undefined;
  name: string;
  placeholderType: string | null | undefined;
  categoryName: string | null | undefined;
  categoryColor: string | null | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(imageUrl && !failed);

  if (showImage) {
    return (
      <div className="h-10 w-full shrink-0 overflow-hidden bg-slate-100 sm:h-11">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl!}
          alt={name}
          className="h-full w-full object-cover object-center"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const cfg = productPlaceholderCfg(placeholderType, categoryName, categoryColor);
  const Icon = cfg.icon;
  return (
    <div
      className={cn("flex h-10 w-full shrink-0 items-center justify-center sm:h-11", cfg.bg)}
      style={cfg.style}
      aria-hidden
    >
      <Icon className={cn("h-5 w-5 opacity-50 sm:h-6 sm:w-6", cfg.iconColor)} />
    </div>
  );
}

function ProductGridTile({
  name,
  priceLabel,
  imageUrl,
  placeholderType,
  categoryName,
  categoryColor,
  inCartQty,
  selected,
  onClick,
}: {
  name: string;
  priceLabel: string;
  imageUrl: string | null | undefined;
  placeholderType: string | null | undefined;
  categoryName: string | null | undefined;
  categoryColor: string | null | undefined;
  inCartQty: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border text-left shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
        selected ? "border-blue-400 bg-blue-50/30 ring-1 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300",
      )}
    >
      <ProductTileMedia
        imageUrl={imageUrl}
        name={name}
        placeholderType={placeholderType}
        categoryName={categoryName}
        categoryColor={categoryColor}
      />
      {inCartQty > 0 && (
        <span className="absolute right-1.5 top-1.5 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm sm:text-xs">
          ×{inCartQty}
        </span>
      )}
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-0.5 p-1.5 sm:p-2">
        <span className="line-clamp-2 text-[11px] font-semibold leading-snug text-slate-900 [overflow-wrap:anywhere] sm:text-xs">
          {name}
        </span>
        <span className="text-[10px] font-bold tabular-nums text-slate-700 sm:text-[11px]">{priceLabel}</span>
      </div>
    </button>
  );
}

function pickDefaultPaymentId(methods: PaymentMethod[]) {
  return methods.find((m) => m.type === "card")?.id ?? methods[0]?.id ?? "";
}

function TillDialog({
  sessionId,
  cashDrawerSettings,
  fiscalNet,
  fiscalActive = false,
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
  fiscalActive?: boolean;
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
      // FiscalNet cash in/out — only when enabled in Settings
      if (fiscalActive && fiscalNet?.enabled && amount > 0) {
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
  catalogOffline = false,
  catalogCachedAt = null,
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
  catalogOffline?: boolean;
  catalogCachedAt?: string | null;
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
  const [lastCompletedSale, setLastCompletedSale] = useState<{
    amountLabel: string;
    transactionId?: string;
    status: "saving" | "saved" | "failed" | "queued";
    errorMsg?: string;
    retryPayload?: Record<string, string>;
  } | null>(null);
  const focusedCheckout = checkoutStep === "payment" || checkoutStep === "complete";
  const [discountEditId, setDiscountEditId] = useState<string | null>(null);
  const [discountEditValue, setDiscountEditValue] = useState<number | "">("");
  const [discountMode, setDiscountMode] = useState<"pct" | "lei">("pct");
  const [cartDiscountLei, setCartDiscountLei] = useState(0);
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
  const [browserOffline, setBrowserOffline] = useState(() => !isBrowserOnline());
  const [syncingOffline, setSyncingOffline] = useState(false);
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
    const syncOfflineState = () => setBrowserOffline(!isBrowserOnline());
    window.addEventListener("offline", syncOfflineState);
    window.addEventListener("online", syncOfflineState);
    syncOfflineState();
    return () => {
      window.removeEventListener("offline", syncOfflineState);
      window.removeEventListener("online", syncOfflineState);
    };
  }, []);

  function resetCartAfterSale() {
    setCart([]);
    setTipAmount(0);
    setSplitPayments([]);
    setSelectedCustomer(null);
    setCashReceived("");
    setCartDiscountLei(0);
    setDiscountMode("pct");
    clearCartBackupFromStorage();
  }

  const grossTotal = useMemo(() => cartGrossBefore(cart), [cart]);
  const discountAmount = useMemo(() => {
    if (discountMode === "lei" && cartDiscountLei > 0) {
      return cartLeiDiscountAmount(cart, cartDiscountLei);
    }
    return cartDiscountAmount(cart);
  }, [cart, discountMode, cartDiscountLei]);
  const afterDiscount = useMemo(() => {
    if (discountMode === "lei" && cartDiscountLei > 0) {
      return cartGrossAfterLei(cart, cartDiscountLei);
    }
    return cartGrossAfter(cart);
  }, [cart, discountMode, cartDiscountLei]);
  const safeTipAmount = features.tips ? Math.max(0, tipAmount) : 0;
  const totalDue = afterDiscount + safeTipAmount;
  const activeSplitPayments = splitPayments.filter((row) => row.amount > 0 && row.payment_method_id);
  const splitPaid = activeSplitPayments.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const splitRemaining = totalDue - splitPaid;
  const selectedPaymentType = paymentMethods.find((m) => m.id === paymentMethodId)?.type ?? "other";
  const isCashSingle = selectedPaymentType === "cash" && activeSplitPayments.length === 0 && cart.length > 0;
  const cashUnderPaid = isCashSingle && typeof cashReceived === "number" && cashReceived > 0 && cashReceived < totalDue - 0.005;
  const txDiscountPct = useMemo(() => transactionDiscountPct(cart), [cart]);
  const checkoutCart = paymentCartSnapshot ?? cart;
  const checkoutTotalDue = useMemo(() => {
    const base =
      discountMode === "lei" && cartDiscountLei > 0
        ? cartGrossAfterLei(checkoutCart, cartDiscountLei)
        : cartGrossAfter(checkoutCart);
    return base + safeTipAmount;
  }, [checkoutCart, safeTipAmount, discountMode, cartDiscountLei]);

  function buildSaleFormData(saleCart: CartItem[], dueTotal: number): FormData {
    const fd = new FormData();
    fd.set("cart_json", JSON.stringify(saleCart));
    fd.set("session_id", sessionId ?? "");
    fd.set("payment_method_id", paymentMethodId);
    fd.set("payment_type", selectedPaymentType);
    fd.set("customer_name", selectedCustomer?.name ?? "");
    if (discountMode === "lei" && cartDiscountLei > 0) {
      fd.set("discount_lei", String(cartDiscountLei));
      fd.set("discount_pct", "0");
    } else {
      fd.set("discount_pct", String(txDiscountPct));
      fd.set("discount_lei", "0");
    }
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

  function queueCurrentSale(saleCart: CartItem[], dueTotal: number) {
    const fd = buildSaleFormData(saleCart, dueTotal);
    enqueueOfflineSale(
      formDataToPayload(fd),
      t.offlineQueueLabel(saleCart.length, money(dueTotal)),
    );
    resetCartAfterSale();
    setPaymentCartSnapshot(null);
    setOfflineQueue(listOfflineQueue());
    setLastCompletedSale({ amountLabel: money(dueTotal), status: "queued" });
    setCheckoutStep("complete");
    setSalePending(false);
  }

  async function persistSaleInBackground(
    fd: FormData,
    cartSnapshot: CartItem[],
    amountLabel: string,
  ) {
    const payload = formDataToPayload(fd);
    try {
      writeCartBackupToStorage({
        cart: cartSnapshot,
        sessionId: sessionId ?? "",
        paymentMethodId,
        cashReceived,
        discountPct: txDiscountPct,
      });
      const res = await completeSaleReturn(fd);
      if (!res.ok || !res.transactionId) {
        const errMsg = res.ok
          ? t.saleSaveFailed
          : friendlySaleError(res.error, locale);
        enqueueOfflineSale(payload, t.offlineQueueLabel(cartSnapshot.length, amountLabel));
        setOfflineQueue(listOfflineQueue());
        clearCartBackupFromStorage();
        setLastCompletedSale((prev) =>
          prev
            ? { ...prev, status: "queued", errorMsg: errMsg }
            : { amountLabel, status: "queued" },
        );
        return;
      }
      clearCartBackupFromStorage();
      setLastCompletedSale({
        amountLabel: money(res.total),
        transactionId: res.transactionId,
        status: "saved",
      });
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        void fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType).then((fnRes) => {
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          console.info("[FiscalNet] receipt browser result", {
            ok: fnRes.ok,
            message: fnRes.message,
            mode: fiscalNet.connectionMode,
          });
        });
      }
      if (res.cashSale) {
        void openCashDrawer("cash_sale", cashDrawerSettings).then((drawerResult) => {
          if (drawerResult.cashierMessage) setDrawerNotice(drawerResult.cashierMessage);
        });
      }
    } catch (err) {
      enqueueOfflineSale(payload, t.offlineQueueLabel(cartSnapshot.length, amountLabel));
      setOfflineQueue(listOfflineQueue());
      clearCartBackupFromStorage();
      setLastCompletedSale((prev) =>
        prev
          ? {
              ...prev,
              status: "queued",
              retryPayload: payload,
              errorMsg: isRetryableNetworkError(err) ? undefined : t.saleSaveFailed,
            }
          : { amountLabel, status: "queued", retryPayload: payload },
      );
    }
  }

  async function retryFailedSale(payload: Record<string, string>, amountLabel: string) {
    setLastCompletedSale((prev) =>
      prev ? { ...prev, status: "saving", errorMsg: undefined } : null,
    );
    const cartSnapshot = (() => {
      try {
        return JSON.parse(payload.cart_json ?? "[]") as CartItem[];
      } catch {
        return [] as CartItem[];
      }
    })();
    await persistSaleInBackground(payloadToFormData(payload), cartSnapshot, amountLabel);
  }

  const posProducts = useMemo(() =>
    products.filter((p) => p.available_in_pos !== false && p.is_ingredient !== true), [products]);

  const filtered = useMemo(() =>
    posProducts.filter((p) => {
      const matchCat = search.trim() ? true : activeCategory === "all" || p.pos_category?.id === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }), [posProducts, activeCategory, search]);

  const activeCategoryIds = useMemo(() => new Set(posProducts.map((p) => p.pos_category?.id).filter(Boolean)), [posProducts]);
  const visibleCategories = useMemo(
    () => sortCategoriesByName(categories.filter((c) => activeCategoryIds.has(c.id))),
    [categories, activeCategoryIds],
  );
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
    setDiscountMode("pct");
    setCartDiscountLei(0);
    setCart((items) => syncSgr(items.map((i) => ({ ...i, discount_pct: clamped }))));
  }

  function applyCartDiscountLei(lei: number) {
    const clamped = clampDiscountLei(lei, cartGrossBefore(cart));
    setDiscountMode("lei");
    setCartDiscountLei(clamped);
    setCart((items) => syncSgr(items.map((i) => ({ ...i, discount_pct: 0 }))));
  }

  function switchDiscountMode(mode: "pct" | "lei") {
    setDiscountMode(mode);
    if (mode === "pct") {
      setCartDiscountLei(0);
    } else {
      applyDiscountToAllCurrentItems(0);
    }
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

  const chargeDisabled =
    !cart.length ||
    !paymentMethods.length ||
    salePending ||
    cashUnderPaid ||
    (features.splitPayments && activeSplitPayments.length > 0 && splitPaid + 0.0001 < totalDue);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cashExactAmount = useMemo(() => Number(totalDue.toFixed(2)), [totalDue]);
  const displayedChangeDue = isCashSingle
    ? (typeof cashReceived === "number" && cashReceived > 0
        ? Number((cashReceived - totalDue).toFixed(2))
        : 0)
    : null;
  const fiscalActive = useFiscalNetActive(isRO, fiscalNet);

  async function syncQueuedEntry(entry: QueuedSale): Promise<boolean> {
    try {
      const syncPromise = completeSaleReturn(payloadToFormData(entry.payload));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(t.saleSaveFailed)), 25_000)
      );
      const res = await Promise.race([syncPromise, timeoutPromise]);
      if (!res.ok || !res.transactionId) {
        markOfflineSaleSyncFailed(
          entry.id,
          !res.ok ? friendlySaleError(res.error, locale) : t.saleSaveFailed,
        );
        return false;
      }
      let fiscalDone = !res.fiscalApiPending;
      if (res.fiscalApiPending && fiscalActive && fiscalNet?.enabled) {
        try {
          const fnRes = await fiscalBrowserReceipt(fiscalNet, res.items, res.total, res.paymentType);
          if (fiscalActive && fnRes.filename && fnRes.content) {
            setLastFiscalTxt({ filename: fnRes.filename, content: fnRes.content });
          }
          fiscalDone = fnRes.ok;
        } catch {
          fiscalDone = false;
        }
      }
      if (fiscalDone) {
        removeOfflineSale(entry.id);
      } else {
        markOfflineSaleSynced(entry.id, res.transactionId);
      }
      if (res.cashSale) {
        void openCashDrawer("cash_sale", cashDrawerSettings).then((drawerResult) => {
          if (drawerResult.cashierMessage) setDrawerNotice(drawerResult.cashierMessage);
        });
      }
      return true;
    } catch (err) {
      markOfflineSaleSyncFailed(
        entry.id,
        err instanceof Error ? err.message : t.saleSaveFailed,
      );
      return false;
    }
  }

  async function flushAllPending() {
    if (!isBrowserOnline() || syncingOfflineRef.current) return;
    const pending = listPendingSync();
    if (!pending.length) return;
    syncingOfflineRef.current = true;
    setSyncingOffline(true);
    setSaleStatus({ ok: true, msg: t.offlineSyncing });
    let synced = 0;
    for (const entry of pending) {
      if (await syncQueuedEntry(entry)) synced++;
    }
    syncingOfflineRef.current = false;
    setSyncingOffline(false);
    setOfflineQueue(listOfflineQueue());
    if (synced > 0) {
      setSaleStatus({ ok: true, msg: t.offlineSyncDone(synced) });
    } else {
      setSaleStatus(null);
    }
    setTimeout(() => setSaleStatus(null), 4000);
  }

  async function resendQueuedSale(id: string) {
    if (syncingOfflineRef.current) return;
    const entry = listOfflineQueue().find((q) => q.id === id && q.status === "pending_sync");
    if (!entry) return;
    syncingOfflineRef.current = true;
    setSyncingOffline(true);
    await syncQueuedEntry(entry);
    syncingOfflineRef.current = false;
    setSyncingOffline(false);
    setOfflineQueue(listOfflineQueue());
  }

  useEffect(() => {
    const onOnline = () => { void flushAllPending(); };
    window.addEventListener("online", onOnline);
    void flushAllPending();
    const timer = setInterval(() => { void flushAllPending(); }, 60_000);
    return () => {
      window.removeEventListener("online", onOnline);
      clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- flush uses stable sale/fiscal helpers
  }, [t.offlineSyncDone, t.offlineSyncing, fiscalActive, fiscalNet, cashDrawerSettings, locale]);

  return (
    <div className="relative grid min-h-0 w-full flex-1 grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-white lg:flex lg:flex-row">
      {/* Left: Products column — order step only */}
      {checkoutStep === "order" && (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white lg:min-h-0 lg:min-w-0">
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
        {/* Products toolbar */}
        <div className="shrink-0 space-y-2 border-b border-slate-100 px-3 py-2 sm:px-4">
          {catalogOffline && !browserOffline && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900">
              {t.catalogOfflineMenu}
            </p>
          )}
          <div
            className="flex gap-1.5 overflow-x-auto overscroll-x-contain pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label={t.allCategories}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                activeCategory === "all"
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              )}
            >
              {t.allCategories}
            </button>
            {visibleCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                  activeCategory === c.id
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                )}
              >
                {c.color ? (
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden
                  />
                ) : null}
                {c.name}
              </button>
            ))}
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchProducts}
            className="h-10 max-w-none"
            aria-label={t.searchProducts}
          />
        </div>
        {/* Scrollable product grid */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 pb-6 pt-2 sm:px-4"
          style={{ WebkitOverflowScrolling: "touch" }}
          data-tour="pos-product"
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((p) => {
            const inCart = cart.find((i) => i.product_id === p.id);
            return (
              <ProductGridTile
                key={p.id}
                name={p.name}
                imageUrl={p.image_url}
                placeholderType={p.placeholder_type}
                categoryName={p.pos_category?.name}
                categoryColor={p.pos_category?.color}
                priceLabel={money(Number(p.sale_price))}
                inCartQty={inCart?.quantity ?? 0}
                selected={Boolean(inCart)}
                onClick={() => addToCart(p)}
              />
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
        <TillDialog sessionId={sessionId} cashDrawerSettings={cashDrawerSettings} fiscalNet={fiscalNet} fiscalActive={fiscalActive} isRO={isRO} currency={currency} orgName={orgName} userName={userName} open={tillDialogOpen} onOpenChange={setTillDialogOpen} showTrigger={false} />
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
                    if (res.status === "browser_api_pending" && fiscalActive && fiscalNet?.enabled) {
                      const fnRes = await fiscalBrowserZReport(fiscalNet);
                      setZReportDone(true);
                      setSaleStatus({ ok: fnRes.ok, msg: fnRes.ok ? t.zReportSent(fnRes.message) : `FiscalNet: ${fnRes.message}` });
                    } else {
                      const downloaded = res.ok && fiscalActive ? await downloadFiscalPayload(res, "z_report", fiscalActive) : false;
                      if (fiscalActive && res.filename && res.content) setLastFiscalTxt({ filename: res.filename, content: res.content });
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
      <form onSubmit={(e) => {
        e.preventDefault();
        if (!checkoutCart.length || checkoutStep !== "payment") return;
        const fd = buildSaleFormData(checkoutCart, checkoutTotalDue);
        const amountLabel = money(checkoutTotalDue);
        const cartSnapshot = checkoutCart;

        if (!isBrowserOnline()) {
          queueCurrentSale(cartSnapshot, checkoutTotalDue);
          return;
        }

        resetCartAfterSale();
        setPaymentCartSnapshot(null);
        setLastFiscalTxt(null);
        setLastCompletedSale({ amountLabel, status: "saving" });
        setCheckoutStep("complete");
        setSalePending(false);
        void persistSaleInBackground(fd, cartSnapshot, amountLabel);
      }} className={`flex min-h-0 flex-col bg-white lg:min-h-0 ${focusedCheckout ? "absolute inset-0 z-20" : "w-full max-h-[min(48vh,28rem)] shrink-0 border-t border-slate-200 sm:max-h-[min(52vh,32rem)] lg:max-h-none lg:w-[400px] lg:shrink-0 lg:overflow-hidden lg:border-t-0 lg:border-l lg:border-slate-100"}`} data-tour="pos-cart">
        <PosOfflineBar
          t={t}
          browserOffline={browserOffline}
          pendingSync={pendingSyncSales}
          pendingFiscal={pendingFiscalSales}
          syncing={syncingOffline}
          onQueueChange={() => setOfflineQueue(listOfflineQueue())}
          onSyncAll={() => void flushAllPending()}
          onResend={(id) => void resendQueuedSale(id)}
        />
        <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${focusedCheckout ? (checkoutStep === "payment" ? "mx-auto w-full max-w-md px-3 sm:px-4" : "mx-auto w-full max-w-xl px-6") : ""}`}>
        {checkoutStep === "complete" && lastCompletedSale ? (
          <div className="flex flex-1 flex-col justify-center px-2 py-8 sm:py-10">
            <div className="mx-auto w-full max-w-sm text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-500">{t.saleComplete}</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-slate-950">{lastCompletedSale.amountLabel}</p>
              {lastCompletedSale.status === "saving" && (
                <p className="mt-2 text-sm font-medium text-slate-400">{t.saleSaving}</p>
              )}
              {lastCompletedSale.status === "queued" && (
                <p className="mt-2 text-sm font-medium text-amber-700">{t.offlineQueued}</p>
              )}
              {lastCompletedSale.status === "failed" && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-red-600">
                    {lastCompletedSale.errorMsg ?? t.saleSaveFailed}
                  </p>
                  {lastCompletedSale.retryPayload && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 border-red-200 text-red-700"
                      onClick={() =>
                        void retryFailedSale(lastCompletedSale.retryPayload!, lastCompletedSale.amountLabel)
                      }
                    >
                      {t.saleRetry}
                    </Button>
                  )}
                </div>
              )}
              <div className="mt-8 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  className="h-12 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    setCheckoutStep("order");
                    setPaymentCartSnapshot(null);
                    setLastCompletedSale(null);
                    setSaleStatus(null);
                    setDrawerNotice(null);
                    setLastFiscalTxt(null);
                  }}
                >
                  {t.newSaleAfter}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12"
                  disabled={!lastCompletedSale.transactionId}
                  render={
                    lastCompletedSale.transactionId ? (
                      <a href={`/app/transactions/${lastCompletedSale.transactionId}`} />
                    ) : undefined
                  }
                >
                  {lastCompletedSale.transactionId ? t.viewReceiptAfter : t.receiptPending}
                </Button>
              </div>
              {fiscalActive && lastFiscalTxt && (
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-800"
                  onClick={() => downloadFiscalNetTxt(lastFiscalTxt.filename, lastFiscalTxt.content)}
                >
                  {t.printReceipt}
                </button>
              )}
            </div>
          </div>
        ) : checkoutStep === "payment" ? (
          <div className="flex flex-1 flex-col items-center min-h-0 w-full">
            {features.splitPayments && activeSplitPayments.length > 0 && (
              <button
                type="button"
                onClick={() => setSplitOpen(true)}
                className={`mx-3 mb-2 mt-2 w-[calc(100%-1.5rem)] rounded-xl border px-3 py-2.5 text-left text-sm transition-colors sm:mx-0 sm:w-full ${splitRemaining > 0.01 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-300 bg-green-50 text-green-800"}`}
              >
                <span className="font-semibold">{t.splitPayment}</span>
                {" · "}{t.splitPaid(money(splitPaid))}
                {splitRemaining > 0.01 ? ` · ${t.splitRemaining(money(splitRemaining))}` : ` · ${t.splitFullyPaid}`}
              </button>
            )}
            <PosPaymentPanel
              t={t}
              locale={locale}
              money={money}
              currency={currency}
              intlLocale={posIntlLocale(locale)}
              totalDue={totalDue}
              paymentMethods={paymentMethods}
              paymentMethodId={paymentMethodId}
              onSelectMethod={(id, isCash) => {
                setPaymentMethodId(id);
                if (!isCash) {
                  setCashReceived("");
                } else if (cashReceived === "" || cashReceived === 0) {
                  setCashReceived(cashExactAmount);
                }
              }}
              cashExactAmount={cashExactAmount}
              cashReceived={cashReceived}
              setCashReceived={setCashReceived}
              cashUnderPaid={cashUnderPaid}
              displayedChangeDue={displayedChangeDue}
              chargeDisabled={Boolean(chargeDisabled)}
              salePending={salePending}
              saleError={saleStatus && !saleStatus.ok ? saleStatus.msg : null}
              onBack={() => {
                setPaymentCartSnapshot(null);
                setCheckoutStep("order");
              }}
              onSplit={features.splitPayments ? () => setSplitOpen(true) : undefined}
              showSplitLink={features.splitPayments && activeSplitPayments.length === 0}
              chargeRef={chargeRef}
              isOffline={browserOffline}
            />
          </div>
        ) : (
        <>
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4">
          <span className="text-sm font-semibold text-slate-800">{t.currentSale(cartItemCount)}</span>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setCustomersSheetOpen(true)}
              className="max-w-[9rem] truncate text-xs font-medium text-blue-600 hover:text-blue-800 sm:max-w-[12rem] sm:text-sm"
            >
              {selectedCustomer ? selectedCustomer.name : t.addCustomerBtn}
            </button>
          {cart.length > 0 && (
              <button type="button" onClick={() => setCart([])} className="shrink-0 text-xs text-slate-400 hover:text-red-500">{t.clearAll}</button>
          )}
          </div>
        </div>
        {checkoutStep === "order" && (
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2 sm:px-4" style={{WebkitOverflowScrolling: "touch"}}>
          {cart.map((item) => {
            const linePct = item.discount_pct ?? 0;
            const lineTotal = lineGrossAfter(item);
            const lineList = lineGrossBefore(item);
            return (
            <div key={item.product_id} className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm sm:p-3">
              <button type="button" onClick={() => openItemOptions(item.product_id)} className="mb-2 w-full text-left">
                <p className="line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-900 sm:text-base">{item.product_name}</p>
                {linePct > 0 && (
                  <span className="mt-1 inline-flex rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">{t.discountBadge(linePct)}</span>
                )}
              </button>
              <div className="flex items-center gap-2">
              <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-100 bg-slate-50/80 p-0.5">
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity - 1); }} aria-label={t.decreaseQty} className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:h-10 sm:w-10">−</button>
                <span className="w-6 text-center text-sm font-bold tabular-nums sm:w-7">{item.quantity}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setQty(item.product_id, item.quantity + 1); }} aria-label={t.increaseQty} className="flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold text-slate-600 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 sm:h-10 sm:w-10">+</button>
              </div>
              <div className="ml-auto shrink-0 text-right">
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
                <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-3">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Percent className="h-4 w-4 text-slate-500" />
                      {t.discount}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-sm font-bold tabular-nums text-blue-600">−{money(discountAmount)}</span>
                    )}
                  </div>
                  <div className="mb-2 flex gap-1 rounded-lg bg-slate-100 p-0.5">
                    <button
                      type="button"
                      onClick={() => switchDiscountMode("pct")}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                        discountMode === "pct" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t.discountModePct}
                    </button>
                    <button
                      type="button"
                      onClick={() => switchDiscountMode("lei")}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors",
                        discountMode === "lei" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {t.discountModeLei}
                    </button>
                  </div>
                  {discountMode === "pct" ? (
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
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={cartDiscountLei > 0 ? cartDiscountLei : ""}
                        onChange={(e) => applyCartDiscountLei(Number(e.target.value) || 0)}
                        placeholder="0"
                        aria-label={t.discountLeiAria}
                        className="h-11 flex-1 text-center text-lg font-bold tabular-nums"
                      />
                      <span className="w-10 shrink-0 text-right text-sm font-semibold text-slate-400">lei</span>
                    </div>
                  )}
                </div>
              )}
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
                </div>
              )}
                </div>
              )}
              <div className="space-y-1.5 rounded-xl bg-slate-50 px-3.5 py-3">
              {discountAmount > 0 && <div className="flex justify-between text-xs text-slate-500"><span>{t.subtotal}</span><span className="tabular-nums">{money(grossTotal)}</span></div>}
              {discountAmount > 0 && <div className="flex justify-between text-xs text-blue-600"><span>{t.discount}</span><span className="font-medium tabular-nums">−{money(discountAmount)}</span></div>}
              {safeTipAmount > 0 && <div className="flex justify-between text-xs text-emerald-700"><span>{t.tip}</span><span className="font-medium tabular-nums">{money(safeTipAmount)}</span></div>}
              <div className="flex items-baseline justify-between pt-1">
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
          <input type="hidden" name="discount_pct" value={discountMode === "lei" ? 0 : txDiscountPct} />
          <input type="hidden" name="discount_lei" value={discountMode === "lei" && cartDiscountLei > 0 ? cartDiscountLei : 0} />
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

export function PosRegister(props: Parameters<typeof PosRegisterInner>[0] & { appLocale?: PosLocale }) {
  const { appLocale, isRO, ...rest } = props;
  return (
    <PosI18nProvider orgIsRO={isRO ?? false} initialLocale={appLocale}>
      <PosRegisterInner {...rest} isRO={isRO} />
    </PosI18nProvider>
  );
}
