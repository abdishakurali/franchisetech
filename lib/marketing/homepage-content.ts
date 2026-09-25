import type { MarketingLocale } from "./locale";

// Model support and product photographs: Datecs' own FiscalNet catalogue.
export const fiscalHardware = [
  {
    name: "Datecs DP25",
    image: "/marketing/hardware/datecs-dp25.jpg",
    type: "register",
    source: "https://www.datecs.ro/casa-de-marcat-datecs-dp25.html",
  },
  {
    name: "Datecs DP150",
    image: "/marketing/hardware/datecs-dp150.jpg",
    type: "register",
    source: "https://www.datecs.ro/casa-de-marcat-datecs-dp150.html",
  },
  {
    name: "Datecs FP700",
    image: "/marketing/hardware/datecs-fp700.jpg",
    type: "printer",
    source: "https://www.datecs.ro/imprimanta-fiscala-datecs-fp700.html",
  },
] as const;

const ro = {
  eyebrow: "POS + gestiune pentru cafenele",
  title: "Știi cât te costă de fapt un cappuccino.",
  intro:
    "Casa de marcat îți spune cât ai vândut. FranchiseTech îți spune cât ai consumat, cât a costat și cât ți-a rămas — din rețete și stoc reale.",
  trial: "Creează cont gratuit",
  watch: "Vezi ce face",
  trialNote: "Gratuit pentru totdeauna · fără card necesar · suport în română",
  quickLinks: [
    "Vânzări și stoc",
    "Mod offline",
    "Hardware",
    "Povestea unui client",
  ],
  galleryLabel: "Platforma, în practică",
  galleryTitle: "De la prima comandă la închiderea zilei.",
  galleryIntro:
    "Vezi produsele, urmărește stocul și verifică încasările din aceeași platformă.",
  screens: [
    {
      title: "Vânzări",
      text: "Produse și comenzi la îndemână, direct la tejghea.",
      src: "/marketing/live/pos.png",
      video: "/showcase/product-demo.mp4",
      href: "/features/pos",
    },
    {
      title: "Stoc",
      text: "Cantități disponibile și praguri de reaprovizionare.",
      src: "/marketing/live/stock.png",
      href: "/features/stock-management",
    },
    {
      title: "Rețete și costuri",
      text: "Cost pe rețetă înainte să stabilești prețul de vânzare.",
      src: "/marketing/live/recipes.png",
      href: "/features/recipe-costing",
    },
    {
      title: "Rapoarte",
      text: "Vânzări, încasări și date pentru închiderea zilei.",
      src: "/marketing/live/dashboard.png",
      href: "/features/reporting",
    },
  ],
  benefits: [
    {
      title: "Vinzi simplu",
      text: "Produsele și comenzile sunt la îndemână, direct la tejghea.",
    },
    {
      title: "Stocul se mișcă odată cu vânzarea",
      text: "Vezi cantitățile disponibile și ce trebuie reaprovizionat.",
    },
    {
      title: "Știi marja reală",
      text: "Costurile rețetelor arată ce îți rămâne din fiecare produs.",
    },
    {
      title: "Închizi ziua cu adevărul",
      text: "Compari încasările cu numerarul așteptat într-un singur loc.",
    },
  ],
  benefitsLabel: "Patru lucruri, legate între ele",
  benefitsTitle: "De la prima vânzare până la închiderea zilei.",
  customerProof: {
    label: "Un client, pe față",
    title: "Dolce Nera, Cluj-Napoca",
    caption: "O cafenea, o casă, 238 de produse și 115 rețete întreținute zilnic.",
    stats: [
      { value: "3.800+", label: "bonuri procesate" },
      { value: "9.500+", label: "mișcări de stoc urmărite" },
    ],
  },
  pricing: {
    planText: [
      "POS, produse și închiderea zilei.",
      "Stoc, achiziții, rețete și marje.",
    ],
  },
  enlarge: "Mărește imaginea",
  close: "Închide imaginea",
  more: "Vezi funcționalitățile",
  offlineLabel: "Mod offline",
  offlineTitle: "Internetul se întrerupe. Ai o rezervă la casă.",
  offlineIntro:
    "Cu POS-ul deja deschis, poți pune vânzările în coada locală în timpul unei întreruperi scurte. Vezi ce așteaptă sincronizarea și ce mai are nevoie de bon fiscal.",
  offlineSteps: [
    {
      title: "Înregistrezi local",
      text: "Vânzările rămân în browserul de pe dispozitivul de vânzare.",
    },
    {
      title: "Revine conexiunea",
      text: "POS-ul reîncearcă automat sincronizarea vânzărilor în așteptare.",
    },
    {
      title: "Verifici bonurile",
      text: "Urmărești separat vânzările sincronizate și bonurile fiscale rămase de emis.",
    },
  ],
  offlineNote:
    "Pentru întreruperi scurte: maximum 20 de intrări în coada locală. Păstrează browserul și datele sale. Stocul celorlalte case și plățile bancare nu se actualizează offline; emiterea fiscală depinde de conexiunea locală FiscalNet.",
  offlineLink: "Detalii despre modul offline",
  languagesLabel: "Română și English",
  languagesTitle: "Aceeași platformă. Limba echipei tale.",
  languagesText:
    "Schimbă limba pentru site, aplicație și POS. Preferința se păstrează în acest browser când treci de la prezentare la lucru.",
  hardwareLabel: "Echipamente prin FiscalNet",
  hardwareTitle: "Software-ul nostru. Echipamentul potrivit pentru tine.",
  hardwareIntro:
    "Conectează POS-ul la casa de marcat sau imprimanta fiscală prin FiscalNet configurat local. Mai jos sunt exemple de modele listate de Datecs ca fiind compatibile cu driverul.",
  register: "Casă de marcat",
  printer: "Imprimantă fiscală",
  model: "Vezi modelul",
  hardwareNote:
    "Compatibilitatea se confirmă pentru model, firmware și configurația locală. Hardware-ul și licența FiscalNet se achiziționează separat de la furnizorul tău.",
  hardwareGuide: "Ghid de conectare FiscalNet",
  hardwareSource: "Lista oficială Datecs / FiscalNet",
  deviceTitle: "Pe ecranul care ți se potrivește",
  deviceText:
    "POS în browser pe calculator sau tabletă; rapoarte pe telefon. Tipărirea fiscală are nevoie de driverul și dispozitivul local configurate.",
  proofLink: "Vezi POS-ul într-o cafenea",
  proofCaption: "Înregistrare dintr-o cafenea care folosește franchisetech.",
  pricingLabel: "Prețuri transparente",
  pricingTitle: "Începe cu ce ai nevoie acum.",
  planText: [
    "POS, produse și închiderea zilei.",
    "Adaugă stoc, achiziții, rețete și marje.",
  ],
  month: "lună",
  pricingLink: "Compară toate planurile",
  pricingNote:
    "Prețuri fără TVA. FiscalNet, echipamentele și serviciile terțe se plătesc separat.",
  faqLabel: "Întrebări frecvente",
  faqTitle: "Înainte de prima zi la casă.",
  faq: [
    {
      question: "Pot lucra fără internet?",
      answer:
        "Cu POS-ul deja încărcat, vânzările se pot pune într-o coadă locală de maximum 20 de intrări. Sincronizarea se reîncearcă atunci când revine conexiunea. Păstrează datele browserului și verifică bonurile fiscale în așteptare.",
    },
    {
      question: "Bonul fiscal se emite și offline?",
      answer:
        "Înregistrarea locală a vânzării și emiterea bonului fiscal sunt etape separate. Emiterea depinde de FiscalNet și echipamentul local configurat. Starea bonului trebuie verificată în POS.",
    },
    {
      question: "Ce echipamente pot conecta?",
      answer:
        "Case de marcat și imprimante compatibile cu FiscalNet, inclusiv modelele Datecs prezentate mai sus. Confirmă modelul exact și configurarea cu furnizorul tău; echipamentul și licența se plătesc separat.",
    },
    {
      question: "Pot folosi aplicația în engleză?",
      answer:
        "Da. Româna și engleza sunt disponibile pe site, în aplicație și în POS, cu o preferință comună în browser. Fotografiile, capturile de ecran și clipurile își păstrează limba originală.",
    },
    {
      question: "Cum funcționează planul gratuit?",
      answer:
        "Planul Free e disponibil imediat la crearea contului, fără card, și nu expiră. Configurarea ghidată a produselor și fluxului de vânzare este disponibilă în aplicație.",
    },
  ],
  finalTitle: "Următoarea tură, cu mai multă claritate.",
  finalText:
    "Începe cu produsele tale și verifică fluxul de la vânzare la închiderea zilei.",
};

