"use client";

import { Banknote, LockKeyhole, RefreshCcw, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePosI18n } from "@/lib/pos-i18n-context";

type QuickAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  accent?: "default" | "danger";
};

function QuickTile({ action, onNavigate }: { action: QuickAction; onNavigate: () => void }) {
  const base =
    "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-colors min-h-[88px]";
  const styles =
    action.accent === "danger"
      ? "border-attention/25 bg-attention/10 hover:bg-attention/15 text-attention"
      : "border-border bg-white hover:border-brass/30 hover:bg-accent/40 text-foreground";

  return (
    <button
      type="button"
      disabled={action.disabled}
      onClick={() => {
        action.onClick();
        onNavigate();
      }}
      className={`${base} ${styles} disabled:opacity-40`}
    >
      <span className="text-brass">{action.icon}</span>
      <span className="text-xs font-semibold leading-tight">{action.label}</span>
    </button>
  );
}

/**
 * Gate B: 11 destinations collapsed to 4 — the ones that only make sense
 * mid-till and only from here (hold, refund, cash movement, close till).
 * Everything else that used to live in this sheet moved rather than
 * disappeared:
 *   - Add product already had its own persistent top-bar button, separate
 *     from this sheet — dropping it here loses nothing.
 *   - Settings / Products / Payment methods / Sales reports are reachable
 *     through the main app nav and didn't need a POS-specific shortcut.
 *   - Customers, recent transactions ("Comenzi"), held orders, and Raport Z
 *     moved to the top bar's "More" menu (still one tap away, just not
 *     crowding this collapsed-to-4 sheet) — see the PosMoreMenu render call
 *     in PosRegister.tsx.
 */
export function PosQuickAccessSheet({
  open,
  onOpenChange,
  canManage,
  onRefund,
  onCashMovement,
  onCloseTill,
  onHoldOrder,
  cartHasItems,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage: boolean;
  onRefund: () => void;
  onCashMovement: () => void;
  onCloseTill: () => void;
  onHoldOrder?: () => void;
  cartHasItems: boolean;
}) {
  const { t } = usePosI18n();

  const actions: QuickAction[] = [
    ...(cartHasItems && onHoldOrder
      ? [{ label: t.holdOrder, icon: <ShoppingBag className="h-5 w-5" />, onClick: onHoldOrder }]
      : []),
    { label: t.refund, icon: <RefreshCcw className="h-5 w-5" />, onClick: onRefund },
    ...(canManage
      ? [
          { label: t.cashMovement, icon: <Banknote className="h-5 w-5" />, onClick: onCashMovement },
          {
            label: t.closeTill,
            icon: <LockKeyhole className="h-5 w-5" />,
            onClick: onCloseTill,
            accent: "danger" as const,
          },
        ]
      : []),
  ];

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t.quickAccess}</SheetTitle>
          <p className="text-xs text-muted-foreground">{t.quickAccessHint}</p>
        </SheetHeader>
        <div className="mt-6 px-4 pb-6">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((a) => (
              <QuickTile key={a.label} action={a} onNavigate={close} />
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
