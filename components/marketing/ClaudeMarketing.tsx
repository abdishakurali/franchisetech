"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CreditCard, Package, Wifi, Receipt, FileBarChart, MailCheck, ShieldCheck, Building2 } from "lucide-react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { pricingPlans } from "@/lib/billing/plans";
import { HomeFlowDiagram } from "@/components/marketing/HomeFlowDiagram";
import { PRIMARY_INDUSTRY_NAV, PRIMARY_INDUSTRY_SLUGS, type PrimaryIndustrySlug } from "@/lib/marketing/industry-verticals";
import { primaryIndustryPages } from "@/lib/marketing/industry-page-content";
import { localizeSeoPage } from "@/lib/marketing/i18n";
import s from "./ClaudeMarketing.module.css";

const pages = [["/", "Acasă"], ["/features", "Funcționalități"], ["/industries", "Industrii"], ["/features/echipamente", "Echipamente"], ["/pricing", "Prețuri"], ["/compare", "Comparații"], ["/blog", "Ghiduri"], ["/contact", "Contact"]] as const;

export type ClaudeMarketingUser = { displayName: string; initials: string };

export function DesignTrialLink({ location, plan = "free", children = "Creați cont gratuit" }: { location: string; plan?: "starter" | "pro" | "free" | "growth" | "team"; children?: ReactNode }) {
  return <Link className={s.button} href={`/signup?plan=${plan}`} onClick={() => captureClientEvent("cta_clicked", { location, destination: `/signup?plan=${plan}` })}>{children}</Link>;
}

export function ClaudeMarketingShell({ children, user = null }: { children: ReactNode; user?: ClaudeMarketingUser | null }) {
  const pathname = usePathname();
  useEffect(() => {
    // Supabase's admin-generated activation links (accountant-partner welcome
    // email) can fall back to the project's bare Site URL instead of the
    // requested redirectTo when that path isn't on the auth redirect
    // allow-list — landing here with #access_token still in the fragment
    // instead of on the page that actually consumes it.
    if (window.location.hash.includes("access_token=") && window.location.hash.includes("refresh_token=")) {
      window.location.replace(`/partner-dashboard/activate${window.location.hash}`);
    }
  }, []);
  const links = pages.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); captureClientEvent("nav_link_clicked", { label, href, location: "design_navigation" }); }}>{label}</Link>);
  const accountLinks = user
    ? <><Link href="/app">Panou</Link><Link href="/app/profile" className="inline-block max-w-[160px] truncate align-bottom">{user.displayName}</Link></>
    : <><Link href="/login">Autentificare</Link><Link href="/signup?plan=free">Cont gratuit</Link></>;
  return <div className={s.site}>
    <header className={s.header}><div className={`${s.container} ${s.headerInner}`}>
      <Link href="/" aria-label="FranchiseTech — Acasă"><Image src="/design-marketing/franchise-tech-logo.svg" alt="FranchiseTech" width={190} height={26} className={s.logo} priority /></Link>
      <nav className={s.nav} aria-label="Navigare principală">{links}</nav>
      <div className={s.account}>{accountLinks}</div>
      <details className={s.mobile}><summary aria-label="Deschide meniul">Meniu</summary><nav className={s.nav} aria-label="Navigare mobilă">{links}{accountLinks}</nav></details>
    </div></header>
    <main>{children}</main>
    <footer className={s.footer}><div className={`${s.container} ${s.footerInner}`}>
      <Link href="/"><Image src="/design-marketing/franchise-tech-logo.svg" alt="FranchiseTech" width={190} height={26} className={s.logo} /></Link>
      <span>franchisetech.ro · suport în română</span>
      <nav className={s.footerLinks} aria-label="Informații legale"><Link href="/pentru-contabili">Pentru contabili</Link><Link href="/privacy">Confidențialitate</Link><Link href="/terms">Termeni</Link><Link href="/contact">Contact</Link></nav>
    </div></footer>
  </div>;
}

export function DesignFinalCta() {
  return <section id="final-cta" className={s.glow}><div className={`${s.container} ${s.finalCta}`}>
    <h2>Începe cu rețetele tale. Vezi cifrele în aceeași zi.</h2>
    <p className={s.lead}>Adaugă produsele din ce ai acum — Excel sau alt POS. Te ghidăm la primii pași. Gratuit pentru totdeauna, fără card.</p>
    <div className={s.actions}><DesignTrialLink location="marketing_final" /><Link href="/contact" className={`${s.button} ${s.secondary}`}>Vorbește cu noi</Link></div>
  </div></section>;
}