const en: typeof ro = {
  eyebrow: "For cafés, restaurants and shops",
  title: "POS and operations for a business that wants to know what remains.",
  intro:
    "Sales, fiscal receipts, stock and margins in one place. With offline queuing for short internet outages and a clear view of your day.",
  trial: "Create a free account",
  watch: "Watch a customer's story",
  trialNote: "Free forever · no card required · Romanian support",
  quickLinks: ["Sales and stock", "Offline mode", "Hardware", "Customer story"],
  galleryLabel: "The platform in practice",
  galleryTitle: "From the first order to closing time.",
  galleryIntro:
    "Find products, follow stock and check takings in the same platform.",
  screens: [
    {
      title: "Sales",
      text: "Products and orders at your fingertips, right at the counter.",
      src: "/marketing/live/pos.png",
      video: "/showcase/product-demo.mp4",
      href: "/features/pos",
    },
    {
      title: "Stock",
      text: "Available quantities and reorder thresholds.",
      src: "/marketing/live/stock.png",
      href: "/features/stock-management",
    },
    {
      title: "Recipes and costs",
      text: "See recipe costs before setting your selling price.",
      src: "/marketing/live/recipes.png",
      href: "/features/recipe-costing",
    },
    {
      title: "Reports",
      text: "Sales, takings and the records you need to close the day.",
      src: "/marketing/live/dashboard.png",
      href: "/features/reporting",
    },
  ],
  benefits: [
    {
      title: "Sell simply",
      text: "Products and orders stay within reach at the counter.",
    },
    {
      title: "Stock moves with every sale",
      text: "See available quantities and what needs replenishing.",
    },
    {
      title: "Know the real margin",
      text: "Recipe costs show what remains from every product.",
    },
    {
      title: "Close the day with truth",
      text: "Compare takings with expected cash in one place.",
    },
  ],
  benefitsLabel: "Four connected essentials",
  benefitsTitle: "From the first sale to closing the day.",
  customerProof: {
    label: "Used in a real café",
    title: "A real business. A clearer day.",
    caption: "FranchiseTech used daily in a Romanian café.",
    stats: [
      { value: "3,800+", label: "receipts recorded" },
      { value: "9,500+", label: "stock movements" },
    ],
  },
  pricing: {
    planText: [
      "POS, products and daily closing.",
      "Stock, purchasing, recipes and margins.",
    ],
  },
  enlarge: "Enlarge image",
  close: "Close image",
  more: "Explore features",
  offlineLabel: "Offline mode",
  offlineTitle: "Internet interrupted. A backup at the till.",
  offlineIntro:
    "With the POS already open, queue sales locally during a short outage. See what is waiting to sync and what still needs a fiscal receipt.",
  offlineSteps: [
    {
      title: "Record locally",
      text: "Sales stay in the browser on your selling device.",
    },
    {
      title: "Reconnect",
      text: "The POS automatically retries syncing pending sales.",
    },
    {
      title: "Check receipts",
      text: "Track synced sales and outstanding fiscal receipts separately.",
    },
  ],
  offlineNote:
    "For short outages: up to 20 entries in the local queue. Keep the browser and its data. Other tills' stock and bank payments do not update offline; fiscal printing depends on your local FiscalNet connection.",
  offlineLink: "About offline mode",
  languagesLabel: "Română and English",
  languagesTitle: "One platform. Your team's language.",
  languagesText:
    "Switch the language for the website, app and POS. Your preference stays in this browser as you move from exploring to working.",
  hardwareLabel: "Hardware through FiscalNet",
  hardwareTitle: "Our software. Hardware that fits your business.",
  hardwareIntro:
    "Connect your POS to a fiscal register or printer through locally configured FiscalNet. These are examples of models Datecs lists as compatible with the driver.",
  register: "Fiscal register",
  printer: "Fiscal printer",
  model: "View model",
  hardwareNote:
    "Compatibility depends on the exact model, firmware and local setup. Hardware and the FiscalNet licence are purchased separately from your supplier.",
  hardwareGuide: "FiscalNet connection guide",
  hardwareSource: "Official Datecs / FiscalNet list",
  deviceTitle: "On the screen that suits you",
  deviceText:
    "Browser POS on a computer or tablet; reports on your phone. Fiscal printing requires a configured local driver and device.",
  proofLink: "See the POS in a café",
  proofCaption: "Recorded in a café using franchisetech.",
  pricingLabel: "Transparent pricing",
  pricingTitle: "Start with what you need today.",
  planText: [
    "POS, products and daily closing.",
    "Adds stock, purchasing, recipes and margins.",
  ],
  month: "month",
  pricingLink: "Compare all plans",
  pricingNote:
    "Prices exclude VAT. FiscalNet, hardware and third-party services are separate.",
  faqLabel: "Frequently asked questions",
  faqTitle: "Before your first day at the till.",
  faq: [
    {
      question: "Can I work without internet?",
      answer:
        "With the POS already loaded, sales can be stored in a local queue of up to 20 entries. Sync retries when the connection returns. Keep browser data intact and check any pending fiscal receipts.",
    },
    {
      question: "Will fiscal receipts print offline?",
      answer:
        "Recording a sale locally and issuing a fiscal receipt are separate steps. Printing depends on your configured FiscalNet and local equipment. Check the receipt status in the POS.",
    },
    {
      question: "Which devices can I connect?",
      answer:
        "FiscalNet-compatible fiscal registers and printers, including the Datecs models shown above. Confirm the exact model and setup with your supplier; hardware and licensing are purchased separately.",
    },
    {
      question: "Can I use the app in English?",
      answer:
        "Yes. Romanian and English are available on the website, in the app and in the POS, with a shared browser preference. Photos, screenshots and videos retain their original language.",
    },
    {
      question: "How does the free plan work?",
      answer:
        "The Free plan is available immediately when you create your account, with no card required, and never expires. In-app guidance helps configure products and the sales workflow.",
    },
  ],
  finalTitle: "Start your next shift with a clearer picture.",
  finalText:
    "Bring your products and check the workflow from the first sale to daily closing.",
};

export function getHomepageContent(locale: MarketingLocale) {
  return locale === "ro" ? ro : en;
}
