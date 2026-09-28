import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";
import {
  updateSagaGestiuneCode,
  updateSiteSagaGestiuneCode,
  updateProductSagaCode,
} from "@/app/actions/accountant-settings";
import Link from "next/link";
import { TemplateDownloadButton } from "@/components/app/TemplateDownloadButton";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AccountingOrg = {
  name: string | null;
  company_legal_name: string | null;
  company_address: string | null;
  anaf_cif: string | null;
  fiscalnet_cif: string | null;
  anaf_vat_registered: boolean | null;
  tax_id_verified: boolean | null;
  saga_export_enabled: boolean | null;
  saga_gestiune_code: string | null;
};

type AccountingSite = {
  id: string;
  name: string | null;
  city: string | null;
  address: string | null;
  saga_gestiune_code: string | null;
};

function canonicalCompanyName(org: AccountingOrg | null) {
  return org?.company_legal_name ?? org?.name ?? "";
}

function canonicalCui(org: AccountingOrg | null) {
  return org?.anaf_cif ?? org?.fiscalnet_cif ?? "";
}

// Merged from the former /app/settings/accountant route (4 internal tabs
// collapsed into stacked cards, matching the hub's "one scrollable page, no
// tabs" philosophy) into a plain section under /app/settings#accountant.
export async function AccountantSettingsSection({
  supabase,
  orgId,
  countryCode,
  org,
  sites,
  installingSaga,
  entitled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>;
  orgId: string;
  countryCode: string | null;
  org: AccountingOrg | null;
  sites: AccountingSite[];
  installingSaga: boolean;
  entitled: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Tot ce are nevoie contabilul tău pentru a conecta softul de contabilitate la datele POS.
      </p>

      {installingSaga && (
        <Card className="border-brass/30 bg-accent">
          <CardHeader>
            <CardTitle className="text-foreground">Configurare Saga</CardTitle>
            <CardDescription className="text-foreground">
              Completează pașii de mai jos doar dacă folosești exportul Saga. Datele POS rămân
              disponibile chiar dacă acest setup nu este finalizat.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
            <div>1. Verifică CUI-ul firmei.</div>
            <div>2. Cere contabilului codul de gestiune Saga.</div>
            <div>3. Completează codurile articolelor pentru produse.</div>
            <div>4. Descarcă template-urile pentru proceduri și politici CMP.</div>
          </CardContent>
        </Card>
      )}

      {!entitled ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lock className="h-4 w-4" /> Configurare contabilitate — plan Scale
            </CardTitle>
            <CardDescription>
              Exportul Saga și pachetul complet pentru contabil sunt disponibile din planul Scale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/billing?reason=saga_requires_scale">
              <Button variant="outline">Vezi planurile de facturare</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <ScreenCompany
            org={org}
            sites={sites}
            updateAction={updateSagaGestiuneCode}
            updateSiteAction={updateSiteSagaGestiuneCode}
          />
          <ScreenProducts supabase={supabase} orgId={orgId} updateAction={updateProductSagaCode} />
          <ScreenChecklist org={org} />
          <ScreenValuation countryCode={countryCode} />
        </>
      )}
    </div>
  );
}

// ── Company details + gestiune code ────────────────────────────────────────

