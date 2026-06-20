"use client";

import Link from "next/link";
import {
  Banknote, LockKeyhole, Package, RefreshCcw, Settings, ShoppingBag,
  Users, ReceiptText, BarChart3, CreditCard, Plus,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePosI18n } from "@/lib/pos-i18n-context";

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  accent?: "default" | "danger";
};

function QuickTile({ action, onNavigate }: { action: QuickAction; onNavigate: () => void }) {
  const base =
    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors min-h-[88px]";
  const styles =
    action.accent === "danger"
      ? "border-red-200 bg-red-50 hover:bg-red-100 text-red-800"
      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40 text-slate-800";

  const inner = (
    <>
      <span className="text-blue-600">{action.icon}</span>
      <span className="text-xs font-semibold leading-tight">{action.label}</span>
    </>
  );

  if (action.href) {
    return (
      <Link
        href={action.href}
        onClick={onNavigate}
        className={`${base} ${styles} ${action.disabled ? "pointer-events-none opacity-40" : ""}`}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={() => {
        action.onClick?.();
        onNavigate();
      }}
      className={`${base} ${styles} disabled:opacity-40`}
    >
      {inner}
    </button>
  );
}

export function PosQuickAccessSheet({
  open,
  onOpenChange,
  canManage,
  onAddProduct,
  onCustomers,
  onOrders,
  onRefund,
  onCashMovement,
  onCloseTill,
  onHoldOrder,
  heldCount,
  onHeldOrders,
  fiscalActive,
  onZReport,
  zReportDone,
  zReportPending,
  cartHasItems,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  onAddProduct: () => void;
  onCustomers: () => void;
  onOrders: () => void;
  onRefund: () => void;
  onCashMovement: () => void;
  onCloseTill: () => void;
  onHoldOrder?: () => void;
  heldCount: number;
  onHeldOrders?: () => void;
  fiscalActive: boolean;
  onZReport?: () => void;
  zReportDone: boolean;
  zReportPending: boolean;
  cartHasItems: boolean;
}) {
  const { t } = usePosI18n();

  const setup: QuickAction[] = [
    ...(canManage
      ? [
          { label: t.addProduct, icon: <Plus className="h-5 w-5" />, onClick: onAddProduct },
          { label: t.settings, icon: <Settings className="h-5 w-5" />, href: "/app/settings" },
          { label: t.products, icon: <Package className="h-5 w-5" />, href: "/app/products" },
          { label: t.paymentMethods, icon: <CreditCard className="h-5 w-5" />, href: "/app/settings" },
        ]
      : []),
  ];

  const selling: QuickAction[] = [
    { label: t.customers, icon: <Users className="h-5 w-5" />, onClick: onCustomers },
    { label: t.orders, icon: <ReceiptText className="h-5 w-5" />, onClick: onOrders },
    { label: t.reports, icon: <BarChart3 className="h-5 w-5" />, href: "/app/reports/sales" },
  ];

  const cash: QuickAction[] = [
    ...(canManage
      ? [
          { label: t.cashMovement, icon: <Banknote className="h-5 w-5" />, onClick: onCashMovement },
          { label: t.closeTill, icon: <LockKeyhole className="h-5 w-5" />, onClick: onCloseTill, accent: "danger" as const },
        ]
      : []),
  ];

  const more: QuickAction[] = [
    { label: t.refund, icon: <RefreshCcw className="h-5 w-5" />, onClick: onRefund },
    ...(cartHasItems && onHoldOrder
      ? [{ label: t.holdOrder, icon: <ShoppingBag className="h-5 w-5" />, onClick: onHoldOrder }]
      : []),
    ...(heldCount > 0 && onHeldOrders
      ? [{ label: `${t.heldOrders} (${heldCount})`, icon: <ShoppingBag className="h-5 w-5" />, onClick: onHeldOrders }]
      : []),
    ...(fiscalActive && onZReport
      ? [{
          label: zReportPending ? t.zReportProcessing : zReportDone ? t.zReportDone : t.zReport,
          icon: <ReceiptText className="h-5 w-5" />,
          onClick: onZReport,
          disabled: zReportDone || zReportPending,
        }]
      : []),
  ];

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.quickAccess}</SheetTitle>
          <p className="text-xs text-slate-500">{t.quickAccessHint}</p>
        </SheetHeader>
        <div className="mt-6 space-y-6 px-4 pb-6">
          {setup.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.quickSetup}</p>
              <div className="grid grid-cols-2 gap-2">
                {setup.map((a) => (
                  <QuickTile key={a.label} action={a} onNavigate={close} />
                ))}
              </div>
            </section>
          )}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.quickSelling}</p>
            <div className="grid grid-cols-2 gap-2">
              {selling.map((a) => (
                <QuickTile key={a.label} action={a} onNavigate={close} />
              ))}
            </div>
          </section>
          {cash.length > 0 && (
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.quickCash}</p>
              <div className="grid grid-cols-2 gap-2">
                {cash.map((a) => (
                  <QuickTile key={a.label} action={a} onNavigate={close} />
                ))}
              </div>
            </section>
          )}
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{t.quickMore}</p>
            <div className="grid grid-cols-2 gap-2">
              {more.map((a) => (
                <QuickTile key={a.label} action={a} onNavigate={close} />
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
