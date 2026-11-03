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
    ["Plăți / hardware", "Înregistrează metoda de plată; driver fiscal când este configurat (România)", "Variază — adesea mai puternic pe terminale de plată"],
    ["Stoc & achiziții", "Produse, ingrediente, furnizori, evidențe de achiziție, stoc minim", "Variază pe produs — adesea orientat pe facturare, nu pe stoc de bucătărie"],
    ["Cost rețete", "Constructor de rețete, cost per porție, marjă, câte porții puteți face", "De obicei limitat sau absent în unelte orientate pe facturare"],
    ["Închidere casă / raport Z", "Numerar de deschidere, intrări/ieșiri numerar, așteptat vs numărat, închidere zilnică", "Variază — poate necesita un flux separat de închidere"],
    ["Bonuri fiscale (RO)", "Integrare cu driverul fiscal când este activată și configurată", "Variază — verificați modulul fiscal actual și configurarea"],
    ["Echipă / preț", "Personal nelimitat pe planurile plătite — fără taxă per casier", "Verificați prețul actual per utilizator sau terminal"],
    ["Potrivire ideală", "Afaceri alimentare mici care vor POS + stoc + rețete + evidențe zilnice în același loc", `Afaceri a căror nevoie principală este punctul forte al ${competitor}`],
  ];
}

