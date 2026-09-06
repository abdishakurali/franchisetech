export type ComparisonPage = {
  slug: string;
  path: string;
  competitor: string;
  market: "global" | "ro" | "ie";
  metaTitle: string;
  description: string;
  h1: string;
  intro: string;
  betterFor: string;
  competitorStrengths: string[];
  franchisetechStrengths: string[];
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  rows: Array<[area: string, franchisetech: string, competitor: string]>;
};

function baseRows(competitor: string, competitorPos: string): ComparisonPage["rows"] {
  return [
    ["Casă POS", "POS în browser cu produse, coș, retururi și sesiuni de casă", competitorPos],
    ["Plăți / hardware", "Înregistrează metoda de plată; FiscalNet când este configurat (România)", "Variază — adesea mai puternic pe terminale de plată"],
    ["Stoc & achiziții", "Produse, ingrediente, furnizori, evidențe de achiziție, stoc minim", "Variază pe produs — adesea orientat pe facturare, nu pe stoc de bucătărie"],
    ["Cost rețete", "Constructor de rețete, cost per porție, marjă, câte porții puteți face", "De obicei limitat sau absent în unelte orientate pe facturare"],
    ["Închidere casă / raport Z", "Numerar de deschidere, intrări/ieșiri numerar, așteptat vs numărat, închidere zilnică", "Variază — poate necesita un flux separat de închidere"],
    ["Bonuri fiscale (RO)", "Integrare FiscalNet când este activată și configurată", "Variază — verificați modulul fiscal actual și configurarea"],
    ["Echipă / preț", "Personal nelimitat pe planurile plătite — fără taxă per casier", "Verificați prețul actual per utilizator sau terminal"],
    ["Potrivire ideală", "Afaceri alimentare mici care vor POS + stoc + rețete + evidențe zilnice în același loc", `Afaceri a căror nevoie principală este punctul forte al ${competitor}`],
  ];
}

