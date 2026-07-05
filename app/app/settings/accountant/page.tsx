import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { hasEntitlement } from "@/lib/billing/entitlement-resolver";
import { SettingsTabNav } from "@/components/app/SettingsTabNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  updateSagaGestiuneCode,
  updateSiteSagaGestiuneCode,
  updateProductSagaCode,
} from "@/app/actions/accountant-settings";
import Link from "next/link";
import { redirect } from "next/navigation";

const TABS = [
  { id: "company",   label: "Date firmă" },
  { id: "products",  label: "Coduri produse" },
  { id: "checklist", label: "Lista de verificare" },
  { id: "valuation", label: "Metodă evaluare" },
];

type AccountingOrg = {
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

export default async function AccountantSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string; install?: string }>;
}) {
  const { supabase, orgId, countryCode } = await getKitchenOpsContext();
  const params = await searchParams;
  const tab = params?.tab ?? "company";
  const installingSaga = params?.install === "saga";

  const { data: org } = await supabase
    .from("organisations")
    .select("name, company_legal_name, company_address, anaf_cif, fiscalnet_cif, anaf_vat_registered, tax_id_verified, saga_export_enabled, saga_gestiune_code")
    .eq("id", orgId)
    .single();

  const orgRow = org as AccountingOrg | null;
  if (!orgRow?.saga_export_enabled) redirect("/app/settings?tab=integrations");
  if (!await hasEntitlement(orgId, "reports.accountant_pack")) redirect("/app/billing?reason=saga_requires_scale");

  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, city, address, saga_gestiune_code")
    .eq("organisation_id", orgId)
    .order("name");

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Configurare contabilitate</h1>
        <p className="mt-1 text-sm text-slate-500">
          Tot ce are nevoie contabilul tău pentru a conecta softul de contabilitate la datele POS.
        </p>
      </div>

      <SettingsTabNav tabs={TABS} />

      {installingSaga && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-950">Configurare Saga</CardTitle>
            <CardDescription className="text-blue-800">
              Completează pașii de mai jos doar dacă folosești exportul Saga. Datele POS rămân
              disponibile chiar dacă acest setup nu este finalizat.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-blue-900 sm:grid-cols-2">
            <div>1. Verifică CUI-ul firmei.</div>
            <div>2. Cere contabilului codul de gestiune Saga.</div>
            <div>3. Completează codurile articolelor pentru produse.</div>
            <div>4. Descarcă template-urile pentru proceduri și politici CMP.</div>
          </CardContent>
        </Card>
      )}

      {tab === "company" && (
        <ScreenCompany
          org={orgRow}
          sites={(sites ?? []) as AccountingSite[]}
          updateAction={updateSagaGestiuneCode}
          updateSiteAction={updateSiteSagaGestiuneCode}
        />
      )}
      {tab === "products" && (
        <ScreenProducts supabase={supabase} orgId={orgId} updateAction={updateProductSagaCode} />
      )}
      {tab === "checklist" && (
        <ScreenChecklist org={orgRow} />
      )}
      {tab === "valuation" && (
        <ScreenValuation countryCode={countryCode} />
      )}
    </div>
  );
}