function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return <section className={s.dark}><div className={`${s.container} ${s.pageHero}`}><p className={s.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={s.lead}>{children}</p></div></section>;
}

const modules = [
  { title: "POS", body: "Ecranul de vânzare: produse pe categorii, bon curent, numerar sau card. Merge și offline, cu coadă locală.", items: ["vânzare rapidă", "offline", "reduceri", "stornare"] },
  { title: "Produse", body: "Catalog cu categorii, prețuri și cote TVA. Import din Excel sau din alt POS la început.", items: ["categorii", "import CSV", "cote TVA"] },
  { title: "Rețete și costuri", body: "Ce intră în fiecare produs, cu cost calculat din recepții reale. Food cost și marjă pe meniu.", items: ["cost din recepții", "food cost %", "rețetar", "deviz"] },
  { title: "Stoc", body: "Cantități, praguri de minim, fișă de magazie pe articol și istoricul complet al mișcărilor.", items: ["fișă de magazie", "praguri", "inventar"] },
  { title: "Recepții și furnizori", body: "NIR cu constatare de diferențe, facturi de la furnizori, prețuri de achiziție care alimentează costul.", items: ["NIR", "bon de consum", "furnizori"] },
  { title: "Închidere casă", body: "Fond de deschidere, vânzări pe metodă de plată, numerar numărat și diferența — plus registrul de casă.", items: ["raport Z", "registru de casă", "diferență numerar"] },
  { title: "Rapoarte", body: "Vânzări, TVA, stoc, marje și consum teoretic vs. real. Tipărite sau exportate pentru contabil.", items: ["PDF", "CSV", "pentru contabil"] },
];

export function DesignFeatures() {
  return <>
    <PageHero eyebrow="Funcționalități" title="Șapte module. Un singur loc pentru ziua de lucru.">De la prima vânzare la închiderea casei. Core acoperă vânzarea și rapoartele zilei; Operations adaugă stoc, achiziții și rețete.</PageHero>
    <section className={`${s.container} ${s.pageSection}`}><div className={s.grid}>{modules.map((module, index) => <article className={s.card} key={module.title}><div className={s.cardTitle}><span className={s.number}>0{index + 1}</span><h2>{module.title}</h2></div><p className={s.body}>{module.body}</p><div className={s.tags}>{module.items.map((item) => <span key={item}>{item}</span>)}</div></article>)}</div></section>
    <DesignFinalCta />
  </>;
}

