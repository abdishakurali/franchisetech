"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { openPosSession } from "@/app/actions/kitchenops";
import { downloadSlipAsTxt, openingBalanceTxt } from "@/lib/pos-print";
import { downloadFiscalNetTxt, fiscalBrowserCashIn, type BrowserFiscalConfig } from "@/lib/fiscalnet/browser";

interface Props {
  currencySymbol: string;
  currency: string;
  orgName: string;
  userName: string;
  fiscalNet?: BrowserFiscalConfig | null;
  /** True when the organisation's country is Romania — enables txt slip download */
  isRO?: boolean;
  /** Pre-fill with last session's counted cash (or expected cash) */
  defaultCash?: number | null;
}

export function OpenTillForm({ currencySymbol, currency, orgName, userName, fiscalNet, isRO = false, defaultCash }: Props) {
  const router = useRouter();
  const [openingCash, setOpeningCash] = useState(defaultCash != null && defaultCash > 0 ? defaultCash.toFixed(2) : "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [lastTxt, setLastTxt] = useState<{ filename: string; content: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isPending) return;
    setIsPending(true);
    setMessage(null);
    setLastTxt(null);
    const amount = parseFloat(openingCash) || 0;
    const fd = new FormData();
    fd.set("opening_cash", String(amount));

    try {
      await (openPosSession as (fd: FormData) => Promise<void>)(fd);

      if (fiscalNet?.enabled) {
        const result = await fiscalBrowserCashIn(fiscalNet, amount);
        if (result.filename && result.content) setLastTxt({ filename: result.filename, content: result.content });
        setMessage(result.ok ? result.message : `FiscalNet: ${result.message}`);
      } else if (isRO) {
        const { text, filename } = openingBalanceTxt({ orgName, currency, amount, userName });
        downloadSlipAsTxt(text, filename);
        setMessage(`Opening slip downloaded: ${filename}`);
      }
      setTimeout(() => router.refresh(), 700);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not open till.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Opening float ({currencySymbol})</Label>
            <Input
              name="opening_cash"
              type="number"
              step="0.01"
              min="0"
              placeholder="100.00"
              className="mt-1 text-xl h-14 font-semibold"
              autoFocus
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">How much cash is in the drawer before selling.</p>
          </div>
          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
            disabled={isPending}
          >
            {isPending ? "Opening till…" : "Open till"}
          </Button>
          {message && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
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
        </form>
      </CardContent>
    </Card>
  );
}
