"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { saveOrgCui } from "@/app/actions/org-settings";

type LookupResult = {
  denumire: string;
  adresa: string;
  vatRegistered: boolean;
  caenCode: string;
};

type Props = {
  initialCui?: string;
  initialVerified?: boolean;
  initialDenumire?: string;
  initialAdresa?: string;
  initialVatRegistered?: boolean;
  canEdit?: boolean;
};

export function CuiLookupCard({
  initialCui = "",
  initialVerified = false,
  initialDenumire = "",
  initialAdresa = "",
  initialVatRegistered = false,
  canEdit = true,
}: Props) {
  const [cui, setCui] = useState(initialCui);
  const [result, setResult] = useState<LookupResult | null>(
    initialVerified && initialDenumire
      ? {
          denumire: initialDenumire,
          adresa: initialAdresa,
          vatRegistered: initialVatRegistered,
          caenCode: "",
        }
      : null
  );
  const [verified, setVerified] = useState(initialVerified);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [fetching, startFetch] = useTransition();
  const [saving, startSave] = useTransition();

  function handleVerify() {
    const clean = cui.trim().replace(/^RO/i, "").replace(/[^0-9]/g, "");
    if (clean.length < 6 || clean.length > 10) {
      setError("CUI invalid — introdu un număr între 6 și 10 cifre.");
      return;
    }
    setError(null);
    setResult(null);
    setVerified(false);
    setSaved(false);
    startFetch(async () => {
      const resp = await fetch(`/api/anaf/company?cui=${clean}`);
      const json = (await resp.json()) as { success: boolean; error?: string } & Partial<LookupResult>;
      if (!json.success) {
        setError(json.error ?? "Eroare necunoscută");
        return;
      }
      setResult({
        denumire: json.denumire ?? "",
        adresa: json.adresa ?? "",
        vatRegistered: json.vatRegistered ?? false,
        caenCode: json.caenCode ?? "",
      });
      setVerified(true);
    });
  }

  function handleSave() {
    if (!result) return;
    const fd = new FormData();
    fd.set("cui", cui.replace(/^RO/i, "").replace(/[^0-9]/g, ""));
    fd.set("denumire", result.denumire);
    fd.set("adresa", result.adresa);
    fd.set("vat_registered", String(result.vatRegistered));
    fd.set("verified", "true");
    setSaved(false);
    startSave(async () => {
      await saveOrgCui(fd);
      setSaved(true);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Date fiscale
          {verified && initialVerified && (
            <Badge className="bg-green-100 text-green-800 border-0 text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verificat ANAF
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Verifică CUI-ul firmei prin ANAF pentru denumirea legală folosită în e-Factura, FiscalNet și Saga.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label htmlFor="cui-input">Cod Unic de Înregistrare (CUI)</Label>
            <Input
              id="cui-input"
              value={cui}
              onChange={(e) => { setCui(e.target.value); setError(null); setSaved(false); }}
              placeholder="ex: 12345678"
              disabled={!canEdit || fetching}
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={!canEdit || fetching || !cui.trim()}
            variant="outline"
          >
            {fetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verifică ANAF"}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              Firmă verificată ANAF
            </div>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-slate-500">Denumire legală firmă</p>
                <p className="font-medium text-slate-900">{result.denumire || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Adresă</p>
                <p className="font-medium text-slate-900">{result.adresa || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500">Status TVA</p>
                <p className="font-medium text-slate-900">
                  {result.vatRegistered ? "Plătitor TVA" : "Neplătitor TVA"}
                </p>
              </div>
              {result.caenCode && (
                <div>
                  <p className="text-slate-500">Cod CAEN</p>
                  <p className="font-medium text-slate-900">{result.caenCode}</p>
                </div>
              )}
            </div>
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="mt-2"
              >
                {saving ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Se salvează...</>
                ) : saved ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Salvat</>
                ) : (
                  "Salvează date legale"
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