// ── Screen 1: Company details + gestiune code ─────────────────────────────────

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
            <Label className="text-slate-500">Denumire legală firmă</Label>
            <Input value={orgName} readOnly className="bg-slate-50 text-slate-600" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-500">CUI (Cod de identificare fiscală)</Label>
            <Input
              value={orgCui}
              readOnly
              className="bg-slate-50 text-slate-600"
              placeholder="Necompletat — verifică firma în Business"
            />
            {!orgCui && (
              <p className="text-xs text-amber-600">
                CUI-ul nu este completat.{" "}
                <Link href="/app/settings?tab=business" className="underline">Verifică firma prin ANAF în Business →</Link>
              </p>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-slate-500">Adresă ANAF</Label>
              <Input value={org?.company_address ?? ""} readOnly className="bg-slate-50 text-slate-600" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-500">Status TVA</Label>
              <Input
                value={org?.anaf_vat_registered ? "Plătitor TVA" : "Neplătitor TVA"}
                readOnly
                className="bg-slate-50 text-slate-600"
              />
            </div>
          </div>
          {org?.tax_id_verified ? (
            <p className="text-xs text-green-700">Sursa legală: verificare ANAF salvată în Business.</p>
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
            <p className="mt-2 text-xs text-green-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Cod setat: <strong>{org.saga_gestiune_code}</strong>
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-400">
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
            <p className="text-sm text-slate-400">Nu există locații configurate.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {sites.map((site) => (
                <form
                  key={site.id}
                  action={updateSiteAction}
                  className="grid gap-3 py-3 sm:grid-cols-[1fr_11rem_auto] sm:items-end"
                >
                  <input type="hidden" name="site_id" value={site.id} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{site.name ?? "Locație"}</p>
                    <p className="truncate text-xs text-slate-500">
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

// ── Screen 3: Product Saga article codes ─────────────────────────────────────

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
    <div className="space-y-4">
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
            <span className="text-green-700 font-medium">{withCode.length} cu cod</span>
            <span className="text-slate-400">{withoutCode.length} fără cod</span>
          </div>

          {rows.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Niciun produs activ găsit.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map((product) => (
                <form
                  key={product.id}
                  action={updateAction}
                  className="flex items-center gap-3 py-2.5"
                >
                  <input type="hidden" name="product_id" value={product.id} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-400">
                      {product.unit_of_measure ?? "—"}
                      {product.cost_price != null && (
                        <span className="ml-2 text-slate-500">CMP: {Number(product.cost_price).toFixed(4)} lei</span>
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
    </div>
  );
}

// ── Screen 4: Compliance checklist + document templates ───────────────────────

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
      href: "/app/settings?tab=business",
      action: "Setează CUI",
    },
    {
      done: gestiuneSet,
      label: "Cod gestiune Saga setat",
      detail: gestiuneSet ? org!.saga_gestiune_code! : "Cere contabilului codul din Nomenclatoare → Gestiuni",
      href: "/app/settings/accountant?tab=company",
      action: "Setează codul",
    },
    {
      done: true,
      label: "Metodă evaluare stoc: CMP",
      detail: "Costul mediu ponderat — calculat automat la fiecare NIR postat",
      href: "/app/settings/accountant?tab=valuation",
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
              className={`flex items-start gap-3 rounded-lg border p-3.5 ${item.done ? "border-green-200 bg-green-50" : "border-amber-100 bg-amber-50/40"}`}
            >
              <div className="mt-0.5 shrink-0">
                {item.done
                  ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                  : <AlertCircle className="h-5 w-5 text-amber-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
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
                  className="shrink-0 text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
                >
                  {item.action} →
                </Link>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400 px-1">
        Elementele fără bifă verde nu blochează utilizarea POS-ului. Sunt cerințe documentare
        pe care contabilul le gestionează independent de software.
      </p>
    </div>
  );
}

// Client components for template downloads

import { TemplateDownloadButton } from "@/components/app/TemplateDownloadButton";

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

// ── Screen 2: Stock valuation method (display-only) ───────────────────────────

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
          <label className="flex items-start gap-3 rounded-lg border-2 border-blue-500 bg-blue-50 p-4 cursor-default">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">CMP — Costul Mediu Ponderat (rulant)</p>
              <p className="mt-1 text-sm text-slate-600">
                Recomandat pentru restaurante. Costul per ingredient se actualizează automat la
                fiecare recepție (NIR postat). Calculul este atomic și previne race conditions
                între recepții simultane.
              </p>
              <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Activ</Badge>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-60 cursor-not-allowed">
            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-slate-300 shrink-0" />
            <div>
              <p className="font-semibold text-slate-600">FIFO — Primul Intrat, Primul Ieșit</p>
              <p className="mt-1 text-sm text-slate-500">
                Necesită urmărirea loturilor individuale per recepție. Indisponibil momentan —
                confirmați cu contabilul dacă este necesar pentru politicile contabile ale firmei.
              </p>
            </div>
          </label>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
            <strong>Notă:</strong> Alegerea metodei trebuie documentată în politicile contabile
            anuale ale firmei, semnate de administrator și contabil (OMFP 1802/2014).
            Descarcă template-ul din tab-ul{" "}
            <Link href="/app/settings/accountant?tab=checklist" className="text-blue-600 underline">
              Listă de verificare
            </Link>.
          </div>
        </CardContent>
      </Card>

      {countryCode === "RO" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">SAF-T D406 — Stocuri</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Secțiunea Stocuri din D406 se depune doar la cererea ANAF (minimum 30 de zile
            preaviz). Datele necesare (mișcări stoc cu cost unitar la momentul mișcării) sunt
            deja înregistrate în sistem din momentul activării CMP.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
