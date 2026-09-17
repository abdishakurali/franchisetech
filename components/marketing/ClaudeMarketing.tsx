"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { pricingPlans } from "@/lib/billing/plans";
import s from "./ClaudeMarketing.module.css";

const pages = [["/", "Acasă"], ["/features", "Funcționalități"], ["/industries", "Industrii"], ["/features/echipamente", "Echipamente"], ["/pricing", "Prețuri"], ["/compare", "Comparații"], ["/blog", "Ghiduri"]] as const;

export function DesignTrialLink({ location, plan = "starter", children = "Începe gratuit 15 zile" }: { location: string; plan?: "starter" | "pro"; children?: ReactNode }) {
  return <Link className={s.button} href={`/signup?plan=${plan}`} onClick={() => captureClientEvent("cta_clicked", { location, destination: `/signup?plan=${plan}` })}>{children}</Link>;
}

export function ClaudeMarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const links = pages.map(([href, label]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={(event) => { event.currentTarget.closest("details")?.removeAttribute("open"); captureClientEvent("nav_link_clicked", { label, href, location: "design_navigation" }); }}>{label}</Link>);
  return <div className={s.site}>
    <header className={s.header}><div className={`${s.container} ${s.headerInner}`}>
      <Link href="/" aria-label="FranchiseTech — Acasă"><Image src="/design-marketing/franchise-tech-logo.svg" alt="FranchiseTech" width={190} height={26} className={s.logo} priority /></Link>
      <nav className={s.nav} aria-label="Navigare principală">{links}</nav>
      <div className={s.account}><Link href="/login">Autentificare</Link><Link href="/signup?plan=starter">Începeți trialul</Link></div>
      <details className={s.mobile}><summary aria-label="Deschide meniul">Meniu</summary><nav className={s.nav} aria-label="Navigare mobilă">{links}<Link href="/login">Autentificare</Link></nav></details>
    </div></header>
    <main>{children}</main>
    <footer className={s.footer}><div className={`${s.container} ${s.footerInner}`}>
      <Link href="/"><Image src="/design-marketing/franchise-tech-logo.svg" alt="FranchiseTech" width={190} height={26} className={s.logo} /></Link>
      <span>franchisetech.ro · suport în română</span>
      <nav className={s.footerLinks} aria-label="Informații legale"><Link href="/privacy">Confidențialitate</Link><Link href="/terms">Termeni</Link><Link href="/contact">Contact</Link></nav>
    </div></footer>
  </div>;
}

export function DesignFinalCta() {
  return <section id="final-cta" className={s.glow}><div className={`${s.container} ${s.finalCta}`}>
    <h2>Începe cu rețetele tale. Vezi cifrele în aceeași zi.</h2>
    <p className={s.lead}>Adaugă produsele din ce ai acum — Excel sau alt POS. Te ghidăm la primii pași. 15 zile de trial, fără card.</p>
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
    <section className={`${s.container} ${s.bottomSpace}`}><div className={`${s.card} ${s.mutedPanel}`}><h2>Ce nu facem (încă)</h2><p className={s.body}>HACCP, senzori de temperatură, integrări de livrare, fidelizare și serviciu la masă nu fac parte din oferta activă. Ne concentrăm pe vânzare, stoc, rețete și închiderea zilei.</p></div></section>
    <DesignFinalCta />
  </>;
}

