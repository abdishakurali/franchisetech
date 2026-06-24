"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppI18n } from "@/lib/app-i18n-context";

function money(v: number, currency: string) {
  if (currency === "RON") return `${v.toFixed(2)} lei`;
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: currency || "EUR" }).format(v);
}

export function ZReportCashForm({
  expectedCash,
  reportDate,
  orgId,
  currency = "EUR",
}: {
  expectedCash: number;
  reportDate: string;
  orgId: string;
  currency?: string;
}) {
  const { t } = useAppI18n();
  const cc = t.reportPages.zReport.cashClose;
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const countedNum = parseFloat(counted) || 0;
  const difference = countedNum - expectedCash;
  const currencySuffix = currency === "RON" ? " (lei)" : currency === "EUR" ? " (€)" : ` (${currency})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{cc.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {saved ? (
          <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">
            {cc.saved(reportDate)}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-slate-500">{cc.expectedCash}</p>
                <p className="text-xl font-bold text-slate-900">{money(expectedCash, currency)}</p>
              </div>
              <div>
                <Label>
                  {cc.countedCash}
                  {currencySuffix}
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={counted}
                  onChange={(e) => setCounted(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: difference >= 0 ? "#f0fdf4" : "#fef2f2" }}>
                <p className="text-slate-500 text-sm">{cc.difference}</p>
                <p className={`text-xl font-bold ${difference >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {counted ? (difference >= 0 ? "+" : "") + money(difference, currency) : "—"}
                </p>
              </div>
            </div>
            <div>
              <Label>{cc.notes}</Label>
              <Input
                placeholder={cc.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={async () => {
                try {
                  await fetch("/api/daily-close", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      orgId,
                      closeDate: reportDate,
                      expectedCash,
                      countedCash: countedNum,
                      cashDifference: difference,
                      notes: notes || null,
                    }),
                  });
                  setSaved(true);
                } catch {
                  setSaved(true);
                }
              }}
              disabled={!counted}
              variant="outline"
            >
              {cc.save}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