export function DesignHome() {
  const highlights = [
    ["Vinzi în câteva atingeri", "Produsele direct pe ecran, cu TVA-ul pe fiecare linie. Numerar sau card — două butoane pentru încasare.", "/marketing/live/pos.png"],
    ["Costul apare din rețetă, nu din memorie", "Treci o dată gramajele. Costurile din recepții alimentează rețetele, folosind metoda de calcul configurată în aplicație.", "/marketing/live/recipes.png"],
    ["Stocul se mișcă singur", "Recepții cu NIR, bonuri de consum, fișă de magazie pe articol. Vezi ce e sub minim înainte să rămâi fără.", "/marketing/live/stock.png"],
    ["Marja, nu doar încasarea", "Food cost pe produs, marjă pe meniu și rapoarte pentru contabil, în același loc.", "/marketing/live/dashboard.png"],
  ] as const;
  const saleFlow = [
    { icon: CreditCard, label: "Vânzare la POS", detail: "Produse, TVA și metodă de plată alese o dată, corect." },
    { icon: Receipt, label: "Emitere bon fiscal", detail: "Comanda pleacă spre driverul fiscal, când integrarea e configurată." },
    { icon: FileBarChart, label: "Raport Z zilnic", detail: "Vânzări, TVA și diferența de numerar, calculate automat." },
  ];
  const offlineFlow = [
    { icon: Wifi, label: "Cade internetul", detail: "POS-ul rămâne deschis, vânzarea continuă normal." },
    { icon: Package, label: "Coadă locală", detail: "Maximum 20 de vânzări, păstrate pe stația de lucru." },
    { icon: CreditCard, label: "Sincronizare automată", detail: "Totul se trimite când revine conexiunea — fără pași manuali." },
  ];
  const accountantFlow = [
    { icon: MailCheck, label: "Îl inviți din platformă", detail: "Introduci emailul și alegi datele disponibile." },
    { icon: ShieldCheck, label: "Acces gratuit, doar citire", detail: "Contabilul vede clienții lui într-un portal separat." },
    { icon: Building2, label: "Predare lunară automată", detail: "Descarcă pachetul contabil direct, fără să te caute." },
  ];
  return <>
    <section className={s.glow}><div className={`${s.container} ${s.hero}`}><div className={s.stack}>
      <p className={s.eyebrow}>Sistem de operare pentru cafenele</p><h1>La finalul fiecărei zile, știi exact ce ai vândut, câți bani trebuie să ai, ce stoc ai consumat și ce profit ai făcut.</h1>
      <p className={s.lead}>Vânzări, numerar, stoc, rețete și marjă într-un singur loc. Fără să legi manual casa de marcat, Excelul și mesajele către contabil.</p>
      <div className={s.actions}><DesignTrialLink location="homepage_hero" /><Link href="/features" className={`${s.button} ${s.secondary}`}>Vezi ce face</Link></div><p className={s.meta}>Fără card la înscriere · suport în română</p>
    </div><div className={s.stack}><div className={s.heroProduct}><Image src="/marketing/live/dashboard.png" alt="Panoul FranchiseTech cu vânzări, încasări și produse" width={1600} height={1000} priority /></div><p className={s.meta}>Panoul proprietarului — vânzări, încasări și produse într-un singur ecran</p></div></div></section>
    <section className={`${s.container} ${s.productTour}`}><div className={s.tourHeading}><div><p className={s.eyebrow}>Vezi platforma înainte să începi</p><h2>De la prima vânzare la raportul zilei.</h2></div><p className={s.body}>Acestea sunt ecrane reale din FranchiseTech. Urmărește traseul pe care îl folosește echipa în fiecare zi.</p></div><div className={s.tourGrid}>{saleFlow.map((step, index) => { const Icon = step.icon; return <article className={s.tourStep} key={step.label}><span className={s.number}>0{index + 1}</span><Icon aria-hidden /><div><h3>{step.label}</h3><p>{step.detail}</p></div></article>; })}</div><div className={s.demoVideo}><video controls playsInline preload="metadata" poster="/marketing/live/pos.png" aria-label="Demonstrație înregistrată a platformei FranchiseTech"><source src="/showcase/product-demo.mp4" type="video/mp4" /></video><div><p className={s.eyebrow}>Demonstrație înregistrată</p><h3>Vezi cum se înregistrează o vânzare.</h3><p className={s.body}>Produsele, bonul curent și plata sunt vizibile în același ecran. Pornește clipul pentru o prezentare rapidă.</p></div></div></section>
    <section className={`${s.container} ${s.section}`}><p className={s.eyebrow}>Ce face, pe scurt</p><h2>Patru lucruri, legate între ele.</h2><div className={s.highlights}>{highlights.map(([title, body, image], i) => <article className={s.highlight} key={title}><div className={s.stack}><span className={s.number}>0{i + 1}</span><h3>{title}</h3><p className={s.body}>{body}</p></div><div className={s.imageFrame}><Image src={image} alt={`${title} în FranchiseTech`} width={1600} height={1000} /></div></article>)}</div></section>
    <section className={s.tinted}><div className={`${s.container} ${s.pageSection}`}><div className={s.split}><div className={s.stack}><p className={s.eyebrow}>Portal gratuit pentru contabil</p><h2>Conectează contabilul gratuit. Noi facem predarea.</h2><p className={s.lead}>Datele ajung automat, fără rapoarte trimise lunar pe WhatsApp. Contabilul primește acces securizat, doar pentru citire, și își poate gestiona toate cafenelele dintr-un singur portal.</p><div className={s.actions}><DesignTrialLink location="homepage_accountant">Conectează-ți cafeneaua</DesignTrialLink><Link href="/partners" className={`${s.button} ${s.secondary}`}>Sunt contabil</Link></div><p className={s.meta}>Contabilul nu ocupă un loc plătit și nu poate modifica vânzări, stoc sau setări.</p></div><div className={s.imageFrame}><HomeFlowDiagram steps={accountantFlow} /></div></div></div></section>
    <section className={s.customerVideoSection}><div className={`${s.container} ${s.customerVideoGrid}`}><div className={s.customerVideoCopy}><p className={s.eyebrow}>Folosit într-un local real</p><h2>FranchiseTech, la lucru în Dolce Nera.</h2><p className={s.body}>Nu este o machetă. Clipul arată platforma folosită la punctul de vânzare, în timpul programului.</p><div className={s.customerIdentity}><Image src="/clients/dolce-nera.png" alt="Dolce Nera" width={160} height={80} /><span>Client FranchiseTech</span></div></div><div className={s.customerVideo}><video controls playsInline preload="metadata" poster="/marketing/product-proof/pos-in-cafe-poster.jpg" aria-label="FranchiseTech folosit la Dolce Nera"><source src="/marketing/product-proof/pos-in-cafe.mp4" type="video/mp4" /></video></div></div></section>
    <section className={s.dark}><div className={`${s.container} ${s.split}`}><div className={s.stack}><p className={s.eyebrow}>Mod offline</p><h2>Cade internetul. Casa vinde mai departe.</h2><p className={s.body}>Cu POS-ul deja deschis, vânzările intră într-o coadă locală de maximum 20 de intrări și se sincronizează când revine conexiunea.</p><p className={s.notice}>Înregistrarea vânzării și emiterea bonului fiscal sunt etape separate. Bonul fiscal depinde de driverul fiscal și de echipamentul din local — în POS vezi ce a rămas de emis.</p></div><div className={s.imageFrame}><HomeFlowDiagram steps={offlineFlow} tone="dark" /></div></div></section>
    <DesignFinalCta />
  </>;
}