function ScreenCompany({
  org,
  sites,
  updateAction,
  updateSiteAction,
}: {
  org: AccountingOrg | null;
  sites: AccountingSite[];
  updateAction: (formData: FormData) => Promise<void>;
  updateSiteAction: (formData: FormData) => Promise<void>;
}) {
  const orgName = canonicalCompanyName(org);
  const orgCui = canonicalCui(org);
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Date firmă</CardTitle>
          <CardDescription>Informații pre-completate din profilul organizației tale.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Denumire legală firmă</Label>
            <Input value={orgName} readOnly className="bg-secondary text-mid" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">CUI (Cod de identificare fiscală)</Label>
            <Input
              value={orgCui}
              readOnly
              className="bg-secondary text-mid"
              placeholder="Necompletat — verifică firma în Business"
            />
            {!orgCui && (
              <p className="text-xs text-amber-600">
                CUI-ul nu este completat.{" "}
                <Link href="#business" className="underline">Verifică firma prin ANAF în Business →</Link>
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Adresă ANAF</Label>
              <Input value={org?.company_address ?? ""} readOnly className="bg-secondary text-mid" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Status TVA</Label>
              <Input
                value={org?.anaf_vat_registered ? "Plătitor TVA" : "Neplătitor TVA"}
                readOnly
                className="bg-secondary text-mid"
              />
            </div>
          </div>
          {org?.tax_id_verified ? (
            <p className="text-xs text-reconciled">Sursa legală: verificare ANAF salvată în Business.</p>
          ) : (
            <p className="text-xs text-amber-600">
              Verifică firma prin ANAF ca Saga, FiscalNet și e-Factura să folosească aceleași date legale.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cod gestiune Saga implicit</CardTitle>
          <CardDescription>
            Folosit când locația nu are cod propriu. Contabilul îl găsește
            în Saga la <strong>Nomenclatoare → Gestiuni</strong> (ex: BUCATARIE, RESTAURANT, BAR).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateAction} className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="saga_gestiune_code">Cod gestiune</Label>
              <Input
                id="saga_gestiune_code"
                name="saga_gestiune_code"
                defaultValue={org?.saga_gestiune_code ?? ""}
                placeholder="ex: BUCATARIE"
                className="uppercase"
              />
            </div>
            <Button type="submit">Salvează</Button>
          </form>
          {org?.saga_gestiune_code ? (
            <p className="mt-2 text-xs text-reconciled flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cod setat: <strong>{org.saga_gestiune_code}</strong>
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Poți lăsa necompletat dacă nu folosești exportul Saga XML sau dacă gestiunea este global-valorică.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Coduri Saga pe locație</CardTitle>
          <CardDescription>
            Dacă o locație are gestiune separată în Saga, codul de aici înlocuiește codul implicit al firmei.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sites.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nu există locații configurate.</p>
          ) : (
            <div className="divide-y divide-border">
              {sites.map((site) => (
                <form
                  key={site.id}
                  action={updateSiteAction}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end"
                >
                  <input type="hidden" name="site_id" value={site.id} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{site.name ?? "Locație"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[site.address, site.city].filter(Boolean).join(", ") || "Fără adresă"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`site_saga_${site.id}`}>Cod gestiune</Label>
                    <Input
                      id={`site_saga_${site.id}`}
                      name="saga_gestiune_code"
                      defaultValue={site.saga_gestiune_code ?? ""}
                      placeholder={org?.saga_gestiune_code ?? "—"}
                      className="uppercase"
                    />
                  </div>
                  <Button type="submit" variant="outline">Salvează</Button>
                </form>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Product Saga article codes ─────────────────────────────────────────────

async function ScreenProducts({
  supabase,
  orgId,
  updateAction,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  orgId: string;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const { data: products } = await supabase
    .from("products")
    .select("id, name, unit_of_measure, cost_price, saga_article_code")
    .eq("organisation_id", orgId)
    .eq("active", true)
    .order("name");

  const rows = (products ?? []) as Array<{
    id: string;
    name: string;
    unit_of_measure: string | null;
    cost_price: number | null;
    saga_article_code: string | null;
  }>;

  const withCode = rows.filter((r) => r.saga_article_code);
  const withoutCode = rows.filter((r) => !r.saga_article_code);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coduri articole Saga</CardTitle>
        <CardDescription>
          Necesare pentru importul NIR în Saga cu evidență cantitativ-valorică.
          Contabilul le găsește în Saga la <strong>Nomenclatoare → Articole</strong>.
          Câmpurile goale sunt permise — linia va fi importată fără cod de articol (global-valorică).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex gap-3 text-sm">
          <span className="text-reconciled font-medium">{withCode.length} cu cod</span>
          <span className="text-muted-foreground">{withoutCode.length} fără cod</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Niciun produs activ găsit.</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((product) => (
              <form
                key={product.id}
                action={updateAction}
                className="flex items-center gap-3 py-2.5"
              >
                <input type="hidden" name="product_id" value={product.id} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.unit_of_measure ?? "—"}
                    {product.cost_price != null && (
                      <span className="ml-2 text-muted-foreground">CMP: {Number(product.cost_price).toFixed(4)} lei</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Input
                    name="saga_article_code"
                    defaultValue={product.saga_article_code ?? ""}
                    placeholder="—"
                    className="w-36 h-8 text-sm"
                  />
                  <Button type="submit" variant="outline" size="sm" className="h-8">
                    OK
                  </Button>
                </div>
              </form>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Compliance checklist + document templates ──────────────────────────────

function ScreenChecklist({
  org,
}: {
  org: AccountingOrg | null;
}) {
  const orgName = canonicalCompanyName(org);
  const orgCui = canonicalCui(org);
  const cuiSet = Boolean(orgCui);
  const gestiuneSet = Boolean(org?.saga_gestiune_code);

  const items = [
    {
      done: cuiSet,
      label: "CUI firmă completat",
      detail: cuiSet ? orgCui : "Verifică firma prin ANAF în Business",
      href: "#business",
      action: "Setează CUI",
    },
    {
      done: gestiuneSet,
      label: "Cod gestiune Saga setat",
      detail: gestiuneSet ? org!.saga_gestiune_code! : "Cere contabilului codul din Nomenclatoare → Gestiuni",
      href: "#accountant",
      action: "Setează codul",
    },
    {
      done: true,
      label: "Metodă evaluare stoc: CMP",
      detail: "Costul mediu ponderat — calculat automat la fiecare NIR postat",
      href: "#accountant",
      action: "Vezi detalii",
    },
    {
      done: false,
      label: "Proceduri interne (OMFP 2634/2015 pct. 24)",
      detail: "Contabilul/administratorul semnează documentul care stabilește seria BC și responsabilul cu numerotarea",
      href: null,
      action: "Descarcă template",
      template: "procedures",
    },
    {
      done: false,
      label: "Politici contabile (OMFP 1802/2014 §2.5.1)",
      detail: "Contabilul confirmă că metoda CMP este documentată în politicile contabile anuale",
      href: null,
      action: "Descarcă template",
      template: "policies",
    },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Listă de verificare conformitate</CardTitle>
          <CardDescription>
            Elementele marcate cu ✓ sunt rezolvate automat de sistem. Celelalte necesită semnătura contabilului sau administratorului.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.label}
              className={`flex items-start gap-3 rounded-lg border p-3.5 ${item.done ? "border-reconciled/25 bg-reconciled/10" : "border-amber-100 bg-amber-50/40"}`}
            >
              <div className="mt-0.5 shrink-0">
                {item.done
                  ? <CheckCircle2 className="h-5 w-5 text-reconciled" />
                  : <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
              </div>
              {item.template === "procedures" && (
                <ProceduresTemplateButton orgName={orgName} orgCui={orgCui} />
              )}
              {item.template === "policies" && (
                <PoliciesTemplateButton orgName={orgName} orgCui={orgCui} />
              )}
              {!item.template && item.href && (
                <Link
                  href={item.href}
                  className="shrink-0 text-xs font-medium text-brass hover:underline whitespace-nowrap"
                >
                  {item.action} →
                </Link>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground px-1">
        Elementele fără bifă verde nu blochează utilizarea POS-ului. Sunt cerințe documentare
        pe care contabilul le gestionează independent de software.
      </p>
    </div>
  );
}

function ProceduresTemplateButton({ orgName, orgCui }: { orgName: string; orgCui: string }) {
  const content = `PROCEDURĂ INTERNĂ DE NUMEROTARE A DOCUMENTELOR FINANCIAR-CONTABILE
(conform OMFP 2634/2015, Anexa 1, pct. 4(3) și pct. 24)

Entitate: ${orgName || "_________________________"}
CUI: ${orgCui || "_________________________"}
Exercițiu financiar: ${new Date().getFullYear()}

1. DOCUMENTE ACOPERITE
   Bon de Consum Colectiv (formular 14-3-4/aA)

2. SERIE ȘI NUMEROTARE
   Serie: BC
   Primul număr al exercițiului: BC-${new Date().getFullYear()}-000001
   Format: BC-AAAA-NNNNNN (AAAA = an, NNNNNN = număr secvențial cu 6 cifre)
   Resetare: 1 ianuarie al fiecărui exercițiu financiar

3. FRECVENȚA EMITERII
   Un document pe zi calendaristică per gestiune,
   acoperind toate consumurile din rețete înregistrate în ziua respectivă.

4. IDENTIFICAREA ELECTRONICĂ (înlocuiește semnătura conform pct. 11)
   Sistemul informatic înregistrează utilizatorul autentificat care
   a generat documentul. Numele acestuia apare ca "Gestionar predător"
   pe documentul tipărit. Jurnalul de acces este păstrat în baza de date.

5. PERSOANA RESPONSABILĂ CU ALOCAREA NUMERELOR
   Rol: Administrator / Manager
   Nume: _________________________
   Data numirii: _________________________

6. DEPOZITARE
   Documentele se arhivează electronic, minim 5 ani,
   și pot fi tipărite la cerere pentru controale fiscale.

Aprobat:
Administrator: _________________________  Data: ___________
Contabil: _________________________      Data: ___________
`;
  return (
    <TemplateDownloadButton
      content={content}
      filename={`proceduri-interne-BC-${new Date().getFullYear()}.txt`}
      label="Descarcă"
    />
  );
}

function PoliciesTemplateButton({ orgName, orgCui }: { orgName: string; orgCui: string }) {
  const content = `POLITICI CONTABILE — EVALUAREA STOCURILOR
(conform OMFP 1802/2014, Secțiunea 2.5.1, pct. 60(2))

Entitate: ${orgName || "_________________________"}
CUI: ${orgCui || "_________________________"}
Exercițiu financiar: ${new Date().getFullYear()}

1. METODA DE EVALUARE LA IEȘIRE
   Metoda aleasă: COSTUL MEDIU PONDERAT (CMP) — varianta rulantă (post-recepție)

   Formula: CMP_după_recepție = (qty_stoc × CMP_anterior + qty_recepție × cost_recepție)
                                 / (qty_stoc + qty_recepție)

   CMP-ul se recalculează automat la fiecare recepție (NIR postat)
   și se aplică tuturor ieșirilor (bonuri de consum) până la următoarea recepție.

2. APLICABILITATE
   Această metodă se aplică tuturor categoriilor de stoc (materii prime,
   materiale consumabile) pentru care există evidență cantitativ-valorică.

3. CONSISTENȚA APLICĂRII
   Metoda CMP va fi aplicată consecvent pe tot parcursul exercițiului financiar.
   Orice modificare a metodei de evaluare constituie o schimbare de politică
   contabilă și se aplică prospectiv de la 1 ianuarie al exercițiului următor,
   cu menționare în notele explicative la situațiile financiare.

4. PREȚUL UNITAR PE BONUL DE CONSUM
   Prețul unitar afișat pe Bon de Consum reprezintă CMP la momentul consumului,
   calculat și înregistrat automat de sistemul informatic.

Aprobat:
Administrator: _________________________  Data: ___________
Contabil autorizat: ____________________  Data: ___________
`;
  return (
    <TemplateDownloadButton
      content={content}
      filename={`politici-contabile-CMP-${new Date().getFullYear()}.txt`}
      label="Descarcă"
    />
  );
}

// ── Stock valuation method (display-only) ──────────────────────────────────

function ScreenValuation({ countryCode }: { countryCode: string | null }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Metodă de evaluare a stocurilor</CardTitle>
          <CardDescription>
            Conform OMFP 1802/2014 §2.5.1, entitatea trebuie să aleagă și să aplice
            consecvent una dintre metodele permise.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-start gap-3 rounded-lg border-2 border-brass bg-accent p-4 cursor-default">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-brass bg-brass flex items-center justify-center shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-card" />
            </div>
            <div>
              <p className="font-semibold text-foreground">CMP — Costul Mediu Ponderat (rulant)</p>
              <p className="mt-1 text-sm text-mid">
                Recomandat pentru restaurante. Costul per ingredient se actualizează automat la
                fiecare recepție (NIR postat). Calculul este atomic și previne race conditions
                între recepții simultane.
              </p>
              <Badge className="mt-2 bg-accent text-foreground hover:bg-accent">Activ</Badge>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary p-4 opacity-60 cursor-not-allowed">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-border shrink-0" />
            <div>
              <p className="font-semibold text-mid">FIFO — Primul Intrat, Primul Ieșit</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Necesită urmărirea loturilor individuale per recepție. Indisponibil momentan —
                confirmați cu contabilul dacă este necesar pentru politicile contabile ale firmei.
              </p>
            </div>
          </label>

          <div className="rounded-lg bg-secondary border border-border p-3 text-xs text-muted-foreground">
            <strong>Notă:</strong> Alegerea metodei trebuie documentată în politicile contabile
            anuale ale firmei, semnate de administrator și contabil (OMFP 1802/2014).
            Descarcă template-ul din secțiunea{" "}
            <Link href="#accountant" className="text-brass underline">
              Contabilitate
            </Link>.
          </div>
        </CardContent>
      </Card>

      {countryCode === "RO" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SAF-T D406 — Stocuri</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Secțiunea Stocuri din D406 se depune doar la cererea ANAF (minimum 30 de zile
            preaviz). Datele necesare (mișcări stoc cu cost unitar la momentul mișcării) sunt
            deja înregistrate în sistem din momentul activării CMP.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
