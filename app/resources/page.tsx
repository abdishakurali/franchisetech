import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Scale, CreditCard, ListChecks, MapPin, Wifi, type LucideIcon } from "lucide-react";
import { CTASection } from "@/components/marketing/MarketingShell";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";

export const metadata: Metadata = {
  title: "Ghiduri POS și închidere zilnică | franchisetech",
  description:
    "Ghiduri practice pentru configurarea POS, produse, TVA, FiscalNet, închiderea zilnică și raportare.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Ghiduri POS și închidere zilnică | franchisetech",
    description:
      "Ghiduri practice și liste de verificare pentru cafenele, restaurante, retail și afaceri de servicii care folosesc franchisetech.",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type ResourceCard = {
  icon: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  href: string;
  cta: string;
};

const GETTING_STARTED: ResourceCard[] = [
  {
    icon: "✅",
    category: "Primii pași",
    title: "Listă de verificare configurare POS",
    summary: "Listă pas cu pas ca să pregătiți casa de marcat — produse, personal, plăți, bonuri și o vânzare de test.",
    readTime: "3 min citire",
    href: "#pos-setup",
    cta: "Citește lista",
  },
  {
    icon: "🛒",
    category: "Primii pași",
    title: "Ghid configurare produse și meniu",
    summary: "Cum adăugați produse, creați categorii, setați prețuri și cote TVA și activați disponibilitatea în POS.",
    readTime: "4 min citire",
    href: "#product-setup",
    cta: "Citește ghidul",
  },
  {
    icon: "👥",
    category: "Primii pași",
    title: "Listă de verificare permisiuni personal",
    summary: "Setați rolurile potrivite pentru casieri și manageri — retururi, mișcări de numerar, setări și acces la audit.",
    readTime: "2 min citire",
    href: "#staff-permissions",
    cta: "Citește lista",
  },
  {
    icon: "🗓️",
    category: "Primii pași",
    title: "Listă de verificare închidere zilnică",
    summary: "Ce faceți la finalul zilei — numărați numerarul, revizuiți vânzările, verificați retururile și exportați totalurile.",
    readTime: "2 min citire",
    href: "#daily-close",
    cta: "Citește lista",
  },
  {
    icon: "🔁",
    category: "Primii pași",
    title: "Cum migrezi de la Ebriza la franchisetech",
    summary: "Comparație de preț reală și cum rulați un test paralel gratuit înainte să mutați fluxul principal.",
    readTime: "6 min citire",
    href: "/compare/ebriza",
    cta: "Citește ghidul",
  },
  {
    icon: "🧾",
    category: "Primii pași",
    title: "SmartBill + franchisetech — folosite împreună",
    summary: "SmartBill rămâne pentru facturare; franchisetech acoperă POS, stoc, NIR și închiderea de zi.",
    readTime: "4 min citire",
    href: "/compare/smartbill",
    cta: "Citește ghidul",
  },
];

const INDUSTRY_GUIDES: ResourceCard[] = [
  { icon: "☕", category: "Ghiduri pe domenii", title: "Ghid POS pentru cafenele",            summary: "Cum se potrivește franchisetech cu ritmul zilnic al unei cafenele aglomerate — comenzi, numerar și închidere de zi.",       readTime: "5 min citire", href: "#guide-cafes",        cta: "Citește ghidul" },
  { icon: "🥡", category: "Ghiduri pe domenii", title: "Ghid POS pentru takeaway",       summary: "Introducere rapidă a comenzilor, reduceri, retururi și control de numerar pentru afaceri cu volum mare.",        readTime: "4 min citire", href: "#guide-takeaways",    cta: "Citește ghidul" },
  { icon: "🥐", category: "Ghiduri pe domenii", title: "Ghid POS pentru patiserii/brutării",        summary: "Vindeți produse proaspete, gestionați aglomerația de dimineață, urmăriți cele mai vândute produse și stocul de deschidere.",          readTime: "4 min citire", href: "#guide-bakeries",     cta: "Citește ghidul" },
  { icon: "🚚", category: "Ghiduri pe domenii", title: "Ghid POS pentru food truck",     summary: "POS compact pentru configurări mobile — funcționează ca PWA, cu variantă manuală de rezervă și raportare zilnică simplă.",          readTime: "4 min citire", href: "#guide-foodtrucks",   cta: "Citește ghidul" },
  { icon: "🛍️", category: "Ghiduri pe domenii", title: "Ghid POS pentru magazine retail",   summary: "Catalog de produse, reduceri, bonuri, permisiuni personal și tablou de bord zilnic pentru magazine.",      readTime: "4 min citire", href: "#guide-retail",       cta: "Citește ghidul" },
  { icon: "✂️", category: "Ghiduri pe domenii", title: "Ghid POS pentru saloane și frizerii", summary: "Vânzare de servicii și produse, atribuire pe angajat, urmărire numerar și checkout prietenos pentru clienți.",           readTime: "4 min citire", href: "#guide-salons",       cta: "Citește ghidul" },
  { icon: "🏢", category: "Ghiduri pe domenii", title: "Ghid POS pentru francize",      summary: "Standardizați meniuri, roluri și raportare pe mai multe locații cu franchisetech.",                    readTime: "5 min citire", href: "#guide-franchises",   cta: "Citește ghidul" },
];

const OPS_CHECKLISTS: ResourceCard[] = [
  { icon: "🌅", category: "Operațiuni", title: "Listă de verificare deschidere",                  summary: "Începeți ziua corect — deschideți casa, introduceți numerarul de deschidere, verificați produsele și informați echipa.",                readTime: "2 min citire", href: "#opening-checklist",  cta: "Vezi lista" },
  { icon: "🌙", category: "Operațiuni", title: "Listă de verificare închidere",                  summary: "Închideți casa, numărați numerarul, reconciliați suma așteptată cu cea reală și exportați totalurile zilnice.",                  readTime: "2 min citire", href: "#closing-checklist",  cta: "Vezi lista" },
  { icon: "💵", category: "Operațiuni", title: "Listă de verificare intrări/ieșiri numerar",       summary: "Înregistrați toate mișcările de numerar din timpul zilei — alimentare fond de casă, plăți furnizori și cheltuieli mărunte.",            readTime: "2 min citire", href: "#cash-inout",         cta: "Vezi lista" },
  { icon: "↩️", category: "Operațiuni", title: "Listă de verificare retururi și anulări",        summary: "Cum gestionați corect retururile și anulările, cu permisiunile potrivite și înregistrări clare.",                readTime: "3 min citire", href: "#refunds-voids",      cta: "Vezi lista" },
  { icon: "🔄", category: "Operațiuni", title: "Listă de verificare predare tură",     summary: "Ce trebuie comunicat între ture — numerar disponibil, comenzi deschise, probleme și observații.",                      readTime: "2 min citire", href: "#shift-handover",     cta: "Vezi lista" },
  { icon: "📊", category: "Operațiuni", title: "Listă de verificare raportare de final de zi",     summary: "Revizuiți vânzările zilnice, totalurile TVA, produsele cele mai vândute, retururile și exportați raportul Z.",                        readTime: "3 min citire", href: "#eod-reporting",      cta: "Vezi lista" },
];

const HARDWARE: ResourceCard[] = [
  { icon: "🖨️",  category: "Hardware și plăți", title: "Bazele imprimantei de bonuri",        summary: "Ce imprimante de bonuri funcționează cu franchisetech și cum le configurați pe conexiune LAN sau USB.",            readTime: "4 min citire", href: "#receipt-printer", cta: "Citește ghidul" },
  { icon: "💳",  category: "Hardware și plăți", title: "Planificare terminal de plată",     summary: "Cum planificați terminale de plată cu cardul alături de franchisetech — stadiul actual și la ce să vă așteptați.",               readTime: "3 min citire", href: "#payment-terminals", cta: "Citește ghidul" },
  { icon: "🔍",  category: "Hardware și plăți", title: "Listă de verificare compatibilitate hardware", summary: "Cum verificați dispozitivele și hardware-ul fiscal înainte de lansare.", readTime: "3 min citire", href: "#hardware", cta: "Vezi lista" },
];

const GROWTH: ResourceCard[] = [
  { icon: "📈", category: "Creștere și rapoarte", title: "Înțelegerea vânzărilor zilnice",      summary: "Cum citiți raportul zilnic de vânzări, identificați tendințe și acționați pe baza datelor din franchisetech.",               readTime: "4 min citire", href: "#daily-sales",        cta: "Citește ghidul" },
  { icon: "🏆", category: "Creștere și rapoarte", title: "Urmărirea produselor cele mai vândute",      summary: "Folosiți rapoartele de performanță ca să identificați cele mai vândute produse și să ajustați meniul sau stocul.",              readTime: "3 min citire", href: "#best-sellers",       cta: "Citește ghidul" },
  { icon: "🧑‍💼", category: "Creștere și rapoarte", title: "Responsabilizarea personalului prin POS",    summary: "Cum rolurile personalului, înregistrările tranzacțiilor și vizibilitatea auditului creează responsabilizare în echipă.",          readTime: "3 min citire", href: "#staff-accountability", cta: "Citește ghidul" },
  { icon: "🏬", category: "Creștere și rapoarte", title: "Raportare pentru mai multe locații",            summary: "Cum structurează franchisetech raportarea pe mai multe locații sau puncte de lucru.",           readTime: "4 min citire", href: "#multi-location",     cta: "Citește ghidul" },
  { icon: "🚀", category: "Creștere și rapoarte", title: "Pregătirea pentru extindere",      summary: "Ce trebuie standardizat înainte de extindere — meniuri, roluri, raportare și fluxuri operaționale.",               readTime: "5 min citire", href: "#franchise-growth",   cta: "Citește ghidul" },
];

const FAQ = [
  {
    q: "Pentru ce afaceri este construit franchisetech?",
    a: "franchisetech este construit pentru cafenele, restaurante, takeaway, patiserii/brutării, food truck-uri, magazine retail, saloane, frizerii și operatori de francize. Orice afacere locală în creștere care are nevoie de un POS practic și evidențe zilnice clare se potrivește.",
  },
  {
    q: "Funcționează franchisetech pe tabletă?",
    a: "Da. POS-ul este o aplicație web progresivă (PWA) care funcționează în browsere moderne suportate, pe tabletă sau desktop. Compatibilitatea cu hardware-ul fiscal trebuie verificată la configurare.",
  },
  {
    q: "franchisetech este potrivit pentru mai multe locații?",
    a: "Da. Fiecare locație este un workspace separat, cu produse, personal, sesiuni de casă și rapoarte proprii. Proprietarii pot păstra cataloage de produse și raportare consistente pe toate locațiile.",
  },
  {
    q: "Pot urmări ingredientele și calcula marjele pe rețete?",
    a: "Da. Adăugați ingredientele ca articole de stoc, legați-le de rețete, iar franchisetech calculează costul per porție, procentul marjei brute și câte porții puteți face din stocul curent.",
  },
  {
    q: "Pot importa produsele pe care le am deja?",
    a: "Da. Descărcați un șablon CSV, completați produsele și importați-le. Importul este disponibil pentru produse, ingrediente, furnizori, achiziții, rețete și clienți.",
  },
];

// ─── Reusable card component (inline) ─────────────────────────────────────────

function Card({ card }: { card: ResourceCard }) {
  return (
    <Link
      href={card.href}
      className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-brass/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">{card.icon}</span>
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{card.category}</span>
      </div>
      <h3 className="font-semibold text-foreground">{card.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-muted-foreground">{card.summary}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{card.readTime}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brass">
          {card.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
      {text}
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <ClaudeMarketingShellAuth>
      {/* ── HERO ── */}
      <section className="bg-card px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-brass">Resurse</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Resurse ca să conduceți mai bine afacerea
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-mid">
            Ghiduri, liste de verificare și sfaturi practice pentru cafenele, restaurante, magazine și echipe de servicii care folosesc franchisetech.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["#getting-started", "Primii pași"],
              ["#industry-guides", "Ghiduri pe domenii"],
              ["#operations",      "Operațiuni"],
              ["#hardware",        "Hardware și plăți"],
              ["#growth",          "Creștere și rapoarte"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-mid hover:border-brass/40 hover:text-brass"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO GUIDES (indexable articles) ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="Ghiduri POS și restaurant (România și internațional)"
            subtitle="Ghiduri căutabile cu comparații, liste de verificare și evaluări oneste ale furnizorilor."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { href: "/compare", title: "Compară software POS", summary: "SmartBill, Saga, RezoSoft, Square — logo-uri și tabele de funcționalități.", icon: Scale },
                { href: "/resources/pos-software-romania", title: "Software POS România", summary: "FiscalNet, TVA, stoc și raport Z pentru restaurante.", icon: CreditCard },
                { href: "/resources/choose-pos-romania", title: "Checklist alegere POS", summary: "Evaluare onestă în 5 pași pentru proprietari RO.", icon: ListChecks },
                { href: "/industries/romania", title: "POS pentru România", summary: "lei, TVA, FiscalNet, echipă nelimitată.", icon: MapPin },
                { href: "/compare/smartbill", title: "vs SmartBill", summary: "Facturare vs operațiuni zilnice — comparație onestă.", logo: "/compare/logos/smartbill.png" },
                { href: "/help/romania-fiscalnet", title: "Ghid FiscalNet", summary: "Configurare pas cu pas pentru bonuri fiscale.", icon: Wifi },
              ] as Array<{ href: string; title: string; summary: string; icon?: LucideIcon; logo?: string }>
            ).map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-brass/40 hover:shadow-md"
              >
                <div className="relative flex aspect-[16/9] items-center justify-center bg-secondary">
                  {card.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={card.logo} alt="" className="h-10 w-auto opacity-90 transition group-hover:opacity-100" />
                  ) : (
                    card.icon && <card.icon className="h-9 w-9 text-brass" strokeWidth={1.5} aria-hidden />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground group-hover:text-brass">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{card.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GETTING STARTED ── */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="getting-started"
            title="Primii pași"
            subtitle="Tot ce aveți nevoie ca să porniți franchisetech pentru afacerea dvs."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GETTING_STARTED.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── INDUSTRY GUIDES ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="industry-guides"
            title="Ghiduri pe domenii"
            subtitle="Cum se potrivește franchisetech cu operațiunile zilnice ale unor tipuri specifice de afaceri."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRY_GUIDES.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── OPERATIONS ── */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="operations"
            title="Liste de verificare — operațiuni"
            subtitle="Liste zilnice ca echipa și casa de marcat să funcționeze constant."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {OPS_CHECKLISTS.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── HARDWARE ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="hardware"
            title="Hardware și plăți"
            subtitle="Înțelegeți opțiunile de hardware, ce funcționează și la ce să vă așteptați."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HARDWARE.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── GROWTH ── */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="growth"
            title="Creștere și rapoarte"
            subtitle="Folosiți datele din franchisetech ca să înțelegeți performanța și să planificați creșterea."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GROWTH.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GUIDE CONTENT — anchored sections
      ══════════════════════════════════════════════════════════════════════ */}

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-20">

          {/* ── POS SETUP CHECKLIST ── */}
          <article id="pos-setup" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Primii pași</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Listă de verificare configurare POS</h2>
            <p className="mt-3 text-mid">
              Urmați această listă când configurați franchisetech prima dată, ca să vă asigurați că este pregătit pentru folosirea reală.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Adăugați numele și datele afacerii în Setări",
                "Adăugați categoriile de produse (ex. Cafea, Mâncare, Băuturi)",
                "Adăugați cel puțin câteva produse cu prețuri și cote TVA",
                "Marcați fiecare produs ca disponibil în POS dacă vreți să apară la casă",
                "Adăugați utilizatori din personal și atribuiți roluri (casier sau manager)",
                "Configurați metodele de plată (numerar, card și orice tip personalizat folosiți)",
                "Configurați cotele TVA dacă vindeți articole la cote diferite",
                "Configurați preferințele de bon dacă folosiți o imprimantă de bonuri",
                "Rulați o vânzare de test și procesați un retur de test ca să confirmați că totul funcționează",
                "Verificați rapoartele după vânzarea de test ca să confirmați că datele apar corect",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── DAILY CLOSE CHECKLIST ── */}
          <article id="daily-close" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Primii pași</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Listă de verificare închidere zilnică</h2>
            <p className="mt-3 text-mid">
              Parcurgeți această listă la finalul fiecărei zile de lucru ca să închideți corect și să păstrați evidențe clare.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Revizuiți raportul de vânzări de azi — vânzări totale, număr tranzacții și defalcare pe metodă de plată",
                "Numărați numerarul fizic din sertar",
                "Comparați numerarul numărat cu suma așteptată din franchisetech",
                "Înregistrați orice mișcare de numerar neînregistrată în timpul zilei (ieșiri numerar, ajustări fond de casă)",
                "Verificați retururile sau anulările — confirmați că au fost autorizate și înregistrate corect",
                "Revizuiți activitatea personalului dacă e relevant — cine a procesat tranzacții, retururi sau mișcări de numerar",
                "Închideți sesiunea de casă ca să blocați evidențele zilei",
                "Exportați sau salvați o captură a raportului Z / rezumatului de închidere pentru evidențele dvs.",
                "Notați problemele de stoc sau modificările de produse necesare pentru mâine",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── STAFF PERMISSIONS ── */}
          <article id="staff-permissions" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Primii pași</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Listă de verificare permisiuni personal</h2>
            <p className="mt-3 text-mid">
              Setați nivelurile corecte de acces pentru fiecare membru al echipei înainte să înceapă să folosească franchisetech.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-secondary p-5">
                <h3 className="font-semibold text-foreground">Rol casier</h3>
                <ul className="mt-3 space-y-1.5">
                  {[
                    "Acces la casa de marcat",
                    "Poate procesa vânzări și bonuri",
                    "Poate aplica reduceri preconfigurate",
                    "Poate înregistra datele clientului",
                    "Nu are acces la setări sau configurări financiare",
                  ].map((item) => <CheckItem key={item} text={item} />)}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-secondary p-5">
                <h3 className="font-semibold text-foreground">Rol manager</h3>
                <ul className="mt-3 space-y-1.5">
                  {[
                    "Tot accesul de casier",
                    "Poate procesa retururi și anulări",
                    "Poate înregistra intrări/ieșiri de numerar",
                    "Acces la rapoarte și istoricul tranzacțiilor",
                    "Poate accesa setările dacă proprietarul permite",
                    "Vizibilitate jurnal de audit",
                  ].map((item) => <CheckItem key={item} text={item} />)}
                </ul>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-brass/25 bg-accent p-4 text-sm text-foreground">
              <strong>Bună practică:</strong> Atribuiți minimul de permisiuni necesar pentru fiecare rol. Revizuiți periodic permisiunile pe măsură ce echipa se schimbă.
            </div>
          </article>

          {/* ── HARDWARE CHECKLIST ── */}
          <article id="hardware" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Hardware și plăți</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Listă de verificare compatibilitate hardware</h2>
            <p className="mt-3 text-mid">
              Confirmați dispozitivele suportate și hardware-ul fiscal la configurare, înainte de a folosi franchisetech cu clienți reali.
            </p>
            <h3 className="mt-6 font-semibold text-foreground">Verificați înainte de lansare</h3>
            <ul className="mt-3 space-y-2">
              {[
                "Un browser modern suportat pe dispozitivul de casă",
                "Acces stabil la rețeaua locală acolo unde hardware-ul fiscal îl cere",
                "O casă de marcat sau imprimantă fiscală compatibilă, certificată în România",
                "FiscalNet instalat și testat local pentru bonuri fiscale",
                "Grupe TVA și mapări de plată corecte",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Notă:</strong> franchisetech nu pretinde compatibilitate cu orice dispozitiv sau casă de marcat fiscală. Confirmați configurația exactă cu echipa de suport.
            </div>
          </article>

          {/* ── INDUSTRY: CAFÉS ── */}
          <article id="guide-cafes" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru cafenele</h2>
            <p className="mt-3 text-mid">
              franchisetech se potrivește natural cu ritmul unei tejghele de cafenea — introducere rapidă a comenzilor, urmărire numerar și card, și o închidere de zi clară.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Configurați categorii de produse: Băuturi calde, Băuturi reci, Mâncare, Patiserie",
                "Adăugați opțiuni (ex. tip de lapte, mărime) ca produse separate sau variante",
                "Folosiți grila rapidă de produse ca să aveți articolele populare la îndemână",
                "Rulați plăți combinate numerar/card sau separați-le ca metode de plată diferite",
                "Înregistrați fondul de casă de deschidere și mișcările de numerar din timpul zilei",
                "Verificați vânzările zilnice la închidere ca să vedeți venitul total, cele mai vândute produse și soldul de numerar",
                "Urmăriți ingredientele (lapte, cafea boabe, siropuri) pentru vizibilitate stoc și cost rețete",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: TAKEAWAYS ── */}
          <article id="guide-takeaways" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru takeaway</h2>
            <p className="mt-3 text-mid">
              Viteza contează cel mai mult la fast-food. franchisetech păstrează checkout-ul rapid și vă dă controlul de numerar necesar.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Păstrați grila de produse simplă — grupați pe tip de meniu sau combinații populare",
                "Adăugați note la comandă pentru instrucțiuni de bucătărie per tranzacție",
                "Folosiți reduceri pentru meniuri, oferte de fidelitate sau reduceri de final de zi",
                "Înregistrați regulat intrările/ieșirile de numerar în perioadele aglomerate ca fondul de casă să rămână corect",
                "Procesați retururi rapid, fără să părăsiți ecranul POS",
                "Folosiți raportul de închidere ca să revizuiți încasările pe numerar și card",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: BAKERIES ── */}
          <article id="guide-bakeries" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru patiserii/brutării</h2>
            <p className="mt-3 text-mid">
              Patiseriile au nevoie de viteză la tejghea, date clare despre cele mai vândute produse și vizibilitate bună a stocului la deschiderea fiecărei zile.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Organizați produsele pe categorii: Pâine, Patiserie, Prăjituri, Băuturi",
                "Marcați rapid produsele ca epuizate în timpul zilei când stocul scade",
                "Folosiți rapoartele de performanță ca să vedeți ce produse se vând cel mai rapid dimineața",
                "Urmăriți materiile prime (făină, unt, ouă) ca să înțelegeți costurile ingredientelor",
                "Construiți rețete pentru produsele cheie ca să vedeți costul pe unitate și marja brută",
                "Revizuiți stocul de deschidere în fiecare dimineață ca să planificați producția zilei",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: FOOD TRUCKS ── */}
          <article id="guide-foodtrucks" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru food truck</h2>
            <p className="mt-3 text-mid">
              franchisetech rulează ca PWA pe orice dispozitiv, ideal pentru configurări mobile cu hardware limitat.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Instalați franchisetech ca PWA pe telefon sau tabletă pentru acces portabil la casă",
                "Rulați POS-ul din browser pe telefon sau tabletă, fără instalare suplimentară",
                "Păstrați lista de produse scurtă și concentrată pe meniul zilei",
                "Folosiți intrări/ieșiri de numerar ca să înregistrați fondul de deschidere și orice mișcare de rest",
                "Revizuiți totalul zilnic la finalul fiecărui eveniment",
                "Exportați înregistrările tranzacțiilor pentru contabilitate corectă după fiecare zi de eveniment",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: RETAIL ── */}
          <article id="guide-retail" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru magazine retail</h2>
            <p className="mt-3 text-mid">
              franchisetech gestionează catalogul de produse, reducerile, bonurile și raportarea zilnică de care au nevoie magazinele retail.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Adăugați întreaga gamă de produse pe categorii (ex. Îmbrăcăminte, Accesorii, Cadouri)",
                "Setați prețuri de vânzare, prețuri standard și aplicați reduceri la punctul de vânzare",
                "Emiteți bonuri pentru toate tranzacțiile — important pentru gestionarea retururilor și garanțiilor",
                "Folosiți permisiunile de personal ca să controlați cine poate procesa retururi sau accesa rapoarte",
                "Verificați zilnic tabloul de bord al vânzărilor ca să vedeți ce linii de produse performează",
                "Folosiți funcția de import ca să încărcați cataloage mari de produse dintr-un fișier",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: SALONS ── */}
          <article id="guide-salons" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru saloane și frizerii</h2>
            <p className="mt-3 text-mid">
              Saloanele și frizeriile vând o combinație de servicii și produse. franchisetech gestionează ambele într-un checkout simplu.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Adăugați serviciile ca produse (ex. Tuns, Vopsit, Coafat) cu prețuri fixe",
                "Adăugați produsele de vânzare (șampon, produse de styling) într-o categorie separată",
                "Atașați numele clienților la tranzacții pentru urmărirea de bază a programărilor",
                "Înregistrați ce membru al echipei a efectuat fiecare serviciu, pentru atribuire",
                "Folosiți numerar și card ca metode de plată separate pentru o reconciliere zilnică precisă",
                "Verificați totalurile de final de zi per angajat ca să înțelegeți performanța individuală",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: FRANCHISES ── */}
          <article id="guide-franchises" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-brass">Ghid pe domeniu</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Ghid POS pentru francize și operatori cu mai multe locații</h2>
            <p className="mt-3 text-mid">
              franchisetech susține afacerile cu mai multe locații prin configurări consistente de produse, acces pe roluri pentru personal și raportare la nivel de locație.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Creați un workspace separat pentru fiecare locație, cu produse și personal propriu",
                "Folosiți o denumire și o structură de categorii consistentă la toate locațiile",
                "Atribuiți roluri de manager la fiecare locație responsabililor locali",
                "Revizuiți separat rapoartele zilnice ale fiecărei locații pentru comparație de performanță",
                "Folosiți aceeași configurare a metodelor de plată la toate locațiile pentru raportare consistentă",
                "Exportați datele tranzacțiilor per locație pentru contabilitate consolidată",
                "Planificați actualizările de produse central, înainte de a le trimite către locațiile individuale",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="bg-secondary px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground">Întrebări frecvente</h2>
          <p className="mt-2 text-muted-foreground">Răspunsuri oneste despre cum funcționează franchisetech și ce presupune.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERNAL LINKS ── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Pagini asociate:</span>
            {[
              ["/compare",                   "Compară POS"],
              ["/resources/pos-software-romania", "Ghid POS România"],
              ["/",                          "← Acasă"],
              ["/features/pos",              "Casă de marcat"],
              ["/features/z-report",         "Raport Z"],
              ["/pricing",                   "Prețuri"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-lg border border-border px-3 py-1.5 text-sm text-brass hover:border-brass/40 hover:underline">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Gata să vă simplificați operațiunile zilnice?" />
    </ClaudeMarketingShellAuth>
  );
}