const industries = PRIMARY_INDUSTRY_SLUGS.map((slug) => {
  const page = primaryIndustryPages.find((p) => p.slug === slug)!;
  return localizeSeoPage(page, "ro");
});

// Real photos exist only for cafés and restaurants today — takeaway and
// patisserie-bakery fall back to the icon tile until matching photography
// is sourced (not something to guess/download without sign-off).
const INDUSTRY_CARD_IMAGES: Partial<Record<PrimaryIndustrySlug, string>> = {
  cafes: "/marketing/industry-cafe.png",
  restaurants: "/marketing/industry-restaurant.png",
};

export function DesignIndustries() {
  return <><PageHero eyebrow="Industrii" title="Construit pentru localuri mici, cu bucătărie.">Dacă vinzi ceva ce se prepară din ingrediente, costul real e întrebarea care contează. Dacă vinzi produse ambalate, alte sisteme îți sunt mai potrivite — o spunem înainte să plătești.</PageHero><section className={`${s.container} ${s.pageSection}`}><div className={s.grid}>{industries.map((industry) => {
    const nav = PRIMARY_INDUSTRY_NAV.find((n) => n.slug === industry.slug);
    const Icon = nav?.icon;
    const photo = INDUSTRY_CARD_IMAGES[industry.slug as PrimaryIndustrySlug];
    return <Link key={industry.slug} href={industry.path} className={`${s.card} ${s.imageCard}`}>
      {photo ? (
        <Image src={photo} alt={industry.h1} width={1024} height={576} />
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-secondary">
          {Icon && <Icon className="h-10 w-10 text-brass" strokeWidth={1.5} aria-hidden />}
        </div>
      )}
      <div className={s.cardContent}><h2>{industry.h1}</h2><p className={s.body}>{industry.heroSubheadline ?? industry.intro}</p><p className={s.meta}>{industry.eyebrow}</p></div>
    </Link>;
  })}</div></section><DesignFinalCta /></>;
}

const devices = [
  ["CALCULATOR", "Calculatorul de la casă", "POS în browser, plus driverul fiscal instalat local pentru bonuri fiscale. Configurația recomandată dacă emiți bonuri fiscale."],
  ["TABLETĂ", "Tabletă", "POS în browser, pe tabletă. Emiterea bonului fiscal are nevoie de driverul fiscal și de echipamentul configurate local."],
  ["BROWSER", "Laptop sau desktop", "Back-office complet: stoc, recepții, rețete, rapoarte. Nimic de instalat."],
  ["TELEFON", "Telefon", "Rapoarte și cifrele zilei, de oriunde. Nu e pentru vânzare la tejghea."],
];

