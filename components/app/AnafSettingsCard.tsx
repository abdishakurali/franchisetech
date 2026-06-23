import { saveAnafSettings, disconnectAnaf } from "@/app/actions/efactura";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnafSettingsCardProps {
  canEdit: boolean;
  anafConnected: boolean;
  anafCif: string;
  anafVatRegistered: boolean;
  anafAuthUrl: string | null;
}

export function AnafSettingsCard({
  canEdit,
  anafConnected,
  anafCif,
  anafVatRegistered,
  anafAuthUrl,
}: AnafSettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>e-Factura / SPV</CardTitle>
        <CardDescription>
          Conectează-ți contul ANAF pentru a trimite facturi electronice direct la ANAF/SPV. Obligatoriu pentru B2B din ianuarie 2024.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {canEdit && (
          <form action={saveAnafSettings as unknown as (fd: FormData) => Promise<void>} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="anaf_cif">CIF / CUI organizație</Label>
                <Input id="anaf_cif" name="anaf_cif" defaultValue={anafCif} placeholder="ex: 12345678" />
                <p className="text-xs text-slate-500">Fără prefixul RO — îl adăugăm automat în XML.</p>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  id="anaf_vat_registered"
                  name="anaf_vat_registered"
                  defaultChecked={anafVatRegistered}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <Label htmlFor="anaf_vat_registered">Plătitor de TVA (prefix RO în CUI)</Label>
              </div>
            </div>
            <Button type="submit" size="sm">Salvează CIF</Button>
          </form>
        )}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${anafConnected ? "bg-green-500" : "bg-slate-300"}`} />
            <div>
              <p className="font-medium text-sm">
                {anafConnected ? "Conectat la ANAF/SPV ✓" : "Neconectat"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {anafConnected
                  ? "Facturi electronice pot fi trimise automat la ANAF."
                  : "Necesită certificat digital pe token USB și PIN-ul asociat."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            {!anafConnected && anafAuthUrl && (
              <a href={anafAuthUrl}>
                <Button size="sm">Autorizează conexiunea ANAF</Button>
              </a>
            )}
            {!anafConnected && !anafAuthUrl && (
              <Button size="sm" disabled>Configurează ANAF_CLIENT_ID pe server</Button>
            )}
            {anafConnected && canEdit && (
              <form action={disconnectAnaf}>
                <Button type="submit" size="sm" variant="outline">Deconectează</Button>
              </form>
            )}
          </div>

          {!anafConnected && (
            <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 space-y-1">
              <p className="font-medium">Pași pentru conectare:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Introdu tokenul USB (SafeNet / Gemalto / Oberthur) în calculator</li>
                <li>Apasă &quot;Autorizează conexiunea ANAF&quot; mai sus</li>
                <li>Selectează certificatul tău și introdu PIN-ul</li>
                <li>Vei fi redirecționat înapoi cu status &quot;Conectat ✓&quot;</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
