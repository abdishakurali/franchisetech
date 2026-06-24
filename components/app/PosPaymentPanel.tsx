"use client";

import { useEffect, useMemo, useRef, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Banknote, CreditCard, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { paymentTypeLabel, type PosLocale } from "@/lib/pos-i18n";
import type { PosT } from "@/lib/pos-i18n-context";

type PaymentMethod = { id: string; name: string; type: string };

type Props = {
  t: PosT;
  locale: PosLocale;
  money: (v: number) => string;
  currency: string;
  intlLocale: string;
  totalDue: number;
  paymentMethods: PaymentMethod[];
  paymentMethodId: string;
  onSelectMethod: (id: string, isCash: boolean) => void;
  cashExactAmount: number;
  cashReceived: number | "";
  setCashReceived: Dispatch<SetStateAction<number | "">>;
  cashUnderPaid: boolean;
  displayedChangeDue: number | null;
  chargeDisabled: boolean;
  salePending: boolean;
  saleError: string | null;
  onBack: () => void;
  onSplit?: () => void;
  showSplitLink?: boolean;
  chargeRef: RefObject<HTMLButtonElement | null>;
  isOffline?: boolean;
};

function formatAmountParts(amount: number, currency: string, locale: string) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(amount);
  return {
    currency: parts.find((p) => p.type === "currency")?.value ?? "",
    integer: parts.filter((p) => p.type === "integer" || p.type === "group").map((p) => p.value).join(""),
    fraction: parts.filter((p) => p.type === "decimal" || p.type === "fraction").map((p) => p.value).join(""),
  };
}

function quickNoteTenders(total: number): number[] {
  const notes = [5, 10, 20, 50, 100, 200, 500];
  return notes.filter((n) => n >= total - 0.005).slice(0, 4);
}

function MethodIcon({ type }: { type: string }) {
  const Icon = type === "cash" ? Banknote : CreditCard;
  return <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />;
}

function AmountDisplay({ parts }: { parts: ReturnType<typeof formatAmountParts> }) {
  return (
    <div className="flex items-baseline justify-center tabular-nums">
      <span className="mr-1 text-xl font-medium text-slate-400">{parts.currency}</span>
      <span className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">{parts.integer}</span>
      <span className="text-2xl font-semibold text-slate-400">{parts.fraction}</span>
    </div>
  );
}