export function DesignHome() {
  const highlights = [
    ["Vinzi în câteva atingeri", "Produsele direct pe ecran, cu TVA-ul pe fiecare linie. Numerar sau card — două butoane pentru încasare.", "pos-hero.png"],
    ["Costul apare din rețetă, nu din memorie", "Treci o dată gramajele. Costurile din recepții alimentează rețetele, folosind metoda de calcul configurată în aplicație.", "recipe-costing-hero.png"],
    ["Stocul se mișcă singur", "Recepții cu NIR, bonuri de consum, fișă de magazie pe articol. Vezi ce e sub minim înainte să rămâi fără.", "stock-report.png"],
    ["Marja, nu doar încasarea", "Food cost pe produs, marjă pe meniu și rapoarte pentru contabil, în același loc.", "margins-report.png"],
  ];
  return <>
    <section className={s.glow}><div className={`${s.container} ${s.hero}`}><div className={s.stack}>
      <p className={s.eyebrow}>POS + gestiune pentru cafenele</p><h1>Știi cât te costă de fapt un cappuccino.</h1>
      <p className={s.lead}>Casa de marcat îți spune cât ai vândut. FranchiseTech îți spune cât ai consumat, cât a costat și cât ți-a rămas — din rețete și stoc reale.</p>
      <div className={s.actions}><DesignTrialLink location="homepage_hero" /><Link href="/features" className={`${s.button} ${s.secondary}`}>Vezi ce face</Link></div><p className={s.meta}>Fără card la înscriere · suport în română</p>
    </div><div className={s.stack}><div className={s.imageFrame}><Image src="/design-marketing/pos-hero.png" alt="Ecranul de vânzare FranchiseTech" width={1280} height={800} priority /></div><p className={s.meta}>Ecranul de vânzare, din platformă</p></div></div></section>
    <section className={`${s.container} ${s.section}`}><p className={s.eyebrow}>Ce face, pe scurt</p><h2>Patru lucruri, legate între ele.</h2><div className={s.highlights}>{highlights.map(([title, body, asset], i) => <article className={s.highlight} key={title}><div className={s.stack}><span className={s.number}>0{i + 1}</span><h3>{title}</h3><p className={s.body}>{body}</p></div><div className={s.imageFrame}><Image src={`/design-marketing/${asset}`} alt={title} width={1280} height={800} /></div></article>)}</div></section>
    <section className={s.dark}><div className={`${s.container} ${s.split}`}><div className={s.stack}><p className={s.eyebrow}>Mod offline</p><h2>Cade internetul. Casa vinde mai departe.</h2><p className={s.body}>Cu POS-ul deja deschis, vânzările intră într-o coadă locală de maximum 20 de intrări și se sincronizează când revine conexiunea.</p><p className={s.notice}>Înregistrarea vânzării și emiterea bonului fiscal sunt etape separate. Bonul fiscal depinde de FiscalNet și de echipamentul din local — în POS vezi ce a rămas de emis.</p></div><div className={s.imageFrame}><Image src="/design-marketing/reports-zreport.png" alt="Raport de închidere a zilei" width={1280} height={800} /></div></div></section>
    <DesignFinalCta />
  </>;
}

const industries = [
  { title: "Cafenele", img: "industry-cafe.png", body: "Viteză la rush hour și marje clare pe cafea. Cele mai multe produse au 2–3 ingrediente, deci costul real se calculează din rețetă.", meta: "clientul nostru activ e o cafenea" },
  { title: "Restaurante mici", img: "industry-restaurant.png", body: "Meniu care se schimbă, rețete cu mai multe ingrediente și un food cost care trebuie urmărit pe fiecare fel.", meta: "rețete și cost pe fiecare produs" },
  { title: "Patiserii și bucătării de producție", img: "industry-kitchen.png", body: "Produci dintr-un semipreparat alt produs. Bonul de consum și fișa de magazie sunt documentele zilnice.", meta: "bon de consum · fișă de magazie" },
  { title: "Food truck și puncte mici", img: "industry-food-truck.png", body: "Internet nesigur și o singură casă. Modul offline și închiderea zilei fac diferența.", meta: "coadă locală de 20 de vânzări" },
];

export function DesignIndustries() {
  return <><PageHero eyebrow="Industrii" title="Construit pentru localuri mici, cu bucătărie.">Dacă vinzi ceva ce se prepară din ingrediente, costul real e întrebarea care contează. Dacă vinzi produse ambalate, alte sisteme îți sunt mai potrivite — o spunem înainte să plătești.</PageHero><section className={`${s.container} ${s.pageSection}`}><div className={s.grid}>{industries.map((industry) => <article key={industry.title} className={`${s.card} ${s.imageCard}`}><Image src={`/design-marketing/${industry.img}`} alt={industry.title} width={800} height={450} /><div className={s.cardContent}><h2>{industry.title}</h2><p className={s.body}>{industry.body}</p><p className={s.meta}>{industry.meta}</p></div></article>)}</div></section><DesignFinalCta /></>;
}

