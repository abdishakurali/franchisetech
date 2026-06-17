"use client";

import { useEffect, useState } from "react";
import { openCashDrawer, type CashDrawerReason, type CashDrawerSettings } from "@/lib/cash-drawer";

export function CashDrawerNotice({ reason, settings }: { reason: CashDrawerReason; settings?: CashDrawerSettings }) {
  const [message, setMessage] = useState("Recording cash drawer action...");

  useEffect(() => {
    let mounted = true;
    openCashDrawer(reason, settings).then((result) => {
      if (!mounted) return;
      setMessage(result.cashierMessage);
    });
    return () => { mounted = false; };
  }, [reason, settings]);

  if (!message) return null;

  return (
    <div className="mx-auto max-w-xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800 print:hidden">
      {message}
    </div>
  );
}
