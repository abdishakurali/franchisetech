import Link from "next/link";
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
  seller?: {
    legalName: string;
    address: string;
    county: string;
    regCom: string;
    shareCapital: string;
    bankAccounts: Array<{ bank: string | null; iban: string | null; currency: string | null }>;
  };
}

export function AnafSettingsCard({
  canEdit,
  anafConnected,
  anafCif,
  anafVatRegistered,
  anafAuthUrl,
  seller,
}: AnafSettingsCardProps) {
  const banks = [0, 1, 2].map((i) => seller?.bankAccounts[i] ?? { bank: "", iban: "", currency: "RON" });
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
                <p className="text-xs text-muted-foreground">Fără prefixul RO — îl adăugăm automat în XML.</p>
              </div>
              <div className="flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  id="anaf_vat_registered"
                  name="anaf_vat_registered"
                  defaultChecked={anafVatRegistered}
                  className="h-4 w-4 rounded border-border"
                />
                <Label htmlFor="anaf_vat_registered">Plătitor de TVA (prefix RO în CUI)</Label>
              </div>
            </div>
            {seller && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Date furnizor pe factură</p>
                  <p className="text-xs text-muted-foreground">Apar în blocul „Furnizor” al facturilor PDF și în XML-ul e-Factura.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="company_legal_name">Denumire firmă</Label>
                    <Input id="company_legal_name" name="company_legal_name" defaultValue={seller.legalName} placeholder="ex: S.C. Exemplu SRL" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company_reg_com">Nr. Reg. Com.</Label>
                    <Input id="company_reg_com" name="company_reg_com" defaultValue={seller.regCom} placeholder="ex: J40/1234/2020" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company_share_capital">Capital social</Label>
                    <Input id="company_share_capital" name="company_share_capital" defaultValue={seller.shareCapital} placeholder="ex: 200 RON" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company_address">Adresă sediu</Label>
                    <Input id="company_address" name="company_address" defaultValue={seller.address} placeholder="Str., nr., localitate" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="company_county">Județ</Label>
                    <Input id="company_county" name="company_county" defaultValue={seller.county} placeholder="ex: Ilfov" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Conturi bancare (opțional, max. 3)</p>
                  {banks.map((bank, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_6rem]">
                      <Input name={`bank_name_${i}`} defaultValue={bank.bank ?? ""} placeholder="Banca" aria-label={`Banca ${i + 1}`} />
                      <Input name={`bank_iban_${i}`} defaultValue={bank.iban ?? ""} placeholder="IBAN RO.." aria-label={`IBAN ${i + 1}`} />
                      <Input name={`bank_currency_${i}`} defaultValue={bank.currency ?? "RON"} placeholder="RON" aria-label={`Monedă ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button type="submit" size="sm">{seller ? "Salvează datele firmei" : "Salvează CIF"}</Button>
          </form>
        )}

        <div className="rounded-xl border border-border bg-secondary p-4">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${anafConnected ? "bg-reconciled" : "bg-secondary"}`} />
            <div>
              <p className="font-medium text-sm">
                {anafConnected ? "Conectat la ANAF/SPV ✓" : "Neconectat"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
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
            <div className="mt-4 rounded-lg bg-accent p-3 text-xs text-brass space-y-1">
              <p className="font-medium">Pași pentru conectare:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Introdu tokenul USB (SafeNet / Gemalto / Oberthur) în calculator</li>
                <li>Apasă &quot;Autorizează conexiunea ANAF&quot; mai sus</li>
                <li>Selectează certificatul tău și introdu PIN-ul</li>
                <li>Vei fi redirecționat înapoi cu status &quot;Conectat ✓&quot;</li>
              </ol>
            </div>
          )}

          <Link
            href="/help/romania-efactura"
            className="mt-4 inline-block text-xs font-medium text-brass hover:underline"
          >
            Vezi ghid pas cu pas pentru e-Factura →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