export function PosPaymentPanel({
  t,
  locale,
  money,
  currency,
  intlLocale,
  totalDue,
  paymentMethods,
  paymentMethodId,
  onSelectMethod,
  cashExactAmount,
  cashReceived,
  setCashReceived,
  cashUnderPaid,
  displayedChangeDue,
  chargeDisabled,
  salePending,
  saleError,
  onBack,
  onSplit,
  showSplitLink,
  chargeRef,
  isOffline = false,
}: Props) {
  const selected = paymentMethods.find((m) => m.id === paymentMethodId);
  const isCash = selected?.type === "cash";
  const keypadFreshRef = useRef(true);
  const inputStrRef = useRef("");

  const effectiveReceived =
    typeof cashReceived === "number" && cashReceived > 0 ? cashReceived : cashExactAmount;

  const totalParts = formatAmountParts(totalDue, currency, intlLocale);
  const receivedParts = formatAmountParts(effectiveReceived, currency, intlLocale);
  const changeAmount = displayedChangeDue ?? 0;
  const showChange = isCash && !cashUnderPaid && changeAmount > 0.005;
  const quickNotes = useMemo(() => quickNoteTenders(totalDue), [totalDue]);

  useEffect(() => {
    if (isCash) {
      keypadFreshRef.current = true;
      inputStrRef.current = "";
    }
  }, [isCash, paymentMethodId, totalDue]);

  function syncFromString(str: string) {
    inputStrRef.current = str;
    if (!str || str === ".") {
      setCashReceived("");
      return;
    }
    const n = parseFloat(str);
    if (Number.isFinite(n) && n >= 0) setCashReceived(Math.round(n * 100) / 100);
  }

  function pressDigit(digit: string) {
    if (digit === "back") {
      keypadFreshRef.current = false;
      const next = inputStrRef.current.slice(0, -1);
      syncFromString(next);
      if (!next) keypadFreshRef.current = true;
      return;
    }
    if (digit === ".") {
      const base = keypadFreshRef.current ? "" : inputStrRef.current;
      keypadFreshRef.current = false;
      if (base.includes(".")) return;
      syncFromString(base === "" ? "0." : `${base}.`);
      return;
    }
    if (keypadFreshRef.current) {
      keypadFreshRef.current = false;
      syncFromString(digit);
      return;
    }
    const base = inputStrRef.current || String(cashReceived === "" ? "" : cashReceived);
    const next = base === "0" ? digit : `${base}${digit}`;
    syncFromString(next);
  }

  function setTender(amount: number) {
    keypadFreshRef.current = true;
    inputStrRef.current = amount.toFixed(2).replace(/\.?0+$/, "").replace(/\.$/, "") || "0";
    setCashReceived(Number(amount.toFixed(2)));
  }

  function selectExact() {
    keypadFreshRef.current = true;
    inputStrRef.current = "";
    setCashReceived(cashExactAmount);
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col min-h-0 px-1 py-3 sm:py-4">
      {isOffline && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-900 sm:text-sm">
          {t.offlineModeBanner}
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-2">
        {paymentMethods.map((m) => {
          const active = paymentMethodId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMethod(m.id, m.type === "cash")}
              className={cn(
                "flex h-14 items-center justify-center gap-2 rounded-xl border text-base font-semibold transition-colors",
                active
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
              )}
            >
              <MethodIcon type={m.type} />
              <span>{paymentTypeLabel(m.type, m.name, locale)}</span>
            </button>
          );
        })}
      </div>

      {showSplitLink && onSplit && (
        <button
          type="button"
          onClick={onSplit}
          className="mb-4 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {t.splitAmount}
        </button>
      )}

      {isCash ? (
        <div className="flex flex-col items-center text-center">
          <p className="text-sm font-medium text-slate-500">
            {t.totalDueLabel}: <span className="font-bold tabular-nums text-slate-800">{money(totalDue)}</span>
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.cashReceived}</p>
          <AmountDisplay parts={receivedParts} />
          {showChange ? (
            <p className="mt-4 text-lg font-bold tabular-nums text-emerald-700">
              {t.changeDue}: {money(changeAmount)}
            </p>
          ) : cashUnderPaid ? (
            <p className="mt-4 text-sm font-semibold text-red-600">
              {t.changeDue}: −{money(Math.abs(changeAmount))} · {t.cashUnderpaidMsg}
            </p>
          ) : (
            <p className="mt-4 text-sm font-medium text-slate-400">{t.changeDue}: {money(0)}</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.totalDueLabel}</p>
          <AmountDisplay parts={totalParts} />
        </div>
      )}

      {isCash && (
        <>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={selectExact}
              className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-800 hover:bg-blue-100"
            >
              {t.exact}
            </button>
            {quickNotes.map((note) => (
              <button
                key={note}
                type="button"
                onClick={() => setTender(note)}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold tabular-nums text-emerald-900 hover:bg-emerald-100"
              >
                {money(note)}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-4 grid w-full max-w-xs grid-cols-3 gap-2">
            {(["1", "2", "3", "4", "5", "6", "7", "8", "9"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pressDigit(key)}
                className="h-12 rounded-xl border border-slate-200 bg-white text-xl font-semibold text-slate-800 hover:bg-slate-50 active:bg-slate-100"
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => pressDigit(".")}
              className="h-12 rounded-xl border border-slate-200 bg-white text-xl font-semibold text-slate-700 hover:bg-slate-50"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => pressDigit("0")}
              className="h-12 rounded-xl border border-slate-200 bg-white text-xl font-semibold text-slate-800 hover:bg-slate-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => pressDigit("back")}
              aria-label="Backspace"
              className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Delete className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {saleError && <p className="mt-4 text-center text-sm text-red-600">{saleError}</p>}

      <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-12 border-slate-300 text-base font-semibold text-slate-700"
          onClick={onBack}
        >
          {t.backToOrder}
        </Button>
        <Button
          ref={chargeRef}
          type="submit"
          disabled={chargeDisabled}
          className="h-12 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 disabled:opacity-40"
        >
          {salePending
            ? t.processing
            : isOffline
              ? t.offlineValidate
              : cashUnderPaid
                ? t.insufficientCash
                : t.validatePayment}
        </Button>
      </div>
    </div>
  );
}