const devices = [
  ["CALCULATOR", "Calculatorul de la casă", "POS în browser, plus agentul FiscalNet instalat local pentru bonuri fiscale. Configurația recomandată dacă emiți bonuri fiscale."],
  ["TABLETĂ", "Tabletă", "POS în browser, pe tabletă. Emiterea bonului fiscal are nevoie de agentul FiscalNet și de echipamentul configurate local."],
  ["BROWSER", "Laptop sau desktop", "Back-office complet: stoc, recepții, rețete, rapoarte. Nimic de instalat."],
  ["TELEFON", "Telefon", "Rapoarte și cifrele zilei, de oriunde. Nu e pentru vânzare la tejghea."],
];

export function DesignHardware() {
  return <>
    <PageHero eyebrow="Echipamente" title="Software-ul nostru, echipamentul pe care îl ai deja.">POS-ul rulează în browser. Emiterea fiscală trece prin agentul FiscalNet configurat local — serverul nostru nu atinge niciodată echipamentul din local.</PageHero>
    <section className={`${s.container} ${s.pageSection}`}><h2 className={s.sectionTitle}>Pe ce rulează</h2><div className={s.grid}>{devices.map(([badge, title, body], index) => <article className={s.card} key={title}><span className={`${s.badge} ${index === 0 ? s.blueBadge : ""}`}>{badge}</span><h3>{title}</h3><p className={s.body}>{body}</p></article>)}</div></section>
    <section className={s.tinted}><div className={`${s.container} ${s.pageSection}`}><h2 className={s.sectionTitle}>Case de marcat și imprimante fiscale</h2><p className={s.body}>Exemple de echipamente pentru care poți verifica integrarea FiscalNet. Confirmă modelul exact, firmware-ul și configurația locală cu furnizorul tău.</p><div className={`${s.grid} ${s.hardwareGrid}`} style={{ marginTop: 22 }}>{[["datecs-dp25.jpg", "Datecs DP25", "Casă de marcat"], ["datecs-dp150.jpg", "Datecs DP150", "Casă de marcat"], ["datecs-fp700.jpg", "Datecs FP700", "Imprimantă fiscală"]].map(([img, title, type]) => <article key={title} className={`${s.card} ${s.imageCard}`}><div className={s.hardwareImage}><Image src={`/design-marketing/hardware/${img}`} alt={title} width={600} height={450} /></div><div className={s.cardContent}><h3>{title}</h3><p className={s.caption}>{type}</p></div></article>)}</div><p className={s.smallPrint}>Compatibilitatea se confirmă pentru model, firmware și configurația locală. Echipamentul și licența FiscalNet se achiziționează separat, de la furnizorul tău. Fotografii: catalogul Datecs.</p></div></section>
    <section className={`${s.container} ${s.pageSection}`}><div className={s.grid}><article className={`${s.card} ${s.emphasis}`}><h2>Sertarul de bani — ce facem și ce nu</h2><p className={s.body}><strong>Nu trimitem comenzi de deschidere către sertar.</strong> Sertarul se deschide de la casa de marcat sau manual, ca până acum. Ce facem: urmărim fondul de deschidere, încasările în numerar, fiecare mișcare de numerar și diferența la închidere — ca raportul Z să bată cu ce numeri în sertar.</p><p className={s.meta}>fond deschidere → vânzări numerar → mișcări → numărat la închidere</p></article><article className={s.card}><h2>FiscalNet — agentul local</h2><p className={s.body}>Se instalează pe calculatorul de la casă, de la <a href="https://driverfiscal.ro/" target="_blank" rel="noopener noreferrer">driverfiscal.ro</a>, și vorbește direct cu casa de marcat. POS-ul îl apelează din browserul casierului. Dacă agentul nu răspunde, vezi în POS ce bonuri au rămas de emis. Cerințele exacte de sistem le confirmi cu furnizorul driverului.</p><p className={s.meta}>browser casier → FiscalNet local → casă de marcat</p></article></div></section>
    <DesignFinalCta />
  </>;
}