export function DesignHardware() {
  return <>
    <PageHero eyebrow="Echipamente" title="Software-ul nostru, echipamentul pe care îl ai deja.">POS-ul rulează în browser. Emiterea fiscală trece prin driverul fiscal configurat local — serverul nostru nu atinge niciodată echipamentul din local.</PageHero>
    <section className={`${s.container} ${s.pageSection}`}><h2 className={s.sectionTitle}>Pe ce rulează</h2><div className={s.grid}>{devices.map(([badge, title, body], index) => <article className={s.card} key={title}><span className={`${s.badge} ${index === 0 ? s.blueBadge : ""}`}>{badge}</span><h3>{title}</h3><p className={s.body}>{body}</p></article>)}</div></section>
    <section className={s.tinted}><div className={`${s.container} ${s.pageSection}`}><h2 className={s.sectionTitle}>Case de marcat și imprimante fiscale</h2><p className={s.body}>Exemple de echipamente pentru care poți verifica integrarea driverului fiscal. Confirmă modelul exact, firmware-ul și configurația locală cu furnizorul tău.</p><div className={`${s.grid} ${s.hardwareGrid}`} style={{ marginTop: 22 }}>{[["datecs-dp25.jpg", "Datecs DP25", "Casă de marcat"], ["datecs-dp150.jpg", "Datecs DP150", "Casă de marcat"], ["datecs-fp700.jpg", "Datecs FP700", "Imprimantă fiscală"]].map(([img, title, type]) => <article key={title} className={`${s.card} ${s.imageCard}`}><div className={s.hardwareImage}><Image src={`/design-marketing/hardware/${img}`} alt={title} width={600} height={450} /></div><div className={s.cardContent}><h3>{title}</h3><p className={s.caption}>{type}</p></div></article>)}</div><p className={s.smallPrint}>Compatibilitatea se confirmă pentru model, firmware și configurația locală. Echipamentul și licența driverului fiscal se achiziționează separat, de la furnizorul tău. Fotografii: catalogul Datecs.</p></div></section>
    <section className={`${s.container} ${s.pageSection}`}><div className={s.grid}><article className={`${s.card} ${s.emphasis}`}><h2>Sertarul de bani — ce facem și ce nu</h2><p className={s.body}><strong>Nu trimitem comenzi de deschidere către sertar.</strong> Sertarul se deschide de la casa de marcat sau manual, ca până acum. Ce facem: urmărim fondul de deschidere, încasările în numerar, fiecare mișcare de numerar și diferența la închidere — ca raportul Z să bată cu ce numeri în sertar.</p><p className={s.meta}>fond deschidere → vânzări numerar → mișcări → numărat la închidere</p></article><article className={s.card}><h2>Driverul fiscal — agentul local</h2><p className={s.body}>Se instalează pe calculatorul de la casă, de la <a href="https://driverfiscal.ro/" target="_blank" rel="noopener noreferrer">driverfiscal.ro</a>, și vorbește direct cu casa de marcat. POS-ul îl apelează din browserul casierului. Dacă agentul nu răspunde, vezi în POS ce bonuri au rămas de emis. Cerințele exacte de sistem le confirmi cu furnizorul driverului.</p><p className={s.meta}>browser casier → driver fiscal local → casă de marcat</p></article></div></section>
    <DesignFinalCta />
  </>;
}

export const designFaq = [
  { q: "Trebuie să schimb casa de marcat?", a: "Nu neapărat. Conectarea se face prin driverul fiscal configurat local. Confirmă compatibilitatea modelului și configurația cu furnizorul driverului." },
  { q: "Deschideți sertarul de bani din aplicație?", a: "Nu. Sertarul se deschide de la casa de marcat. Noi urmărim fondul, încasările și diferența la închidere, ca raportul Z să bată cu ce numeri." },
  { q: "Merge dacă nu sunt plătitor de TVA?", a: "Da. TVA-ul de la furnizor intră în costul mărfii, iar TVA-ul de vânzare se configurează separat. Cotele de achiziție rămân disponibile pentru facturile furnizorilor." },
  { q: "Bonul fiscal se emite și offline?", a: "Înregistrarea vânzării și emiterea bonului sunt etape separate. Vânzarea intră în coada locală; emiterea bonului depinde de driverul fiscal și de echipamentul local. În POS vezi ce a rămas de emis." },
  { q: "Ce se întâmplă dacă cade internetul?", a: "Cu POS-ul deja deschis, vinzi mai departe: maximum 20 de vânzări în coada locală, sincronizate automat când revine conexiunea." },
  { q: "Am două locații. Merge?", a: "Da — planul Multi include locația de bază și adaugă 29€/lună pentru fiecare locație în plus, cu raportare centrală și comutare între locații." },
];