export const comparisonPages: ComparisonPage[] = [
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
      "Ebriza afișează Pro de la 49€/locație/lună — același nivel de preț ca franchisetech Pro. Diferența pe care mulți operatori o descoperă târziu: rapoartele personalizate (Insights) sunt add-on separat (+19€/lună), iar Kitchen Display (+29€/lună), integrarea Saga (+39€/lună) sau comenzile delivery pot adăuga zeci de euro în plus. franchisetech Pro include raport vânzări, raport Z și raport TVA — fără upsell doar ca să vedeți ce s-a vândut ieri.",
    betterFor:
      "Ebriza poate fi potrivită dacă aveți nevoie de ecosistemul lor complet (Premium/Titanium, integrări delivery la volum). franchisetech merită evaluat dacă vreți casă + rapoarte zilnice clare la 49€, fără să plătiți extra doar pentru Insights.",
    competitorStrengths: [
      "Planuri tiered (Pro / Premium / Titanium) cu multe module HoReCa",
      "Integrări delivery și meniu digital la scară",
      "Licențe incluse pe plan (1 pe Pro, 2 pe Premium/Titanium)",
      "Ecosistem matur pentru restaurante cu volum mare",
    ],
    franchisetechStrengths: [
      "Raport vânzări, raport Z și raport TVA incluse în Pro (49€) — fără add-on Insights",
      "Fără taxă per angajat; personal nelimitat pe plan",
      "Stoc, NIR, rețete și rapoarte marjă incluse din planul Pro (49€) — fără salt la un tier superior doar pentru gestiune",
      "Browser POS — 15 zile de probă Pro de la crearea contului, fără card; bonurile fiscale prin FiscalNet (licență separată)",
    ],
    sections: [
      {
        title: "Lecția: prețul de listă ≠ costul raportării",
        body: "Mulți operatori compară doar „49€ Pro”. Pe pagina publică de prețuri Ebriza (verificată la 3 noiembrie 2026), Insights (rapoarte personalizate) costă +19€/lună, Kitchen Display +29€/lună, integrarea Saga +39€/lună, iar comenzile delivery sunt tarifate per comandă sau incluse în limită pe planurile superioare. franchisetech nu taxează separat raportul Z sau vânzările zilnice — sunt în abonament.",
      },
      {
        title: "Comparație onestă pe funcții, nu pe marketing",
        body: "Ebriza Premium (99€) și Titanium (179€) adaugă gestiune, NIR automat și rapoarte avansate. franchisetech Pro (49€) acoperă stoc, furnizori, achiziții/NIR și cost rețete pentru majoritatea cafenelelor și restaurantelor mici — cu rapoarte incluse, nu ca add-on.",
      },
      {
        title: "Cum să testați gratuit",
        body: "Rulați paralel, cât timp aveți nevoie: aceleași produse, aceeași echipă, aceeași închidere de zi. Verificați cât plătiți efectiv (plan + add-on-uri) vs cât timp pierdeți reconciliind fără rapoarte clare. franchisetech nu cere card la înscriere — testați complet întâi și decideți după.",
      },
    ],
    faqs: [
      {
        question: "Ebriza Pro și franchisetech Pro costă la fel — care e diferența?",
        answer:
          "Ambele pornesc de la circa 49€/locație/lună. franchisetech Pro include raport vânzări, raport Z (închidere casă) și raport TVA, fără add-on separat pentru raportare. Pe pagina publică Ebriza, Insights (rapoarte personalizate) este listat ca add-on de 19€/lună — verificați factura voastră actuală dacă folosiți Ebriza.",
      },
      {
        question: "Am auzit că raportarea costă extra — e adevărat?",
        answer:
          "La unii furnizori, da: rapoarte avansate sau „Insights” sunt module plătite separat. La franchisetech, rapoartele zilnice de vânzări, Z și TVA sunt incluse în Pro — nu trebuie să cumpărați un add-on doar ca să vedeți ce s-a întâmplat la casă.",
      },
      {
        question: "Ce add-on-uri Ebriza ar putea mări factura?",
        answer:
          "Conform paginii publice de prețuri Ebriza (verificată la 3 noiembrie 2026): Insights +19€/lună, Kitchen Display +29€/lună, integrare Saga +39€/lună, dispozitiv suplimentar +29€, comenzi delivery per comandă sau incluse în limită pe planurile superioare. franchisetech nu folosește același model de add-on pentru rapoarte de bază.",
      },
      {
        question: "Pot folosi franchisetech doar pentru rapoarte și casă?",
        answer:
          "Da. Pro (49€) acoperă casa, produsele și rapoartele zilnice, plus stoc, achiziții și rețete.",
      },
    ],
    related: [
      { label: "Prețuri franchisetech", href: "/pricing" },
      { label: "Raport Z", href: "/features/z-report" },
    ],
    rows: [
      ["Cost configurare", "0€ self-serve", "0€ — onboarding video gratuit cu consultant"],
      ["Timp până la prima vânzare", "Vânzare de test în aceeași zi; bonul fiscal real cere FiscalNet instalat și configurat", "Self-serve, cu ajutor gratuit de la un consultant prin video"],
      ["Preț intrare / locație", "Pro 49€/lună — cu stoc și rețete", "Pro 49€/locație/lună (+ TVA)"],
      ["Raport vânzări zilnic", "Inclus în Pro", "Raportare timp real pe plan; Insights personalizate +19€/lună (add-on)"],
      ["Raport Z / închidere casă", "Inclus în Pro", "Registru de casă pe plan — verificați dacă rapoarte avansate necesită add-on"],
      ["Raport TVA", "Inclus în Pro", "Facturare & e-Factura pe plan — detaliu raport TVA vs add-on Insights"],
      ["Stoc & NIR", "Pro 49€ — stoc, furnizori, achiziții/NIR", "Premium 99€+ sau module gestiune separate"],
      ["Integrări contabilitate (Saga)", "Export Saga C (XML) la cerere, în Pro", "+39€/lună add-on integrare Saga"],
      ["Comenzi delivery / meniu digital", "Nu oferim", "Tarifat per comandă sau inclus în limită pe planurile superioare"],
      ["Personal / utilizatori", "Nelimitat pe plan plătit", "Nelimitat"],
      ["Cost tipic casă + rapoarte zilnice", "49€ (Pro) — rapoarte zilnice incluse", "49€ — raportare în timp real inclusă; Insights (rapoarte personalizate) +19€"],
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
      "boogiT (dezvoltat în Brașov, conform site-ului) a pornit ca platformă de comandă online pentru clienți, dar oferă acum și un sistem POS propriu (pos.boogit.ro) — vânzare, gestiune, rețete, KDS, chioșc self-ordering, comandă QR la masă și integrare Wolt, Bolt Food și Glovo. Nu mai este doar o platformă de livrare — este și un concurent direct pe zona de POS restaurant. franchisetech este workspace-ul operațional: casă în browser, stoc, rețete, raport Z și export Saga, la preț listat pe site.",
    betterFor:
      "Boogit poate câștiga dacă vreți livrare prin platforme, chioșc sau comandă QR integrate direct în același POS. franchisetech câștigă dacă vreți preț listat pe site (fără cotație), cost rețete și marjă per preparat incluse în Pro, și POS în browser.",
    competitorStrengths: [
      "Sistem POS propriu — vânzare, gestiune, KDS, chioșc self-ordering, comandă QR la masă",
      "Integrare Bolt, Wolt și Glovo — comenzile ajung automat pe ecranele de bucătărie (KDS)",
      "Saga apare printre integrările listate pe site",
      "Aplicație proprie de comandă online + livrare pentru clienți",
      "e-Factura și rapoarte de vânzări, comenzi și registru de casă",
    ],
    franchisetechStrengths: [
      "Prețuri listate pe site: Pro 49€, Multi 79€ + 29€/locație suplimentară — fără cotație sau taxă de implementare",
      "POS în browser, fără taxă de setup; bonurile fiscale cer FiscalNet instalat pe dispozitivul de casă",
      "Raport Z zilnic — numerar așteptat vs numărat, fără Excel",
      "Export Saga C (XML) pentru contabil, la cerere — fără transcriere manuală",
      "Cost rețete și marje incluse în Pro — știți marja înainte de a schimba meniul",
    ],
    sections: [
      {
        title: "Boogit nu mai este doar o platformă de livrare",
        body: "Pe lângă aplicația de comandă online pentru clienți, boogiT operează și un POS propriu (pos.boogit.ro) cu vânzare, gestiune, KDS, chioșc self-ordering și integrare Wolt, Bolt Food și Glovo. Dacă evaluați Boogit ca alternativă de POS, comparați-l ca atare — nu doar ca sursă de comenzi online.",
      },
      {
        title: "Preț listat vs. cotație și taxă de implementare",
        body: "Site-ul Boogit nu afișează prețuri pentru POS — FAQ-ul lor menționează o taxă fixă plătită o singură dată pentru implementarea locației, plus un abonament lunar, cu ofertă de la un agent. franchisetech listează 49–79€/lună (+29€/locație suplimentară pe Multi) pe site, fără taxă de implementare separată.",
      },
      {
        title: "Livrare — punct forte Boogit, nu al nostru",
        body: "Boogit integrează Wolt, Bolt Food și Glovo, cu comenzile pe o singură tabletă. franchisetech nu oferă integrare cu platforme de livrare — ne concentrăm pe casă, stoc, rețete și export Saga C (XML), disponibil la cerere. Dacă livrarea prin platforme e o cerință centrală, Boogit acoperă acel job direct.",
      },
    ],
    faqs: [
      {
        question: "Boogit este doar o platformă de livrare?",
        answer:
          "Nu mai este doar atât. Pe lângă aplicația de comandă online pentru clienți, boogiT oferă și un sistem POS propriu (pos.boogit.ro) cu gestiune, KDS, chioșc self-ordering și integrare Wolt, Bolt Food și Glovo. Comparați-l ca alternativă reală de POS, nu doar ca sursă de comenzi.",
      },
      {
        question: "Boogit are export Saga pentru contabil?",
        answer:
          "Saga apare printre integrările listate pe site-ul Boogit, fără detalii despre ce se exportă — verificați cu ei. franchisetech oferă export Saga C (XML), disponibil la cerere.",
      },
      {
        question: "Funcționează franchisetech cu platforme de livrare?",
        answer:
          "Nu. franchisetech nu oferă integrare cu Glovo, Bolt Food sau Tazz — ne concentrăm pe POS la tejghea, stoc, rețete și raport Z. Dacă livrarea prin platforme e centrală pentru afacerea dumneavoastră, Boogit acoperă acel job direct.",
      },
    ],
    related: [
      { label: "Comparație Ebriza", href: "/compare/ebriza" },
      { label: "Prețuri", href: "/pricing" },
      { label: "POS", href: "/features/pos" },
    ],
    rows: [
      ["Ce este", "POS + stoc + rețete + raport Z — management operațional", "POS restaurant (pos.boogit.ro) + app proprie de comandă online"],
      ["Cui se adresează", "Proprietarilor de restaurante/cafenele", "Restaurantelor (POS) și clienților care comandă online"],
      ["POS / casă", "Browser POS — sesiune casă, coș, retururi", "Sistem POS propriu — vânzare, gestiune, KDS"],
      ["Raport Z / închidere", "Inclus în Pro — așteptat vs numărat zilnic", "Site-ul menționează registru de casă — verificați raportul Z cu furnizorul"],
      ["Stoc & NIR", "Pro — stoc, furnizori, NIR", "Gestiune stoc disponibilă — verificați detaliile cu furnizorul"],
      ["Rețete & marje", "Pro — cost porție, marjă, can-make", "Rețete și profit pe produs, din prețurile de achiziție"],
      ["Export contabilitate", "Saga C (XML) disponibil la cerere", "Saga listat ca integrare — detalii la furnizor"],
      ["Integrare livrare", "Nu oferim", "Wolt, Bolt Food, Glovo"],
      ["Chioșc self-ordering / QR masă", "Nu este inclus", "Disponibil — punct forte Boogit"],
      ["Preț", "49–79€/lună (+29€/locație suplimentară pe Multi) listat pe site, fără taxă de implementare", "La cerere — taxă unică de implementare + abonament lunar"],
    ],
  },
];

export const COMPARE_HUB_PATH = "/compare";

/** Romania compare hub groupings */
export const RO_COMPARE_HORECA_SLUGS = [
  "ebriza",
  "bit-soft",
  "rezosoft",
  "vilicorest",
  "boogit",
  "freyapos",
  "nexuserp",
] as const;

export const RO_COMPARE_INVOICING_SLUGS = ["smartbill", "oblio", "saga"] as const;

export function comparisonsByMarket(market?: ComparisonPage["market"]) {
  if (!market) return comparisonPages;
  return comparisonPages.filter((p) => p.market === market);
}
