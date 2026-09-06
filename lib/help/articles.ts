export type HelpStep = {
  title: string;
  body: string;
  screenshot?: string;
  titleRo?: string;
  bodyRo?: string;
};

export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  steps: HelpStep[];
  relatedSlugs?: string[];
  titleRo?: string;
  descriptionRo?: string;
};

export type HelpCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
  labelRo?: string;
  descriptionRo?: string;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: "getting-started", label: "Getting started",    icon: "🚀", description: "Set up your account and get selling fast", labelRo: "Primii pași", descriptionRo: "Configurați-vă contul și începeți să vindeți rapid" },
  { id: "pos",             label: "POS & selling",      icon: "🛒", description: "Make sales, apply discounts, and take payments", labelRo: "Casă & vânzări", descriptionRo: "Realizați vânzări, aplicați reduceri și încasați plăți" },
  { id: "products",        label: "Products",           icon: "📦", description: "Add products, set prices, and manage your menu", labelRo: "Produse", descriptionRo: "Adăugați produse, setați prețuri și gestionați meniul" },
  { id: "stock",           label: "Stock & purchases",  icon: "📊", description: "Track stock levels and record supplier deliveries", labelRo: "Stoc & achiziții", descriptionRo: "Urmăriți nivelurile de stoc și înregistrați recepțiile de la furnizori" },
  { id: "reports",         label: "Reports",            icon: "📈", description: "Daily Z-reports, sales summaries, and VAT breakdowns", labelRo: "Rapoarte", descriptionRo: "Rapoarte Z zilnice, sumar vânzări și defalcare TVA" },
  { id: "recipes",         label: "Recipe costing",     icon: "🧾", description: "Link ingredients to dishes and see your margins", labelRo: "Cost rețete", descriptionRo: "Legați ingredientele de preparate și vedeți marjele" },
  { id: "settings",        label: "Settings",           icon: "⚙️",  description: "Manage your business, team, and billing", labelRo: "Setări", descriptionRo: "Gestionați afacerea, echipa și facturarea" },
  { id: "romania",         label: "Romania & FiscalNet", icon: "🇷🇴", description: "FiscalNet fiscal receipts, TVA rates, and lei/RON setup for Romanian businesses", labelRo: "România & FiscalNet", descriptionRo: "Bonuri fiscale prin FiscalNet, cote TVA și configurare lei/RON pentru afaceri din România" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "loyalty-program-setup",
    title: "Set up the loyalty program",
    titleRo: "Configurați programul de fidelizare",
    description: "Turn on the phone-based stamp card, configure the reward, and see regulars who haven't been back.",
    descriptionRo: "Activați cardul de ștampile pe numărul de telefon, configurați recompensa și vedeți clienții fideli care nu au mai venit.",
    category: "settings",
    icon: "🎁",
    steps: [
      { title: "Enable the module", body: "Open [Settings → Integrations](/app/settings?tab=integrations) and find the **Program de fidelizare** card in the Marketplace. Click **Activează**. It's included in the Operations plan, and available as a paid add-on on Starter.", screenshot: "loyalty-marketplace.png",
        titleRo: "Activați modulul", bodyRo: "Deschideți [Setări → Integrări](/app/settings?tab=integrations) și găsiți cardul **Program de fidelizare** din Marketplace. Apăsați **Activează**. Este inclus în planul Operations și disponibil ca add-on plătit pe Starter." },
      { title: "Configure the reward", body: "Open [Loyalty settings](/app/settings/loyalty). Choose how many stamps earn a reward (3–20), pick **Discount fix** (a fixed lei amount off the total) or **Produs gratuit** (a free item, applied manually by the cashier), then set the thresholds for the regulars-at-risk panel — minimum visits and days of absence. Click **Salvează**.", screenshot: "loyalty-settings.png",
        titleRo: "Configurați recompensa", bodyRo: "Deschideți [Setări fidelizare](/app/settings/loyalty). Alegeți câte ștampile aduc o recompensă (3–20), alegeți **Discount fix** (o sumă fixă în lei scăzută din total) sau **Produs gratuit** (aplicat manual de casier), apoi setați pragurile pentru panoul de clienți fideli în risc — vizite minime și zile de absență. Apăsați **Salvează**." },
      { title: "How it works at checkout", body: "In [POS](/app/pos), select the customer as usual. A **Fidelizare** panel appears showing stamp progress. Every completed sale adds a stamp automatically — nothing extra for staff to do. Once the reward is ready, tap it to apply the discount; tap again to undo it before charging.", screenshot: "loyalty-pos-reward.png",
        titleRo: "Cum funcționează la casă", bodyRo: "În [POS](/app/pos), selectați clientul ca de obicei. Apare un panou **Fidelizare** care arată progresul ștampilelor. Fiecare vânzare finalizată adaugă automat o ștampilă — nimic în plus pentru personal. Când recompensa e gata, atingeți-o pentru a aplica reducerea; atingeți din nou pentru a o anula înainte de încasare." },
      { title: "See who's drifting away", body: "Open [Customers](/app/customers). The **Clienți fideli care nu au mai venit** panel lists regulars who used to visit often but haven't been seen recently, ranked by how much they've spent — useful for a personal follow-up.", screenshot: "loyalty-customers.png",
        titleRo: "Vedeți cine s-a îndepărtat", bodyRo: "Deschideți [Clienți](/app/customers). Panoul **Clienți fideli care nu au mai venit** listează clienții obișnuiți care veneau des dar nu au mai fost văzuți recent, ordonați după cât au cheltuit — util pentru o urmărire personală." },
    ],
    relatedSlugs: ["make-a-sale", "manage-settings"],
  },
];

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categoryId);
}

export function getArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