export const comparisonPages: ComparisonPage[] = [
  {
    slug: "smartbill",
    path: "/compare/smartbill",
    competitor: "SmartBill",
    market: "ro",
    metaTitle: "Alternativă SmartBill pentru restaurante — POS, stoc, rețete",
    description:
      "Comparație onestă franchisetech vs SmartBill pentru cafenele și restaurante din România: POS zilnic, stoc, achiziții, cost rețete și raport Z — lângă facturare.",
    h1: "franchisetech vs SmartBill pentru restaurante și cafenele",
    intro:
      "SmartBill este puternic la facturare și contabilitate pentru IMM-uri din România. franchisetech se concentrează pe fluxul zilnic al casei: vânzări POS, stoc, achiziții, cost rețete, închidere casă și rapoarte pentru proprietar.",
    betterFor:
      "SmartBill poate rămâne alegerea principală dacă aveți nevoie doar de facturare și e-Factura. franchisetech merită evaluat dacă POS-ul, stocul și marjele pe rețete trebuie să stea în același loc cu vânzarea zilnică.",
    competitorStrengths: [
      "Facturare și e-Factura cunoscute în România",
      "Ecosistem contabil familiar pentru IMM-uri",
      "Integrări cu fluxuri de facturare existente",
    ],
    franchisetechStrengths: [
      "POS în browser cu sesiuni casă și raport Z",
      "Stoc, furnizori, achiziții și rețete legate de vânzări",
      "FiscalNet când este activat și configurat",
      "Personal nelimitat pe planurile plătite",
    ],
    sections: [
      {
        title: "Facturare vs operațiuni zilnice",
        body: "Multe restaurante folosesc SmartBill pentru facturi către furnizori și e-Factura, dar încă reconciliază casa și stocul în Excel. franchisetech țintește golul dintre bonul fiscal și marja reală pe produs.",
      },
      {
        title: "Trial paralel",
        body: "Rulați 15 zile în paralel: aceleași produse, aceeași echipă, comparați raportul zilnic și timpul de reconciliere înainte de a muta fluxul principal.",
      },
    ],
    faqs: [
      {
        question: "franchisetech înlocuiește SmartBill complet?",
        answer:
          "Nu neapărat. Multe afaceri păstrează SmartBill pentru facturare și folosesc franchisetech pentru POS, stoc și rapoarte zilnice. Verificați cu contabilul ce combinație vi se potrivește.",
      },
      {
        question: "Suportă FiscalNet?",
        answer:
          "Da, când integrarea este activată și configurată corect pe stația de casă. Nu presupuneți conformitate fiscală fără verificarea contabilului.",
      },
      {
        question: "Pot importa produse?",
        answer: "Da, prin CSV.",
      },
    ],
    related: [
      { label: "România", href: "/industries/romania" },
      { label: "Ghid FiscalNet", href: "/help/romania-fiscalnet" },
    ],
    rows: baseRows("SmartBill", "SmartBill — facturare și contabilitate IMM, POS limitat spre operațiuni adânci"),
  },
  {
    slug: "expressoft",
    path: "/compare/expressoft",
    competitor: "Expressoft",
    market: "ro",
    metaTitle: "Alternativă Expressoft — SMB vs enterprise HoReCa",
    description:
      "Comparație onestă franchisetech vs Expressoft: lanțuri mari cu implementare dedicată vs cafenea/restaurant 1–3 locații — POS browser, stoc, rețete, raport Z și cost predictibil.",
    h1: "franchisetech vs Expressoft — enterprise vs time-to-value",
    intro:
      "Expressoft acoperă restaurante și retail cu un portofoliu larg și implementări consacrate la lanțuri. franchisetech nu concurează la rollout enterprise de săptămâni — țintește operatorii care vor casă, stoc, marje și închidere de zi în zile, nu luni, cu preț transparent și personal nelimitat.",
    betterFor:
      "Expressoft poate câștiga la rețele mari (5+ locații) cu echipă IT, training dedicat și fluxuri custom. franchisetech merită evaluat pentru cafenea, restaurant mic sau lanț 2–5 locații care vrea trial self-serve, raport Z inclus și coexistență cu SmartBill/Oblio pentru facturare.",
    competitorStrengths: [
      "Portofoliu larg HoReCa + retail — module mature pentru lanțuri",
      "Implementări la operatori consacrați — experiență enterprise",
      "Ecosistem integrat pentru volume mari (delivery, call center — verificați planul)",
      "Suport și relație comercială pentru proiecte complexe",
    ],
    franchisetechStrengths: [
      "Time-to-first-sale în zile — trial 15 zile, setup checklist, onboarding ghidat",
      "Preț listat pe site (Core 49€, Operations 79€) — personal nelimitat",
      "Raport Z, vânzări și TVA incluse în Starter — fără add-on doar pentru raportare",
      "Multi-location 89€/locație suplimentară — fără suite enterprise obligatorie",
      "Coexistă cu SmartBill/Oblio/Saga pentru facturare și e-Factura",
    ],
    sections: [
      {
        title: "Enterprise rollout vs self-serve trial",
        body: "Expressoft shine când aveți buget și timp pentru implementare structurată. franchisetech optimizează primele 48h: produse, deschidere casă, vânzare test, raport Z — comparați în trial paralel înainte de a angaja un proiect de migrare.",
      },
      {
        title: "2–5 locații fără complexitate inutilă",
        body: "Planul Multi-location franchisetech acoperă 2–5 locații fără să forțeze module enterprise pe care un operator mic nu le folosește. Verificați dacă Expressoft cere module suplimentare per locație sau per terminal — adunați costul total.",
      },
      {
        title: "Facturare separată, operațiuni zilnice clare",
        body: "Ca la RezoSoft sau Bit-Soft, mulți operatori păstrează SmartBill/Oblio pentru documente. franchisetech adaugă stratul zilnic: POS, stoc, NIR (Pro) și raport Z seara — verificați cu contabilul înainte de a schimba tot stack-ul.",
      },
    ],
    faqs: [
      {
        question: "Expressoft e mai bun pentru lanțul meu?",
        answer:
          "Dacă aveți 5+ locații, call center, dispatch delivery la volum și echipă dedicată implementării, Expressoft poate fi alegerea corectă. Pentru 1–3 locații cu focus pe casă și marje, comparați timpul până la prima vânzare și costul total în trial paralel franchisetech.",
      },
      {
        question: "Suport multi-locație la franchisetech?",
        answer:
          "Da — plan Multi-location (89€/locație suplimentară/lună, necesită plan Scale la bază). Raport Z și vânzări per locație; verificați pagina de prețuri pentru limitele curente și FiscalNet pe Multi-location.",
      },
      {
        question: "Pot păstra contabilul pe SmartBill?",
        answer:
          "Da — model comun. SmartBill/Oblio pentru facturi B2B și e-Factura; franchisetech pentru POS zilnic, stoc și închidere casă. Nu pretindem înlocuire automată a facturării.",
      },
    ],
    related: [
      { label: "Prețuri", href: "/pricing" },
      { label: "România", href: "/industries/romania" },
    ],
    rows: [
      ["Segment țintă", "Cafenea/restaurant 1–5 locații, time-to-value rapid", "Lanțuri și operatori enterprise HoReCa/retail"],
      ["Implementare", "Zile — trial self-serve + setup checklist", "Săptămâni/luni — proiect dedicat, training"],
      ["POS register", "Browser: coș, sesiune casă, retururi", "Platformă matură — fluxuri complexe la volum"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat", "Disponibil — verificați claritatea în oferta voastră"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR legat de POS", "Module gestiune — adesea parte din suite mai mare"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Variază — nu focus principal pe marje rețetă"],
      ["Multi-location", "89€/locație suplimentară — fără enterprise obligatoriu", "Punct forte la rețele mari — preț la ofertă"],
      ["Facturare / e-Factura", "Coexistă SmartBill/Oblio/Saga", "POS/gestiune — facturare adesea separat"],
      ["Personal / casieri", "Nelimitat pe plan plătit", "Verificați licențe per terminal/post"],
      ["Cel mai potrivit pentru", "Operator mic care vrea trial rapid și cost listat", "Lanț 5+ locații cu buget implementare"],
    ],
  },
  {
    slug: "ebriza",
    path: "/compare/ebriza",
    competitor: "Ebriza",
    market: "ro",
    metaTitle: "Alternativă Ebriza — rapoarte incluse, fără add-on Insights",
    description:
      "Comparație franchisetech vs Ebriza: același preț de intrare (~49€/locație), dar rapoarte Z, vânzări și TVA incluse — fără add-on Insights (+19€/lună) și fără taxe ascunse pe raportare.",
    h1: "franchisetech vs Ebriza — preț pe hârtie vs cost real",
    intro:
      "Ebriza afișează Pro de la 49€/locație/lună — același nivel de preț ca franchisetech Core. Diferența pe care mulți operatori o descoperă târziu: rapoartele personalizate (Insights) sunt add-on separat (+19€/lună), iar KDS, Saga sau comenzile delivery pot adăuga zeci de euro în plus. franchisetech include raport vânzări, raport Z și raport TVA în planul de bază — fără upsell doar ca să vedeți ce s-a vândut ieri.",
    betterFor:
      "Ebriza poate fi potrivită dacă aveți nevoie de ecosistemul lor complet (Premium/Titanium, integrări delivery la volum). franchisetech merită evaluat dacă vreți casă + rapoarte zilnice clare la 49€, fără să plătiți extra doar pentru Insights.",
    competitorStrengths: [
      "Planuri tiered (Pro / Premium / Titanium) cu multe module HoReCa",
      "Integrări delivery și meniu digital la scară",
      "Licențe incluse pe plan (1 pe Pro, 2 pe Premium/Titanium)",
      "Ecosistem matur pentru restaurante cu volum mare",
    ],
    franchisetechStrengths: [
      "Raport vânzări, raport Z și raport TVA incluse în Core (49€) — fără add-on Insights",
      "Fără taxă per angajat; personal nelimitat pe plan",
      "Stoc, NIR, rețete și rapoarte marjă pe Operations (79€) — fără salt la 99€+ doar pentru gestiune",
      "Browser POS — trial 15 zile, verificare card 1 €; FiscalNet când este configurat",
    ],
    sections: [
      {
        title: "Lecția: prețul de listă ≠ costul raportării",
        body: "Mulți operatori compară doar „49€ Pro”. Pe structura publică Ebriza, Insights (rapoarte personalizate) costă +19€/lună pe orice plan. Kitchen Display +19€, integrare Saga +39€, comenzi delivery tarifate per comandă sau incluse doar pe tier superior. franchisetech nu taxează separat raportul Z sau vânzările zilnice — sunt în abonament.",
      },
      {
        title: "Comparație onestă pe funcții, nu pe marketing",
        body: "Ebriza Premium (99€) și Titanium (179€) adaugă gestiune, NIR automat și rapoarte avansate. franchisetech Operations (79€) acoperă stoc, furnizori, achiziții/NIR și cost rețete pentru majoritatea cafenelelor și restaurantelor mici — cu rapoarte incluse, nu ca add-on.",
      },
      {
        title: "Cum să testați în 15 zile",
        body: "Rulați paralel: aceleași produse, aceeași echipă, aceeași închidere de zi. Verificați cât plătiți efectiv (plan + add-on-uri) vs cât timp pierdeți reconciliind fără rapoarte clare. franchisetech nu cere card la înscriere — testați complet întâi și decideți după.",
      },
    ],
    faqs: [
      {
        question: "Ebriza Pro și franchisetech Core costă la fel — care e diferența?",
        answer:
          "Ambele pornesc de la circa 49€/locație/lună. franchisetech Core include raport vânzări, raport Z (închidere casă) și raport TVA. Pe pagina publică Ebriza, Insights (rapoarte personalizate) este listat ca add-on de 19€/lună — verificați factura voastră actuală dacă folosiți Ebriza.",
      },
      {
        question: "Am auzit că raportarea costă extra — e adevărat?",
        answer:
          "La unii furnizori, da: rapoarte avansate sau „Insights” sunt module plătite separat. La franchisetech, rapoartele zilnice de vânzări, Z și TVA sunt în planul Starter — nu trebuie să cumpărați un add-on doar ca să vedeți ce s-a întâmplat la casă.",
      },
      {
        question: "Ce add-on-uri Ebriza ar putea mări factura?",
        answer:
          "Conform comparației publice: Insights +19€/lună, Kitchen Display +19€/lună, integrare Saga +39€/lună, comenzi delivery per tranzacție sau incluse doar pe plan superior. franchisetech nu folosește același model de add-on pentru rapoarte de bază.",
      },
      {
        question: "Pot folosi franchisetech doar pentru rapoarte și casă?",
        answer:
          "Da. Core este construit pentru casă, produse și rapoarte zilnice. Operations adaugă stoc, achiziții și rețete.",
      },
    ],
    related: [
      { label: "Prețuri franchisetech", href: "/pricing" },
      { label: "Raport Z", href: "/features/z-report" },
    ],
    rows: [
      ["Cost configurare", "0€ self-serve", "0€ — onboarding video gratuit cu consultant"],
      ["Timp până la prima vânzare", "Sub o oră (cale ghidată în aplicație)", "Self-serve, cu onboarding video gratuit"],
      ["Preț intrare / locație", "Core 49€/lună (rapoarte incluse)", "Pro 49€/locație/lună (+ TVA)"],
      ["Raport vânzări zilnic", "Inclus în Starter", "Raportare timp real pe plan; Insights personalizate +19€/lună (add-on)"],
      ["Raport Z / închidere casă", "Inclus în Starter", "Registru de casă pe plan — verificați dacă rapoarte avansate necesită add-on"],
      ["Raport TVA", "Inclus în Starter", "Facturare & e-Factura pe plan — detaliu raport TVA vs add-on Insights"],
      ["Stoc & NIR", "Operations 79€ — stoc, furnizori, achiziții/NIR", "Premium 99€+ sau module gestiune separate"],
      ["Integrări contabilitate (Saga)", "Export rapoarte în plan eligibil", "+39€/lună add-on integrare Saga"],
      ["Comenzi delivery / meniu digital", "Nu în pachet de bază", "0,06€/comandă sau incluse pe tier superior"],
      ["Personal / utilizatori", "Nelimitat pe plan plătit", "Nelimitat"],
      ["Cost tipic casă + rapoarte zilnice", "49€ — rapoarte zilnice incluse", "49€ — raportare în timp real inclusă; Insights (rapoarte personalizate) +19€"],
      ["Cel mai potrivit pentru", "Cafenea/restaurant mic care vrea casă + rapoarte fără surprize", "Operatori care folosesc deja ecosistem Ebriza complet sau volume delivery mari"],
    ],
  },
  {
    slug: "boogit",
    path: "/compare/boogit",
    competitor: "Boogit",
    market: "ro",
    metaTitle: "Boogit vs franchisetech — livrare vs POS operațional",
    description:
      "Boogit este o platformă de comandă online pentru clienți, nu un POS. Dacă restaurantul dumneavoastră este pe Boogit, aveți nevoie și de un POS pentru a gestiona vânzările, stocul și raportul Z. Comparație onestă.",
    h1: "Boogit vs franchisetech — două produse diferite care fac treabă împreună",
    intro:
      "Boogit (boogiT Technology, Brașov) a pornit ca platformă de comandă online pentru clienți, dar oferă acum și un sistem POS propriu (pos.boogit.ro) — vânzare, gestiune, KDS, chioșc self-ordering, comandă QR la masă, integrare Bolt/Wolt/Glovo și export Saga C. Nu mai este doar o platformă de livrare — este și un concurent direct pe zona de POS restaurant. franchisetech este workspace-ul operațional: casă browser, stoc, rețete, raport Z și export Saga, la preț listat pe site.",
    betterFor:
      "Boogit poate câștiga dacă vreți furnizor local din Brașov cu app proprie de livrare integrată direct în același POS. franchisetech câștigă dacă vreți preț listat transparent (fără cotație), cost rețete și marjă per preparat incluse, și browser POS fără instalare.",
    competitorStrengths: [
      "Sistem POS propriu — vânzare, gestiune, KDS, chioșc self-ordering, comandă QR la masă",
      "Integrare Bolt, Wolt și Glovo — comenzile ajung automat pe ecranele de bucătărie (KDS)",
      "Export automat vânzări și NIR către Saga (contabilitate)",
      "Aplicație proprie de comandă online + livrare pentru clienți, cu vizibilitate locală în Brașov",
      "E-Factura și rapoarte de contabilitate incluse",
    ],
    franchisetechStrengths: [
      "Prețuri listate pe site: Core 49€, Operations 79€, Multi-location 89€/locație — fără cotație sau taxă de implementare",
      "Browser POS — fără instalare locală sau taxă de setup",
      "Raport Z zilnic — numerar așteptat vs numărat, fără Excel",
      "Export Saga C (XML) pentru contabil, la cerere — fără transcriere manuală",
      "Cost rețete și marje incluse în Pro — știți marja înainte de a schimba meniul",
    ],
    sections: [
      {
        title: "Boogit nu mai este doar o platformă de livrare",
        body: "Pe lângă aplicația de comandă online pentru clienți din Brașov, compania boogiT operează și un POS propriu (pos.boogit.ro) cu vânzare, gestiune, KDS, chioșc self-ordering și integrare Bolt/Wolt/Glovo. Dacă evaluați Boogit ca alternativă de POS, comparați-l ca atare — nu doar ca sursă de comenzi online.",
      },
      {
        title: "Preț listat vs. cotație și taxă de implementare",
        body: "Site-ul Boogit nu afișează prețuri publice pentru POS — FAQ-ul lor menționează o taxă de implementare plus abonament lunar, cu ofertă la cerere. franchisetech listează 49–109€/lună pe site, fără taxă de implementare separată.",
      },
      {
        title: "Livrare — punct forte Boogit, nu al nostru",
        body: "Boogit integrează Bolt, Wolt și Glovo, cu comenzile ajungând automat pe KDS. franchisetech nu oferă integrare cu platforme de livrare — ne concentrăm pe casă, stoc, rețete și export Saga C (XML), disponibil la cerere. Dacă livrarea prin platforme e o cerință centrală, Boogit acoperă acel job direct.",
      },
    ],
    faqs: [
      {
        question: "Boogit este doar o platformă de livrare?",
        answer:
          "Nu mai este doar atât. Pe lângă aplicația de comandă online pentru clienți din Brașov, boogiT oferă și un sistem POS propriu (pos.boogit.ro) cu gestiune, KDS, chioșc self-ordering și integrare Bolt/Wolt/Glovo. Comparați-l ca alternativă reală de POS, nu doar ca sursă de comenzi.",
      },
      {
        question: "Boogit are export Saga pentru contabil?",
        answer:
          "Da — site-ul Boogit menționează export automat al vânzărilor și NIR-urilor către Saga. franchisetech oferă de asemenea export Saga C (XML), disponibil la cerere.",
      },
      {
        question: "Funcționează franchisetech cu platforme de livrare?",
        answer:
          "Nu. franchisetech nu oferă integrare cu Glovo, Bolt Food sau Tazz — ne concentrăm pe POS la tejghea, stoc, rețete și raport Z. Dacă livrarea prin platforme e centrală pentru afacerea dumneavoastră, Boogit acoperă acel job direct.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Prețuri", href: "/pricing" },
      { label: "POS", href: "/features/pos" },
    ],
    rows: [
      ["Ce este", "POS + stoc + rețete + raport Z — management operațional", "POS restaurant (pos.boogit.ro) + app proprie de comandă online"],
      ["Cui se adresează", "Proprietarilor de restaurante/cafenele", "Restaurantelor (POS) și clienților care comandă online"],
      ["POS / casă", "Browser POS — sesiune casă, coș, retururi", "Sistem POS propriu — vânzare, gestiune, KDS"],
      ["Raport Z / închidere", "Inclus Starter — așteptat vs numărat zilnic", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR", "Gestiune stoc disponibilă — verificați detaliile cu furnizorul"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Neconfirmat pe site — verificați cu furnizorul"],
      ["Export contabilitate", "Saga C (XML) disponibil la cerere", "Export automat vânzări/NIR către Saga"],
      ["Integrare livrare", "Nu oferim", "Bolt, Wolt, Glovo — automat, direct pe KDS"],
      ["Chioșc self-ordering / QR masă", "Nu este inclus", "Disponibil — punct forte Boogit"],
      ["Preț", "49–109€/lună listat pe site, fără taxă de implementare", "Cotație — taxă de implementare + abonament, contact +40 755 111 774"],
    ],
  },
  {
    slug: "posnet",
    path: "/compare/posnet",
    competitor: "POSnet",
    market: "ro",
    metaTitle: "Alternativă POSnet — POS cloud, rețete, Saga, preț listat",
    description:
      "Comparație onestă franchisetech vs POSnet: ambele au Saga C. POSnet adaugă import automat livrare, licență definitivă și funcționare offline; franchisetech adaugă rețete cu marje și preț lunar listat.",
    h1: "franchisetech vs POSnet — comparație onestă pentru HoReCa România",
    intro:
      "POSnet este un POS puternic pentru restaurante din România: import automat comenzi Glovo, Bolt, Wolt, integrare Saga C, NIR auto, KDS, chioșc self-ordering și funcționare offline. Licență definitivă (fără abonament lunar). franchisetech acoperă aceleași job-uri de bază — casă, stoc, Saga — cu browser cloud (fără instalare), cost rețete pe porție, marje și trial 15 zile, verificare card 1 € la preț lunar listat.",
    betterFor:
      "POSnet câștigă dacă preferați licență definitivă fără abonament lunar, aveți nevoie de funcționare offline sau chioșc self-ordering. franchisetech câștigă dacă vreți cloud fără server local de menținut, cost rețete și marje per preparat, preț lunar listat transparent și trial fără angajament.",
    competitorStrengths: [
      "Import automat comenzi Glovo, Bolt, Wolt — fără introducere manuală",
      "Integrare Saga C pentru contabilitate — direct din sistem",
      "Licență definitivă (one-time) — fără abonament lunar recurent",
      "Funcționare offline — lucrează fără internet",
      "KDS (kitchen display), chioșc self-ordering și POS mobil la masă",
      "NIR auto din e-Factura SPV — import direct fără reintroducere",
      "Rapoarte în timp real — my.posnet.ro și aplicație mobilă",
    ],
    franchisetechStrengths: [
      "Browser cloud — fără instalare, server local sau mentenanță IT",
      "Cost rețete per porție — știți marja brută înainte de a schimba meniul",
      "Preț lunar listat pe site: 49€ Core, 79€ Operations, 89€/locație Multi-location",
      "Trial 15 zile, verificare card 1 € — prima vânzare în ore, fără proiect de implementare",
      "Multi-location la 89€/locație — dashboard unificat, rapoarte separate",
    ],
    sections: [
      {
        title: "Licență definitivă vs abonament lunar — care vă convine?",
        body: "POSnet funcționează pe model de licență definitivă (one-time purchase) — plătiți odată, folosiți nelimitat (plus suport anual eventual). franchisetech funcționează pe abonament lunar (49–109€/lună). Pentru un restaurant cu 5+ ani activitate, licența POSnet poate fi mai ieftină pe termen lung. Pentru flexibilitate maximă și upgrade automat, abonamentul lunar franchisetech nu necesită investiție inițială.",
      },
      {
        title: "Offline vs cloud — ce contează pentru locația voastră",
        body: "POSnet funcționează offline (local) — util dacă internetul este instabil la locație. franchisetech este cloud-based și necesită conexiune activă. Dacă locația are internet stabil (fibră sau 4G), cloud-ul elimină mentenanța serverului local și backup-urile manuale.",
      },
      {
        title: "Cost rețete și marje — diferența practică",
        body: "POSnet nu detaliază pe site funcții de cost rețete sau calculator marjă pe preparat. franchisetech Pro include cost per porție, marjă brută și can-make (câte porții puteți face din stocul actual) — direct legat de stocul din sistem. Dacă schimbați periodic meniul sau vreți să vedeți rentabilitatea per preparat, aceasta este o diferență concretă.",
      },
    ],
    faqs: [
      {
        question: "POSnet are integrare Saga C?",
        answer:
          "Da — POSnet include integrare Saga C pentru contabilitate, conform informațiilor de pe site-ul lor. franchisetech oferă de asemenea export Saga C (XML), disponibil la cerere. Ambele sisteme pot acoperi această cerință.",
      },
      {
        question: "Ce are POSnet și franchisetech nu are?",
        answer:
          "POSnet are: import automat comenzi Glovo/Bolt/Wolt, licență definitivă (fără abonament lunar), chioșc self-ordering, import NIR auto din SPV e-Factura. franchisetech nu oferă integrare cu platforme de livrare, nu oferă licență one-time și nu are chioșc — dar continuă să funcționeze offline, cu vânzările puse în coadă și sincronizate automat la revenirea conexiunii. Evaluați dacă aceste funcții sunt critice pentru locația voastră.",
      },
      {
        question: "Ce are franchisetech și POSnet nu detaliază?",
        answer:
          "franchisetech include: cost rețete per porție și marjă brută, preț lunar listat transparent pe site, browser fără instalare și trial 15 zile, verificare card 1 €. POSnet nu detaliază pe site cost rețete sau trial gratuit — verificați cu furnizorul.",
      },
    ],
    related: [
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Prețuri", href: "/pricing" },
    ],
    rows: [
      ["Model comercial", "Abonament lunar — 49€/79€/109€ listat pe site", "Licență definitivă (one-time) — fără abonament lunar"],
      ["Import livrare", "Nu oferim", "Glovo, Bolt, Wolt auto-import — fără introducere manuală"],
      ["Export Saga C", "La cerere", "Da — integrare Saga C inclusă"],
      ["NIR auto", "Pro — NIR manual și furnizori", "NIR auto din e-Factura SPV — import direct"],
      ["Cost rețete & marje", "Pro — cost/porție, marjă, can-make", "Nedetaliat pe site — verificați cu furnizorul"],
      ["Funcționare offline", "Nu — necesită internet", "Da — funcționează fără internet"],
      ["Chioșc self-ordering", "Nu este inclus", "Da — disponibil la POSnet"],
      ["KDS bucătărie", "Pro", "Da — disponibil la POSnet"],
      ["Deploy", "Browser cloud — fără instalare", "Aplicație locală — necesită instalare și server"],
      ["Trial gratuit", "15 zile, verificare card 1 €", "Neconfirmat — contactați furnizorul"],
    ],
  },
  {
    slug: "rkeeper",
    path: "/compare/rkeeper",
    competitor: "rKeeper",
    market: "ro",
    metaTitle: "Alternativă rKeeper România — POS simplu, preț listat",
    description:
      "Comparație franchisetech vs rKeeper: sistem enterprise pentru hoteluri și lanțuri vs workspace operațional pentru HoReCa 1–5 locații — preț listat, implementare în ore și Saga.",
    h1: "franchisetech vs rKeeper — simplitate vs suite enterprise",
    intro:
      "rKeeper (UCS) este un sistem enterprise de management restaurant și hotelier cu prezență internațională, folosit în hoteluri, lanțuri de restaurante, cluburi și spații de entertainment. Modulele includ: POS, StoreHouse (gestiune stoc), software hotelier, chioșcuri, r_keeper Delivery, CRM loyalty și aplicație chelner mobil. Prețul este la cotație. franchisetech nu concurează la enterprise — țintește operatorul 1–5 locații care vrea POS, stoc, rețete și Saga la preț listat, cu prima vânzare în ore.",
    betterFor:
      "rKeeper câștigă la lanțuri 10+ locații, hoteluri, cluburi și operatori cu cerințe enterprise: call center, dispatch delivery propriu, CRM avansat, StoreHouse pentru stocuri complexe. franchisetech câștigă pentru cafenea, restaurant sau bistro 1–5 locații care vrea implementare self-serve și preț transparent, fără proiect IT.",
    competitorStrengths: [
      "Sistem enterprise matur — prezență internațională, peste 41.000 de instalări în 47 de țări (declarat de r_keeper)",
      "StoreHouse: gestiune stoc avansată pentru volume mari și rețele",
      "r_keeper Delivery: modul propriu de livrare și dispatch",
      "CRM loyalty integrat — programe de fidelizare pentru lanțuri",
      "Software hotelier (Shelter) — integrare POS + hotel în același ecosistem",
      "Chioșcuri self-ordering și aplicație chelner mobil disponibile",
    ],
    franchisetechStrengths: [
      "Prețuri listate: Core 49€, Operations 79€, Multi-location 89€/locație — fără cotație",
      "Implementare self-serve — prima vânzare în ore, fără proiect IT",
      "Browser POS — fără instalare locală sau mentenanță server",
      "Export Saga C (XML) la cerere — contabilul primește fișierul gata de import",
      "Cost rețete per porție și marjă brută — inclus Pro",
    ],
    sections: [
      {
        title: "Suite enterprise vs operațiuni zilnice simple",
        body: "rKeeper strălucește când aveți 10+ locații cu echipă IT, hotel integrat sau cerințe de dispatch delivery propriu. Pentru un restaurant sau cafenea cu 1–5 locații, rKeeper poate aduce complexitate și costuri de implementare nejustificate. Evaluați ce module veți folosi efectiv înainte de a angaja un proiect de implementare.",
      },
      {
        title: "Preț listat vs cotație — transparență înainte de decizie",
        body: "rKeeper funcționează exclusiv la cotație comercială — prețul depinde de module, terminale, training și contractul de suport. franchisetech listează 49–109€/lună pe site cu personal nelimitat. Calculați costul total rKeeper (licențe + terminale + training + suport anual) înainte de comparație.",
      },
      {
        title: "Delivery — r_keeper Delivery, nu ceva ce oferim",
        body: "rKeeper are r_keeper Delivery, modulul propriu pentru livrare și dispatch. Nu este clar pe site-ul românesc dacă oferă import automat din Glovo/Bolt sau necesită integrare separată. franchisetech nu oferă integrare cu platforme de livrare — dacă acesta e un job central, verificați direct cu rKeeper.",
      },
    ],
    faqs: [
      {
        question: "rKeeper se potrivește unui restaurant cu 1–3 locații fără IT intern?",
        answer:
          "rKeeper poate fi supradimensionat pentru 1–3 locații fără echipă IT. Implementarea necesită timp și resurse; costul total (licențe + hardware + training + suport) poate fi semnificativ față de un operator mic. franchisetech oferă alternativa self-serve la preț listat — comparați costul total pe 12 luni.",
      },
      {
        question: "rKeeper are import automat din Glovo și Bolt?",
        answer:
          "Site-ul rKeeper Romania nu detaliază integrarea cu Glovo sau Bolt — contactați office@rkeeper.ro pentru clarificare. franchisetech nu oferă integrare cu platforme de livrare.",
      },
      {
        question: "rKeeper exportă în Saga pentru contabil?",
        answer:
          "Nu este menționat pe site-ul rKeeper România. Verificați cu furnizorul (+40 741 065 298). franchisetech oferă export Saga C (XML) la cerere.",
      },
    ],
    related: [
      { label: "Comparație Expressoft", href: "/compare/expressoft" },
      { label: "Prețuri", href: "/pricing" },
      { label: "Multi-locație", href: "/pricing" },
    ],
    rows: [
      ["Segment țintă", "HoReCa 1–5 locații, implementare rapidă", "Lanțuri, hoteluri, cluburi — enterprise"],
      ["Implementare", "Ore — self-serve, fără proiect IT", "Săptămâni–luni — proiect dedicat, training"],
      ["Preț", "49–109€/lună listat pe site", "Cotație comercială — contact office@rkeeper.ro"],
      ["Import livrare", "Nu oferim", "Neconfirmat pe site RO — verificați cu furnizorul"],
      ["Export Saga", "Inclus Pro (79€/lună)", "Neconfirmat pe site RO — verificați cu furnizorul"],
      ["Gestiune stoc", "Pro — stoc, furnizori, NIR", "StoreHouse — modul enterprise dedicat"],
      ["KDS bucătărie", "Pro", "Disponibil — punct forte rKeeper"],
      ["Chioșc self-ordering", "Nu este inclus", "Disponibil la rKeeper"],
      ["CRM loyalty", "Nu este inclus", "Disponibil la rKeeper — punct forte"],
      ["Cost rețete & marje", "Pro — cost/porție, marjă, can-make", "Neconfirmat pe site — verificați cu furnizorul"],
    ],
  },
];

export const COMPARE_HUB_PATH = "/compare";

/** Romania compare hub groupings */
export const RO_COMPARE_HORECA_SLUGS = [
  "ebriza",
  "bit-soft",
  "rezosoft",
  "expressoft",
  "vilicorest",
  "boogit",
  "freyapos",
  "posnet",
  "rkeeper",
  "nexuserp",
] as const;

export const RO_COMPARE_INVOICING_SLUGS = ["smartbill", "oblio", "saga"] as const;

export function comparisonsByMarket(market?: ComparisonPage["market"]) {
  if (!market) return comparisonPages;
  return comparisonPages.filter((p) => p.market === market);
}