export const designFaq = [
  { q: "Trebuie să schimb casa de marcat?", a: "Nu neapărat. Conectarea se face prin agentul FiscalNet configurat local. Confirmă compatibilitatea modelului și configurația cu furnizorul driverului." },
  { q: "Deschideți sertarul de bani din aplicație?", a: "Nu. Sertarul se deschide de la casa de marcat. Noi urmărim fondul, încasările și diferența la închidere, ca raportul Z să bată cu ce numeri." },
  { q: "Merge dacă nu sunt plătitor de TVA?", a: "Da. TVA-ul de la furnizor intră în costul mărfii, iar TVA-ul de vânzare se configurează separat. Cotele de achiziție rămân disponibile pentru facturile furnizorilor." },
  { q: "Bonul fiscal se emite și offline?", a: "Înregistrarea vânzării și emiterea bonului sunt etape separate. Vânzarea intră în coada locală; emiterea bonului depinde de FiscalNet și de echipamentul local. În POS vezi ce a rămas de emis." },
  { q: "Ce se întâmplă dacă cade internetul?", a: "Cu POS-ul deja deschis, vinzi mai departe: maximum 20 de vânzări în coada locală, sincronizate automat când revine conexiunea." },
  { q: "Am două locații. Merge?", a: "Da. Prețul pentru locații suplimentare depinde de plan. Contactează-ne ca să verificăm configurația potrivită pentru afacerea ta." },
];

export function DesignPricing() {
  return <><PageHero eyebrow="Prețuri" title="Două planuri, cu preț clar pe locație.">Core pentru vânzare și închidere zilnică. Operations adaugă stoc, achiziții și rețete. 15 zile de trial, fără card.</PageHero><section className={`${s.container} ${s.pageSection}`}><div className={`${s.grid} ${s.plans}`}>{pricingPlans.filter((plan) => plan.id === "starter" || plan.id === "pro").map((plan) => {
    const operations = plan.id === "pro";
    const features = operations ? ["Tot din planul Core", "Stoc și recepții (NIR)", "Rețete și cost pe produs", "Food cost și marjă pe meniu", "Bon de consum și fișă de magazie", "Inventar și consum teoretic vs. real", "Rapoarte pentru contabil"] : ["POS fără limită de bonuri", "Produse și categorii", "Închidere casă și raport Z", "Registru de casă", "Conectare FiscalNet"];
    return <article className={`${s.card} ${s.plan} ${operations ? s.featured : ""}`} key={plan.id}><div className={s.cardTitle}><h2>{plan.name}</h2>{operations && <span className={`${s.badge} ${s.blueBadge}`}>GESTIUNE</span>}</div><div className={s.price}><strong>{plan.price}</strong><span>/ locație / lună</span></div><p className={s.body}>{operations ? "Pentru proprietarii care vor stoc, cost pe rețetă și marja reală. Ăsta e planul pentru care există produsul." : "Pentru un local care are nevoie de vânzare, conectare FiscalNet, bonuri fiscale și rapoartele zilei."}</p><ul className={s.features}>{features.map((feature) => <li key={feature}>{feature}</li>)}</ul><DesignTrialLink location="pricing_plan" plan={operations ? "pro" : "starter"}>Începeți trial {operations ? "Operations" : "Core"}</DesignTrialLink></article>;
  })}</div><p className={s.smallPrint}>Prețurile nu includ TVA. FiscalNet, echipamentele și serviciile terțe se plătesc separat. Anulare oricând, fără contract pe termen lung. Pentru mai multe locații, <Link href="/contact">vorbește cu noi</Link>.</p></section><section className={`${s.container} ${s.bottomSpace}`}><h2 className={s.sectionTitle}>Întrebări frecvente</h2><div className={`${s.grid} ${s.faq}`}>{designFaq.map(({ q, a }) => <article className={s.card} key={q}><h3>{q}</h3><p className={s.body}>{a}</p></article>)}</div></section><DesignFinalCta /></>;
}