const DESIGN_PRICING_CARD_COPY: Record<"free" | "growth" | "team", { body: string; features: string[]; cta: string; badge?: string }> = {
  free: {
    body: "Pentru un local la început de drum — vânzare, conectare driver fiscal, bonuri fiscale și rapoartele zilei. Fără card, fără expirare.",
    features: ["POS fără limită de bonuri", "Până la 50 de produse", "1 locație", "Închidere casă și raport Z", "Registru de casă", "Conectare driver fiscal"],
    cta: "Creați cont gratuit",
  },
  growth: {
    body: "Pentru proprietarii care vor stoc, cost pe rețetă și marja reală, plus pachetul de export pentru contabil. Ăsta e planul pentru care există produsul.",
    features: ["Tot din planul Free, produse nelimitate", "Stoc și recepții (NIR)", "Rețete și cost pe produs", "Food cost și marjă pe meniu", "Bon de consum și fișă de magazie", "Inventar și consum teoretic vs. real", "Pachet export contabil (CSV + XML)"],
    cta: "Începeți Pro",
    badge: "GESTIUNE",
  },
  team: {
    body: "Pentru afaceri cu două sau mai multe locații — tot din Pro, plus raportare centrală, comutare între locații și suport prioritar.",
    features: ["Tot din planul Pro", "Locații multiple", "Comutare între locații", "Rapoarte per locație", "29€/locație suplimentară/lună", "Suport prioritar"],
    cta: "Începeți Multi",
  },
};

export function DesignPricing({ featuredPlan: requestedPlan }: { featuredPlan?: string } = {}) {
  const plansToShow = pricingPlans.filter((plan): plan is typeof plan & { id: "free" | "growth" | "team" } => plan.id === "free" || plan.id === "growth" || plan.id === "team");
  const featuredPlan = plansToShow.some((plan) => plan.id === requestedPlan) ? requestedPlan : "growth";
  return <><PageHero eyebrow="Prețuri" title="Trei planuri, cu preț clar pe locație.">Free pentru vânzare și închidere zilnică, fără card. Pro adaugă stoc, achiziții și rețete. Multi e pentru mai multe locații.</PageHero><section className={`${s.container} ${s.pageSection}`}><div className={`${s.grid} ${s.plans}`}>{plansToShow.map((plan) => {
    const copy = DESIGN_PRICING_CARD_COPY[plan.id];
    return <article className={`${s.card} ${s.plan} ${plan.id === featuredPlan ? s.featured : ""}`} key={plan.id}><div className={s.cardTitle}><h2>{plan.name}</h2>{copy.badge && <span className={`${s.badge} ${s.blueBadge}`}>{copy.badge}</span>}</div><div className={s.price}><strong>{plan.price}</strong><span>{plan.id === "free" ? " / pentru totdeauna" : " / locație / lună"}</span></div><p className={s.body}>{copy.body}</p><ul className={s.features}>{copy.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><DesignTrialLink location="pricing_plan" plan={plan.id}>{copy.cta}</DesignTrialLink></article>;
  })}</div><p className={s.smallPrint}>Prețurile nu includ TVA. Driverul fiscal, echipamentele și serviciile terțe se plătesc separat. Anulare oricând, fără contract pe termen lung.</p></section><section className={`${s.container} ${s.bottomSpace}`}><h2 className={s.sectionTitle}>Întrebări frecvente</h2><div className={`${s.grid} ${s.faq}`}>{designFaq.map(({ q, a }) => <article className={s.card} key={q}><h3>{q}</h3><p className={s.body}>{a}</p></article>)}</div></section><DesignFinalCta /></>;
}
