"use client";

import { useRef, useState } from "react";
import { openCashDrawer, type CashDrawerReason } from "@/lib/cash-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CashFormProps {
  sessionId: string;
  movementType: "cash_in" | "cash_out";
  action: (fd: FormData) => Promise<void>;
}

function PosCashNotice({ message, type }: { message: string; type: "success" | "info" }) {
  return (
    <div className={`rounded-lg px-3 py-2 text-sm flex items-center gap-2 ${
      type === "success"
        ? "bg-green-50 border border-green-200 text-green-800"
        : "bg-amber-50 border border-amber-200 text-amber-800"
    }`}>
      <span>{type === "success" ? "✓" : "💵"}</span>
      {message}
    </div>
  );
}

export function PosCashForm({ sessionId, movementType, action }: CashFormProps) {
  const [notice, setNotice] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  const label = movementType === "cash_in" ? "Cash in" : "Cash out";
  const buttonClass = movementType === "cash_in"
    ? "w-full border-green-300 text-green-700 hover:bg-green-50"
    : "w-full border-red-300 text-red-700 hover:bg-red-50";
  const buttonText = movementType === "cash_in" ? "+ Add cash" : "− Remove cash";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setNotice(null);

    const formData = new FormData(e.currentTarget);

    try {
      await action(formData);
      // Attempt drawer open
      const drawerReason: CashDrawerReason = movementType;
      const result = await openCashDrawer(drawerReason);
      setNotice({
        message: result.cashierMessage || "Cash movement saved.",
        type: result.result === "command_sent" ? "success" : "info",
      });
      formRef.current?.reset();
    } catch {
      setNotice({ message: "Something went wrong. Please try again.", type: "info" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {notice && (
        <PosCashNotice message={notice.message} type={notice.type} />
      )}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="session_id" value={sessionId} />
        <input type="hidden" name="movement_type" value={movementType} />
        <div>
          <Label>Amount (€)</Label>
          <Input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
        </div>
        <div>
          <Label>Reason</Label>
          <Input
            name="reason"
            placeholder={movementType === "cash_in" ? "Extra float" : "Supplier payment"}
            required
          />
        </div>
        <Button type="submit" variant="outline" className={buttonClass} disabled={pending}>
          {pending ? "Recording…" : buttonText}
        </Button>
      </form>
    </div>
  );
}
