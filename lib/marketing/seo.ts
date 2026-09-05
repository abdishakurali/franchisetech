import type { Metadata } from "next";
import { createElement, type ComponentType } from "react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { comparisonPages } from "@/lib/marketing/comparisons";
import { primaryIndustryPages } from "@/lib/marketing/industry-page-content";
import { isLeanPublicFeature } from "@/lib/product-scope";
import {
  OwnerDashboardProof,
  OwnerPosProof,
  OwnerRecipeProof,
  OwnerSetupGuideProof,
  OwnerStockProof,
  OwnerSuppliersProof,
  OwnerZReportProof,
} from "@/components/marketing/OwnerProofScreens";

export type { ComparisonPage } from "@/lib/marketing/comparisons";
export { comparisonPages, comparisonsByMarket, COMPARE_HUB_PATH } from "@/lib/marketing/comparisons";

export const SITE_URL = "https://franchisetech.ro";
export const BRAND = "franchisetech";
export const DEFAULT_TITLE = "franchisetech — POS & Business Control for Food Businesses";
export const DEFAULT_DESCRIPTION =
  "Stop guessing after service: run POS, close the till, track stock, see margins, and review daily sales — one platform for cafes and restaurants. No per-seat fees.";

export type IndustryPainPoint = { title: string; text: string };

export type IndustryFeatureRow =
  | { title: string; body: string; image: string; imageAlt: string; path?: string }
  | { title: string; body: string; component: ComponentType; imageAlt?: string; path?: string };

export type IndustryCompetitorRow = [area: string, franchisetech: string, competitor: string];

export type IndustryTestimonial = { quote: string; attribution: string };

export type IndustryShowcase =
  | { src: string; path: string; alt: string }
  | { component: ComponentType; alt: string };

export type SeoPage = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bullets: string[];
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  image?: string;
  /** Live-rendered replacement for `image` in page-body hero slots (not OG meta — `image` still feeds pageMetadata()). */
  heroComponent?: ComponentType;
  /** Industry vertical landing — optional extended fields */
  heroBefore?: string;
  heroHighlight?: string;
  heroAfter?: string;
  heroSubheadline?: string;
  painPoints?: IndustryPainPoint[];
  featureRows?: IndustryFeatureRow[];
  competitorSlug?: string;
  competitorRows?: IndustryCompetitorRow[];
  testimonial?: IndustryTestimonial;
  showcase?: IndustryShowcase;
  ctaTitle?: string;
  ctaSubtitle?: string;
};

export const featurePages: SeoPage[] = [
  {
    slug: "pos",
    path: "/features/pos",
    eyebrow: "POS register",
    title: "Simple POS for Cafes and Food Businesses",
    metaTitle: "Simple POS for Cafes and Small Food Businesses",
    description: "Run sales, open and close the till, track cash/card payments, issue receipts, and keep transaction records in franchisetech.",
    h1: "A simple POS register built for small food businesses",
    intro: "franchisetech keeps the till practical: products, customers, cash/card payments, receipts, refunds, and close-of-day records in one place.",
    bullets: ["Fast product grid and cart", "Open and close till sessions", "Cash, card, and other payment tracking", "Customers, receipts, transactions, refunds, and voids"],
    sections: [
      { title: "Run the till without clutter", body: "Staff can add products, select a payment method, attach a customer name, and complete a sale without moving through multiple back-office screens." },
      { title: "Keep every sale traceable", body: "Transactions, refunds, void reasons, receipts, and cash movements are recorded so owners can review what happened after a busy day." },
      { title: "Close the day with confidence", body: "Opening cash, cash sales, card sales, cash in/out, expected cash, counted cash, and difference are kept together for daily cash-up." },
    ],
    faqs: [
      { question: "Is franchisetech a payment terminal?", answer: "No. franchisetech records POS sales and payment method. Integrated payment hardware is planned but should not be assumed today." },
      { question: "Can I track refunds and voids?", answer: "Yes. franchisetech keeps refunds and voids with a reason so the till record stays clear." },
      { question: "Can I use it on a tablet at the counter?", answer: "Yes. franchisetech runs in the browser — laptop, tablet, or till screen." },
      { question: "How many staff can use the register?", answer: "Unlimited. Add cashiers, managers, and kitchen roles at no extra per-user cost." },
    ],
    related: [{ label: "Z-report", href: "/features/z-report" }, { label: "Cafes", href: "/industries/cafes" }, { label: "What cafes need from POS", href: "/resources/pos-system-for-small-cafes" }],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
  {
    slug: "stock-management",
    path: "/features/stock-management",
    eyebrow: "Stock control",
    title: "Stock Management for Food Businesses",
    metaTitle: "Stock Management for Food Businesses — Ingredients, Inventory & Low Stock Alerts",
    description: "Track products, ingredients, purchases, low stock, and can-make counts with franchisetech stock management.",
    h1: "Stock management for food businesses — ingredients, products, and daily operations",
    intro: "franchisetech connects products, purchases, suppliers, recipes, and sales so small food businesses can see what is in stock and what needs attention.",
    bullets: ["Ingredients tracked as products", "Purchases increase stock", "Recipe sales can reduce ingredient stock", "Low-stock and can-make visibility"],
    sections: [
      { title: "Products and ingredients in one system", body: "Sellable items and ingredients can live in the same product list, with clear flags for POS availability and stock tracking." },
      { title: "Purchases update the stock picture", body: "Supplier purchases record quantities and costs so ingredient values and reorder decisions are easier to review." },
      { title: "Know what you can make", body: "Recipe quantities and current stock help owners understand how many portions can be made before buying more ingredients." },
    ],
    faqs: [
      { question: "Can franchisetech replace a warehouse system?", answer: "No. It is a practical stock tool for small food operators, not a complex enterprise warehouse platform." },
      { question: "Can purchases update stock?", answer: "Yes. Purchases can be recorded against products and suppliers to keep stock movement clear." },
      { question: "Can POS sales reduce ingredient stock?", answer: "Yes, when recipes are configured, sales can reduce the stock of recipe ingredients." },
    ],
    related: [{ label: "Recipe costing", href: "/features/recipe-costing" }, { label: "Stock control article", href: "/resources/food-business-stock-control" }, { label: "Restaurants", href: "/industries/restaurants" }],
    image: "/showcase/stock-levels.png",
    heroComponent: OwnerStockProof,
  },
  {
    slug: "recipe-costing",
    path: "/features/recipe-costing",
    eyebrow: "Recipe costing",
    title: "Recipe Costing Software for Cafes",
    metaTitle: "Recipe Costing Software and Food Cost Calculator for Cafes",
    description: "Calculate recipe costs, margins, and can-make counts for cafe products with franchisetech.",
    h1: "Recipe costing that shows the real margin behind each product",
    intro: "franchisetech helps food businesses turn ingredients into recipes, calculate cost per portion, compare against sale price, and see margin.",
    bullets: ["Ingredient-level recipe builder", "Cost per portion", "Gross margin tracking", "Can-make from current stock"],
    sections: [
      { title: "Build recipes from ingredients", body: "Add ingredients such as chicken, lettuce, dressing, bread, or packaging to a finished product and let franchisetech calculate the recipe cost." },
      { title: "See margin before you sell", body: "Compare cost with sale price so low-margin products are visible before they quietly reduce profit." },
      { title: "Plan from stock", body: "Can-make counts help teams understand whether stock supports today’s menu without guessing." },
    ],
    faqs: [
      { question: "Can I cost a Chicken Caesar product?", answer: "Yes. Add chicken, lettuce, dressing, cheese, croutons, packaging, and quantities to calculate a cost and margin." },
      { question: "Does franchisetech include tax advice?", answer: "No. franchisetech helps keep organised records. It does not replace professional accounting or tax advice." },
      { question: "Can recipes connect to POS?", answer: "Yes. Recipe products can be sold through POS and used for stock calculations." },
    ],
    related: [{ label: "Recipe costing guide", href: "/resources/recipe-costing-for-cafes" }, { label: "Stock management", href: "/features/stock-management" }, { label: "Health bars", href: "/industries/health-bars" }],
    image: "/showcase/recipe-costing.png",
    heroComponent: OwnerRecipeProof,
  },
  {
    slug: "z-report",
    path: "/features/z-report",
    eyebrow: "Till close",
    title: "Z-report and Till Closing Report",
    metaTitle: "Daily Z-report, Till Closing Report, and Cash Reconciliation",
    description: "Use franchisetech to track opening cash, cash/card totals, cash in/out, expected cash, counted cash, and till difference.",
    h1: "Daily Z-report and cash reconciliation for small food businesses",
    intro: "franchisetech brings daily close figures together so owners can review sales and cash without rebuilding the day from memory.",
    bullets: ["Opening cash", "Cash and card totals", "Cash in/out movements", "Expected cash, counted cash, and difference"],
    sections: [
      { title: "Close the till cleanly", body: "Record counted cash, notes, and cash difference at the end of the day so the register has a clear close point." },
      { title: "Review sales by payment type", body: "Cash and card totals help owners compare till records against cash in the drawer and payment provider totals." },
      { title: "Keep records organised", body: "franchisetech helps you keep organised records. It does not replace professional accounting, tax, legal, or food-safety advice." },
    ],
    faqs: [
      { question: "What is a Z-report?", answer: "A Z-report is a close-of-day till summary showing sales and cash reconciliation for a register session or day." },
      { question: "Can I record cash in and cash out?", answer: "Yes. Cash movements can be recorded with reasons so expected cash stays clear." },
      { question: "Does this replace my accountant?", answer: "No. franchisetech helps keep organised sales and till records. Professional tax and accounting advice remains your responsibility." },
    ],
    related: [{ label: "Z-report explained", href: "/resources/z-report-explained" }, { label: "POS feature", href: "/features/pos" }, { label: "Cash-up guide", href: "/resources/cash-up-at-end-of-day" }],
    image: "/showcase/reports-dashboard.png",
    heroComponent: OwnerZReportProof,
  },
  {
    slug: "purchases-suppliers",
    path: "/features/purchases-suppliers",
    eyebrow: "Purchases & suppliers",
    title: "Supplier Purchases and Stock Receiving",
    metaTitle: "Purchases, Suppliers, and Stock Receiving for Food Businesses",
    description: "Record supplier purchases, track spend by vendor, and keep stock levels aligned with what you buy and sell.",
    h1: "Purchases and suppliers in the same workspace as POS",
    intro: "franchisetech connects suppliers, purchase records, and stock so owners can see what was bought, from whom, and how it affects inventory.",
    bullets: ["Supplier directory with contact details", "Purchase records and spend by vendor", "Stock increases from received goods", "Import purchases from CSV"],
    sections: [
      { title: "Know supplier spend", body: "See total spend per supplier and purchase history without a separate spreadsheet." },
      { title: "Stock follows purchases", body: "Received purchases can increase product stock so on-hand quantities stay current." },
      { title: "Works with recipes", body: "Ingredient purchases feed recipe costing and can-make calculations." },
    ],
    faqs: [
      { question: "Can I import old purchase data?", answer: "Yes. CSV import is available for purchases when you are migrating from another system." },
      { question: "Is this a full ERP?", answer: "No. It is practical purchase tracking for small food operators, not enterprise procurement." },
    ],
    related: [{ label: "Stock management", href: "/features/stock-management" }, { label: "Recipe costing", href: "/features/recipe-costing" }],
    image: "/showcase/suppliers.png",
    heroComponent: OwnerSuppliersProof,
  },
  {
    slug: "nir",
    path: "/features/nir",
    eyebrow: "NIR / Purchases",
    title: "Digital NIR for Restaurants and Cafes",
    metaTitle: "NIR Digital for Restaurants — Goods Receipt Notes in franchisetech",
    description:
      "Record supplier NIR (Notă de intrare-recepție), track purchase VAT, and update stock when goods are issued — in the same workspace as POS.",
    h1: "NIR and supplier purchases without a separate spreadsheet",
    intro:
      "Romanian food businesses need clear goods-in records. franchisetech links suppliers, purchase lines, draft vs issued NIR, and stock updates in one place.",
    bullets: [
      "Create NIR with supplier and line items",
      "Draft vs issued — stock updates only when issued",
      "Purchase VAT totals for review",
      "Import purchases from CSV",
      "Supplier directory with CUI/VAT and spend tracking",
    ],
    sections: [
      { title: "Draft first, issue when goods arrive", body: "Save a purchase as draft while you verify the delivery. When you issue the NIR, stock levels update — no duplicate stock movements from drafts." },
      { title: "Supplier spend in one view", body: "See total purchases and VAT per supplier alongside daily sales — useful for owners and accountants at month-end." },
      { title: "Connected to stock and recipes", body: "Issued purchases increase ingredient stock. Recipe costing and margin reports use the same product and cost data." },
    ],
    faqs: [
      { question: "What is NIR in franchisetech?", answer: "A purchase / goods receipt record (Notă de intrare-recepție) with supplier, lines, quantities, costs, and VAT — linked to stock when issued." },
      { question: "Does draft change stock?", answer: "No. Only issued NIR updates stock quantities." },
      { question: "Can I import old purchase data?", answer: "Yes. CSV import is available for purchases when migrating from Excel or another system." },
      { question: "Is this a replacement for Saga or SmartBill invoicing?", answer: "No. franchisetech handles operational purchases and stock. Your accountant may still use Saga/SmartBill for fiscal invoicing — many operators run both." },
    ],
    related: [
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Purchases & suppliers", href: "/features/purchases-suppliers" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/suppliers.png",
    heroComponent: OwnerSuppliersProof,
  },
  {
    slug: "offline",
    path: "/features/offline",
    eyebrow: "Offline POS",
    title: "POS with Offline Mode — Sell When Internet Drops",
    metaTitle: "Offline POS for Cafes and Restaurants | franchisetech",
    description:
      "Keep selling when Wi-Fi fails: franchisetech saves sales locally and syncs when the connection returns — browser-based, no installed POS lock-in.",
    h1: "Sell through a connection drop — sync when you're back online",
    intro:
      "Unstable internet is normal in Romanian HoReCa. franchisetech queues sales locally during offline periods and syncs them when connectivity returns, so service does not stop at the till.",
    bullets: [
      "Local save when offline",
      "Automatic sync when internet returns",
      "Cash, card, and split payments recorded",
      "Works in the browser on tablet or till PC",
      "No per-seat fees — unlimited staff",
    ],
    sections: [
      { title: "Service keeps moving", body: "Staff can complete sales during short outages. Transactions are stored locally and uploaded when the browser reconnects." },
      { title: "Clear sync status", body: "The till shows when you are offline and when queued sales have synced — so managers know records are complete." },
      { title: "Not a separate offline app", body: "Same browser POS you use every day — no second installed program or duplicate product catalogue." },
    ],
    faqs: [
      { question: "Does offline mode work without installing software?", answer: "Yes. franchisetech runs in the browser. Offline queuing is built into the POS — no separate APK required for basic offline sales." },
      { question: "Will FiscalNet print offline?", answer: "Fiscal receipts depend on your local FiscalNet setup and fiscal device. Operational sale recording can queue offline; fiscal printing follows your configured hardware path." },
      { question: "What happens if sync fails?", answer: "Queued sales stay in the browser until sync succeeds. Staff should avoid clearing browser data during an outage. Contact support if sync does not complete after reconnecting." },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
  {
    slug: "setup-onboarding",
    path: "/features/setup-onboarding",
    eyebrow: "Setup guide",
    title: "Guided Setup for New Businesses",
    metaTitle: "From New Account to First Sale in Under an Hour | franchisetech",
    description: "Free in-app setup: demo products, open till, and first test sale — most cafes finish core steps in under an hour.",
    h1: "From new account to first sale in under an hour",
    intro: "The in-app setup guide walks you from signup through demo products, opening the till, and your first test sale — step by step, at no cost.",
    bullets: ["0–15 min: signup and business settings", "15–45 min: demo products and payment methods", "45–60 min: open till and first test sale"],
    sections: [
      { title: "Clear milestones", body: "Each step links to the right screen — settings, POS, or reports — so setup stays focused." },
      { title: "Guided self-serve setup", body: "Signup seeds demo products and payment methods. The guided checklist tracks progress from first product to first sale — the 15-day trial starts after a one-time €1 card verification." },
    ],
    faqs: [
      { question: "How long does setup take?", answer: "Core path (signup → demo products → open till → first sale): most cafes finish in under an hour. A full catalog migration with 200+ products may take 1–2 days — spread it over your trial." },
      { question: "What does the timeline look like?", answer: "0–15 min: account and settings. 15–45 min: products and payments. 45–60 min: open till and first test sale. Stock and recipes can wait until after the till is working." },
      { question: "Can I skip steps?", answer: "Yes. The guide is a checklist, not a blocker. You can return to any step later." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Pricing", href: "/pricing" }],
    image: "/showcase/setup-guide.png",
    heroComponent: OwnerSetupGuideProof,
  },
  {
    slug: "qr-code-receipts",
    path: "/features/qr-code-receipts",
    eyebrow: "Bon fiscal & FiscalNet",
    title: "Bon Fiscal în POS — FiscalNet, Raport Z și Pregătire QR",
    metaTitle: "Bon Fiscal POS România | FiscalNet, Raport Z, QR ANAF | franchisetech",
    description: "Cum gestionezi bonurile fiscale în franchisetech: POS, FiscalNet, metode de plată, TVA, raport Z și ce trebuie verificat pentru QR-ul ANAF.",
    h1: "Bon fiscal din POS, fără pași manuali între vânzare și închiderea zilei",
    intro: "franchisetech este pentru cafenele și restaurante mici din România care vor ca fiecare vânzare din POS să rămână legată de FiscalNet, TVA, metode de plată și raportul Z. QR-ul ANAF depinde de firmware-ul casei fiscale, dar datele operaționale trebuie să fie corecte înainte să ajungă la imprimantă.",
    bullets: [
      "Vânzarea se înregistrează în POS și se trimite către FiscalNet când integrarea este activă",
      "Metodele de plată și grupele TVA sunt mapate în setările fiscale",
      "Raportul Z și diferențele de numerar rămân în același workspace",
      "QR-ul de pe bon este generat de casa fiscală certificată, nu de POS",
      "Verifici firmware-ul QR cu furnizorul casei de marcat înainte de termenul ANAF",
    ],
    sections: [
      {
        title: "Ce face franchisetech în fluxul de bon fiscal",
        body: "Casierul finalizează vânzarea în POS, cu produse, TVA și metodă de plată. Pentru organizațiile din România cu FiscalNet configurat, franchisetech trimite datele către casa fiscală prin driverul FiscalNet și păstrează tranzacția pentru verificarea zilnică.",
      },
      {
        title: "Unde intră QR-ul ANAF",
        body: "QR-ul de pe bon este responsabilitatea casei fiscale certificate și a firmware-ului instalat de furnizorul autorizat. POS-ul nu desenează QR-ul pe bonul fiscal; POS-ul trebuie să trimită corect liniile, TVA-ul și plata către dispozitiv.",
      },
      {
        title: "Ce verifici înainte de go-live",
        body: "Confirmă cu furnizorul casei fiscale că firmware-ul suportă QR, actualizează FiscalNet, configurează CIF-ul, metodele de plată și grupele TVA, apoi rulează o vânzare de test și un raport Z împreună cu contabilul.",
      },
    ],
    faqs: [
      {
        question: "franchisetech emite bon fiscal?",
        answer: "Da, pentru organizațiile din România unde FiscalNet este activat și configurat corect. Verificarea fiscală finală rămâne la contabil și furnizorul casei fiscale.",
      },
      {
        question: "franchisetech generează QR-ul de pe bon?",
        answer: "Nu. QR-ul este generat de casa fiscală certificată. franchisetech trimite datele vânzării către FiscalNet; dispozitivul fiscal tipărește bonul conform firmware-ului instalat.",
      },
      {
        question: "Ce trebuie să verific pentru QR?",
        answer: "Întreabă furnizorul autorizat dacă modelul casei tale fiscale are firmware QR disponibil, apoi testează o vânzare reală cu FiscalNet înainte de termenul ANAF.",
      },
      {
        question: "Ce se întâmplă la finalul zilei?",
        answer: "În franchisetech închizi sesiunea POS cu raport Z, vezi totaluri cash/card, numerar așteptat, numerar numărat și diferențe notate pentru verificare.",
      },
      {
        question: "Înlocuiește franchisetech contabilul?",
        answer: "Nu. franchisetech organizează vânzări, TVA, FiscalNet și rapoarte operaționale. Contabilul verifică obligațiile fiscale și documentele oficiale.",
      },
    ],
    related: [
      { label: "Romania FiscalNet guide", href: "/help/romania-fiscalnet" },
      { label: "POS for Romania", href: "/industries/romania" },
      { label: "Z-report and daily closing", href: "/features/z-report" },
    ],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
  {
    slug: "accountant-reports",
    path: "/features/accountant-reports",
    eyebrow: "Romanian accounting",
    title: "Accountant Reports for Romanian Businesses — NIR, Consum, Balanță, Saga Export",
    metaTitle: "Rapoarte Contabilitate România | NIR, Bon de Consum, Balanță, Export Saga | franchisetech",
    description: "franchisetech generates legally required Romanian accountant reports: Registru de casă, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune, and Saga XML export.",
    h1: "Romanian accountant reports — NIR, consumption, stock balance, and Saga export",
    intro: "Romanian businesses need specific accounting documents. franchisetech generates the reports your accountant requires: Registru de casă, Bon de consum, Balanță cantitativ-valorică, Raport de gestiune complet, and XML export for Saga accounting software.",
    bullets: [
      "Registru de casă — daily cash register book",
      "Bon de consum — ingredient consumption from recipes",
      "Balanță cantitativ-valorică — opening/closing stock by product",
      "Raport de gestiune — complete inventory movement report with TVA breakdown",
      "Saga XML export — NIR and sales in Saga-compatible format",
      "TVA breakdown by rate (21%, 11%, 5%, 0%)",
    ],
    sections: [
      {
        title: "Registru de casă (Cash Register Book)",
        body: "Download the legally required daily cash register document showing opening cash, cash movements, sales, expected cash, counted cash, and differences. Available from the Z-report page for Romanian businesses.",
      },
      {
        title: "Bon de consum (Consumption Voucher)",
        body: "Track raw material consumption from recipes. When products with recipes are sold, franchisetech automatically records ingredient usage. The Bon de consum report aggregates this consumption for any date range.",
      },
      {
        title: "Balanță cantitativ-valorică (Quantitative-Value Balance)",
        body: "A comprehensive stock balance report showing opening stock, entries (purchases/NIR), exits (sales/consumption), and closing stock. Calculated from actual stock movements, not estimates.",
      },
      {
        title: "Raport de gestiune (Stock Management Report)",
        body: "The complete inventory report combining all movements in chronological order: opening stock, NIR entries, consumption, Z-report sales values, and closing stock — split by TVA rate columns (21%, 11%, 5%, 0%).",
      },
      {
        title: "Saga XML Export",
        body: "Export NIR (purchases) and sales data in XML format compatible with Saga accounting software. Available from the Audit Export page for easy import into your accountant's system.",
      },
    ],
    faqs: [
      {
        question: "Are these reports legally compliant?",
        answer: "franchisetech generates reports based on your recorded data. The accuracy depends on correct data entry (products, purchases, sales, stock adjustments). We display actual TVA rates from your product settings — not hardcoded values. Always verify with your accountant.",
      },
      {
        question: "Where do I find these reports?",
        answer: "Reports are available in the Reports section: Rapoarte → Bon de consum, Balanță, Raport de gestiune. Registru de casă is downloadable from the Z-report page. Saga export is in Audit Export.",
      },
      {
        question: "How is TVA calculated?",
        answer: "TVA breakdown uses the vat_rate field on each product. Ensure your products have the correct TVA rate configured in Settings → Products.",
      },
      {
        question: "What if reports show empty?",
        answer: "Reports require data: purchases (for NIR/entries), sales of products with recipes (for consumption), stock movements. Check the selected date range and verify you have recorded transactions.",
      },
      {
        question: "Can I export to Saga?",
        answer: "Yes. Go to Reports → Audit Export → Saga XML Export. Choose NIR, Sales, or Combined export for the selected period.",
      },
    ],
    related: [
      { label: "Z-report and cash closing", href: "/features/z-report" },
      { label: "Stock management", href: "/features/stock-management" },
      { label: "QR code on receipts", href: "/features/qr-code-receipts" },
    ],
    image: "/showcase/reports-dashboard.png",
    heroComponent: OwnerDashboardProof,
  },
  {
    slug: "loyalty",
    path: "/features/loyalty",
    eyebrow: "Loyalty program",
    title: "Loyalty Program for Cafes and Restaurants — No App Needed",
    metaTitle: "Phone-Based Loyalty Program for Cafes — Stamp Card + Regulars at Risk",
    description: "A phone-number stamp card for cafes and restaurants — no app to download, no plastic cards. Plus a regulars-at-risk view showing which loyal customers haven't been back.",
    h1: "A loyalty program your regulars don't need an app for",
    intro: "franchisetech tracks stamps against a customer's phone number at checkout — no app, no plastic card — and shows owners which regulars have quietly stopped coming back.",
    bullets: [
      "Phone-number stamp card — no app or physical card required",
      "Cashiers apply it from the existing POS customer picker",
      "Discount or free-item rewards, configurable per business",
      "Regulars-at-risk panel: loyal customers who haven't been back",
    ],
    sections: [
      {
        title: "No app, no plastic card",
        body: "Customers are identified the same way they already are at your till — by name or phone number. Stamps accrue automatically on every completed sale; nothing extra for staff to manage.",
      },
      {
        title: "Know who's drifting away",
        body: "Most loyalty programs stop at rewarding visits. franchisetech also flags customers who used to come regularly and haven't been seen in a while, ranked by how much they've spent — so you know who's worth a personal follow-up.",
      },
      {
        title: "Configurable in minutes",
        body: "Choose how many visits earn a reward, whether it's a fixed discount or a free item, and how long counts as gone quiet — all from Settings, no support ticket needed.",
      },
    ],
    faqs: [
      { question: "Do customers need to install an app?", answer: "No. Stamps are tracked against the phone number or name already used in your POS customer picker — nothing for the customer to install." },
      { question: "Can I choose the reward?", answer: "Yes — a fixed discount amount or a specific free product, configured per business." },
      { question: "What happens if a sale is voided?", answer: "Voided sales don't count toward stamps — only completed sales accrue." },
      { question: "Is this included in my plan?", answer: "It's bundled into the Operations and Scale plans, and available as an add-on for Starter." },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Cafes", href: "/industries/cafes" },
      { label: "Restaurants", href: "/industries/restaurants" },
    ],
  },
];

export const industryPages: SeoPage[] = [
  ...primaryIndustryPages,
  {
    slug: "health-bars",
    path: "/industries/health-bars",
    eyebrow: "Health bars",
    title: "Health Bar POS and Smoothie Recipe Costing",
    metaTitle: "Health Bar POS, Smoothie Bar Stock, Recipe Costing, and Margins",
    description: "franchisetech helps health bars and smoothie bars sell products, manage ingredients, cost recipes, track stock, and review margins.",
    h1: "POS, stock, and recipe costing for health bars",
    intro: "Health bars depend on fresh ingredients, recipe consistency, and clear margins for smoothies, bowls, snacks, and drinks.",
    bullets: ["Smoothie and bowl recipes", "Ingredient stock tracking", "Margin visibility", "POS sales and cash/card records", "Unlimited staff — no per-seat fees"],
    sections: [
      { title: "Pain points", body: "Fresh ingredients expire quickly, recipes use small quantities, and product margins can be difficult to see without costing." },
      { title: "How franchisetech helps", body: "Ingredients, products, purchases, recipes, and POS sales connect so owners can review cost and stock together." },
      { title: "Useful owner reports", body: "Top products, transaction history, recipe margin, low stock, purchases, and daily till close." },
    ],
    faqs: [
      { question: "Can I cost smoothies?", answer: "Yes. Add fruit, milk, powders, packaging, and quantities to calculate recipe cost." },
      { question: "Can I track can-make counts?", answer: "Yes. Recipe and stock data can show how many portions can be made." },
      { question: "Can I import product lists?", answer: "Yes. Product import and export are supported by CSV." },
    ],
    related: [{ label: "Recipe costing", href: "/features/recipe-costing" }, { label: "Stock management", href: "/features/stock-management" }, { label: "Recipe costing guide", href: "/resources/recipe-costing-for-cafes" }],
    image: "/marketing/industry-cafe.png",
  },
  {
    slug: "ireland",
    path: "/industries/ireland",
    eyebrow: "🇮🇪 Ireland",
    title: "POS System for Irish Businesses — Cafés, Restaurants & Retail",
    metaTitle: "POS System for Irish Businesses | EUR, VAT, HACCP | franchisetech",
    description: "franchisetech is built for Irish cafés, restaurants, takeaways, retail shops, and local businesses. Euro currency, Irish VAT rates (23%/13.5%/9%), HACCP food-safety records, and unlimited team members.",
    h1: "POS and operations software built for Ireland",
    intro: "franchisetech is designed with Irish food and retail businesses in mind — Euro currency, correct VAT rates, HACCP food-safety records, and daily cash control that fits the rhythm of an Irish business day.",
    bullets: [
      "Euro (€) currency throughout — POS, reports, and receipts",
      "Irish VAT rates pre-loaded: 23%, 13.5%, 9%, 0%",
      "HACCP-ready food-safety temperature records",
      "Unlimited team members — no per-user fees",
      "Cash and card POS with daily Z-report",
      "Stock, recipes, suppliers, and purchases in one system",
      "Works on any device as a PWA — no app install needed",
    ],
    sections: [
      {
        title: "Currency and VAT — ready for Ireland",
        body: "All amounts display in Euro (€). VAT rates are pre-loaded for Irish businesses: Standard 23%, Reduced 13.5%, Second Reduced 9%, and Zero 0%. Rates are fully editable if your business has specific requirements.",
      },
      {
        title: "HACCP food-safety records",
        body: "Irish food businesses must keep temperature logs and corrective action records. franchisetech includes a Food Safety module for recording checks, actions taken, and generating exportable food-safety records.",
      },
      {
        title: "Simple daily cash control",
        body: "Open the till with a float, record cash in and out, process sales and refunds, then close with a Z-report showing expected cash, counted cash, and the difference. Clear records for busy Irish operators.",
      },
    ],
    faqs: [
      { question: "Does franchisetech display prices in Euro?", answer: "Yes. All prices, reports, receipts, and the POS display in Euro (€) for Irish organisations." },
      { question: "Are Irish VAT rates pre-loaded?", answer: "Yes. Standard 23%, Reduced 13.5%, Second Reduced 9%, and Zero 0% are available from the start. You can edit or add rates at any time." },
      { question: "Does it support HACCP food-safety records?", answer: "Yes. The Food Safety module allows logging temperature checks, corrective actions, and reminders — suitable for Irish HACCP record-keeping." },
      { question: "Is there a limit on team members?", answer: "No. You can add unlimited staff members with role-based access — from Owner to Cashier — at no extra cost." },
      { question: "Does franchisetech work for Irish retail shops?", answer: "Yes. Product catalogue, discounts, receipts, staff permissions, and daily reports work equally well for retail and food businesses." },
    ],
    related: [
      { label: "POS register", href: "/features/pos" },
      { label: "Z-report and till closing", href: "/features/z-report" },
      { label: "Guided setup", href: "/features/setup-onboarding" },
      { label: "Cafés", href: "/industries/cafes" },
      { label: "Restaurants", href: "/industries/restaurants" },
    ],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
  {
    slug: "romania",
    path: "/industries/romania",
    eyebrow: "🇷🇴 România",
    title: "Soft de Casa de Marcat Romania — FiscalNet, TVA, lei",
    metaTitle: "POS Romania cu FiscalNet | TVA 21%/11%/5% | lei (RON) | franchisetech",
    description: "franchisetech este un sistem POS pentru restaurante, cafenele și magazine din România. Integrare FiscalNet, afișaj în lei (RON), cote TVA românești (21%/11%/5%), membri de echipă nelimitați.",
    h1: "POS pentru afaceri din România — FiscalNet, TVA, lei",
    intro: "franchisetech este configurat pentru piața românească: monedă lei (RON), cote TVA standard, integrare FiscalNet pentru bonuri fiscale, și echipă nelimitată fără costuri suplimentare.",
    bullets: [
      "Afișaj în lei (RON) în tot sistemul — POS, rapoarte, bonuri",
      "Cote TVA românești pre-încărcate: 21%, 11%, 5%, 0%",
      "Integrare FiscalNet pentru bonuri fiscale",
      "Tipuri de plată mapate pentru FiscalNet (coduri 1–8): numerar, card, tichete masă etc.",
      "Grupe TVA FiscalNet (1–5) configurabile per cotă",
      "Membri de echipă nelimitați fără cost suplimentar",
      "Rapoarte zilnice: vânzări, numerar, marjă, stoc",
    ],
    sections: [
      {
        title: "Monedă și TVA pentru România",
        body: "Toate sumele se afișează în lei (RON). Cotele TVA sunt pre-încărcate: TVA Standard 21% (grupa FiscalNet 1), TVA Redus 11% (grupa 2), TVA Super-redus 5% (grupa 3), Scutit 0% (grupa 4). Cotele sunt editabile oricând.",
      },
      {
        title: "Integrare FiscalNet completă",
        body: "franchisetech se conectează la driver-ul FiscalNet pentru emiterea bonurilor fiscale. Suportă toate metodele de plată (cod 1–8): numerar, card, credit, tichete masă, tichete valorice, voucher, plată modernă. Reducerile per articol se transmit automat ca comandă DP^.",
      },
      {
        title: "Echipă nelimitată, roluri clare",
        body: "Adăugați toți angajații fără taxe per utilizator. 8 roluri disponibile: Proprietar, Manager, Casier, Bucătărie, Stoc, Contabil, Suport, Doar citire. Invitații prin email, dezactivare instantă, jurnal de audit complet.",
      },
    ],
    faqs: [
      { question: "franchisetech afișează prețurile în lei?", answer: "Da. Toate prețurile, rapoartele, bonurile și POS-ul afișează în lei (RON) pentru organizațiile din România." },
      { question: "Sunt pre-încărcate cotele TVA românești?", answer: "Da. TVA Standard 21%, TVA Redus 11%, TVA Super-redus 5% și Scutit 0% sunt disponibile de la început. Pot fi editate sau completate oricând." },
      { question: "Cum funcționează integrarea FiscalNet?", answer: "franchisetech trimite comenzi către driver-ul FiscalNet: S^ pentru articole, DP^ pentru reduceri, P^ pentru plăți. Codul de plată și grupa TVA se configurează per metodă de plată și cotă TVA în setări." },
      { question: "Există limită de utilizatori?", answer: "Nu. Poți adăuga membri de echipă nelimitați cu acces bazat pe rol, fără cost suplimentar." },
      { question: "Funcționează pe tabletă sau telefon?", answer: "Da. franchisetech rulează ca PWA în orice browser modern, inclusiv pe tablete Android — fără instalare de aplicație." },
    ],
    related: [
      { label: "POS register", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
      { label: "Cafenele & cofetării", href: "/industries/cafes" },
      { label: "Restaurante", href: "/industries/restaurants" },
    ],
    image: "/showcase/reports-dashboard.png",
    heroComponent: OwnerDashboardProof,
  },
  {
    slug: "retail-shops",
    path: "/industries/retail-shops",
    eyebrow: "Retail",
    title: "POS System for Retail Shops — Products, Staff & Daily Reports",
    metaTitle: "Retail POS System | Products, Discounts, Staff Roles | franchisetech",
    description: "franchisetech helps retail shops, convenience stores, and mini markets sell products, manage stock, track staff, and generate daily reports. Works in Ireland (EUR) and Romania (lei).",
    h1: "Simple POS and retail management for shops and stores",
    intro: "Whether you run a convenience store, boutique, mini market, or specialist retail shop — franchisetech gives you a clean product catalogue, fast checkout, staff control, and daily records without enterprise complexity.",
    bullets: [
      "Fast product grid with categories and search",
      "Discounts per item and refunds with reason",
      "Multiple payment methods — cash, card, vouchers",
      "Unlimited staff with role-based access",
      "Daily sales dashboard and Z-report",
      "Stock tracking and purchase records",
      "Works in EUR (Ireland) and lei / RON (Romania)",
    ],
    sections: [
      {
        title: "Products and categories",
        body: "Build a clean catalogue with product categories, prices, costs, and POS availability flags. Import by CSV for large catalogues. Products can be toggled on or off the POS without deleting them.",
      },
      {
        title: "Staff and shift accountability",
        body: "Add every team member at no extra cost. Cashiers see only the till. Managers see reports and can manage products. Owners control everything. Every sale, refund, and void is traceable to a user.",
      },
      {
        title: "Reports for retail owners",
        body: "Daily sales, transaction history, top products, payment method breakdown, stock movements, and purchase records give retail owners a clear picture of the business at the end of every day.",
      },
    ],
    faqs: [
      { question: "Does franchisetech work for convenience stores?", answer: "Yes. The product catalogue, cash control, staff roles, and daily reports apply directly to convenience store operations." },
      { question: "Can I track stock for retail products?", answer: "Yes. Products can have stock levels tracked, updated by purchases, and reduced by sales." },
      { question: "Is there a limit on products or staff?", answer: "No hard limit on products. Staff can be added without per-user fees." },
      { question: "Does it work in both Ireland and Romania?", answer: "Yes. Irish organisations use EUR (€) with Irish VAT rates. Romanian organisations use lei (RON) with TVA rates and FiscalNet support." },
    ],
    related: [
      { label: "POS register", href: "/features/pos" },
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Z-report", href: "/features/z-report" },
      { label: "Ireland", href: "/industries/ireland" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/stock-levels.png",
    heroComponent: OwnerStockProof,
  },
  {
    slug: "salons",
    path: "/industries/salons",
    eyebrow: "Salons & Barbers",
    title: "POS System for Salons, Barbers & Beauty Businesses",
    metaTitle: "Salon POS System | Barber POS | Staff Sales & Cash Tracking | franchisetech",
    description: "franchisetech helps salons, barbers, and beauty businesses handle walk-ins, service sales, retail products, staff attribution, cash tracking, and daily reports.",
    h1: "POS and daily operations for salons and barbers",
    intro: "Salons and barbers need a fast till, clear staff accountability, combined service and retail sales, and simple end-of-day cash totals — without expensive appointment software or complex setup.",
    bullets: [
      "Service and retail product sales from one POS",
      "Staff attribution — know who sold what",
      "Cash, card, and other payment tracking",
      "Discounts and refunds with reason",
      "Daily sales totals and Z-report",
      "Unlimited staff — no per-seat fees",
      "Works in EUR (Ireland) and lei / RON (Romania)",
    ],
    sections: [
      {
        title: "Services and retail in one till",
        body: "Create service items (haircuts, colours, treatments) and retail products (shampoos, styling products) in the same catalogue. The POS checkout handles both in a single transaction.",
      },
      {
        title: "Staff attribution and accountability",
        body: "Every sale can be linked to a customer and is always linked to the staff member who processed it. Owners and managers can review individual performance in transaction reports.",
      },
      {
        title: "Simple cash-up at end of day",
        body: "Open with a float, record cash in and out, close with a Z-report showing expected cash versus what was counted. Clear daily records without a complicated back office.",
      },
    ],
    faqs: [
      { question: "Does franchisetech support appointment booking?", answer: "Not currently. franchisetech focuses on POS, cash control, stock, and operations records. Appointment features are planned but not yet available." },
      { question: "Can I sell retail products alongside services?", answer: "Yes. Products and services live in the same catalogue and can be mixed in one checkout transaction." },
      { question: "Can I track which staff member made each sale?", answer: "Yes. Every transaction is linked to the logged-in user, and managers can filter reports by staff." },
      { question: "Does it work for Irish and Romanian salons?", answer: "Yes. EUR currency and Irish VAT for Ireland; lei/RON and Romanian TVA for Romania, with FiscalNet fiscal receipts available when configured." },
    ],
    related: [
      { label: "POS register", href: "/features/pos" },
      { label: "Z-report and till closing", href: "/features/z-report" },
      { label: "Ireland", href: "/industries/ireland" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
  {
    slug: "eu",
    path: "/industries/eu",
    eyebrow: "🇪🇺 European Union",
    title: "VAT-Aware POS for EU Food Businesses — Configurable Currency & Country",
    metaTitle: "POS for EU Food Businesses | Configurable VAT, Currency, Timezone | franchisetech",
    description: "franchisetech is built for Ireland and adaptable across the EU, with configurable VAT, currency, timezone, and optional country-specific workflows. No overclaiming — fiscal integrations only where enabled and configured.",
    h1: "POS and operations software adaptable across the EU",
    intro: "Built for Ireland and adaptable across the EU, with configurable VAT, currency, timezone, and optional country-specific workflows. franchisetech does not claim universal compliance — fiscal integrations are enabled only where they have been set up and verified.",
    bullets: [
      "Configurable currency (EUR, RON, and others via settings)",
      "Configurable VAT rates — set the rates applicable to your country",
      "Configurable timezone — reports reflect your local business day",
      "Optional workflows: tips and split payments",
      "Hardware connectors: Windows and Android, where verified",
      "Country-specific fiscal integrations only where enabled (e.g. FiscalNet for Romania)",
      "Unlimited staff — no per-user fees",
    ],
    sections: [
      {
        title: "VAT-aware by default, not by assumption",
        body: "franchisetech records VAT rate per product and produces VAT-ready reports and Z-reports. It does not claim certification under any specific EU country's revenue authority — that remains your professional responsibility. Rates, currency, and timezone are configurable in Settings.",
      },
      {
        title: "Optional workflows — enable what you need",
        body: "Order types, tips, and split payments can be enabled per organisation in Settings. They are all off by default. Enabling them does not affect unrelated workflows.",
      },
      {
        title: "Hardware compatibility — verified setups only",
        body: "Fiscal hardware compatibility is checked during setup. franchisetech does not claim support for every printer, cash register, or device.",
      },
    ],
    faqs: [
      { question: "Is franchisetech compliant with EU fiscal regulations?", answer: "No universal claim is made. Country-specific integrations (e.g. FiscalNet for Romania) work where specifically enabled and configured. For other EU countries, franchisetech provides VAT-ready records — professional tax advice remains your responsibility." },
      { question: "Can I use franchisetech in a country other than Ireland or Romania?", answer: "Yes, with manual configuration. Currency, VAT rates, and timezone are all configurable. There is no country-specific fiscal integration for other EU countries today — only Romania has FiscalNet support." },
      { question: "Does franchisetech support multiple currencies?", answer: "One currency per organisation. You configure it in Settings." },
      { question: "Are fiscal receipts available in every EU country?", answer: "No. Fiscal receipt printing is currently only available for Romania via FiscalNet integration. Other EU countries receive VAT-ready records that you can submit to your own accountant." },
    ],
    related: [
      { label: "Ireland", href: "/industries/ireland" },
      { label: "Romania", href: "/industries/romania" },
      { label: "POS register", href: "/features/pos" },
      { label: "VAT report", href: "/features/z-report" },
    ],
    image: "/showcase/pos-grid.png",
    heroComponent: OwnerPosProof,
  },
];

export type ResourcePage = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  faqs: Array<{ question: string; answer: string }>;
  related: Array<{ label: string; href: string }>;
  image?: string;
};

export const resourcePages: ResourcePage[] = [
  {
    slug: "pos-system-for-small-cafes",
    path: "/resources/pos-system-for-small-cafes",
    title: "Ce au nevoie cafenelele mici de la un sistem POS",
    metaTitle: "Ce au nevoie cafenelele mici de la un sistem POS",
    description: "Ghid practic despre sisteme POS pentru cafenele mici: viteză la casă, produse, evidență numerar/card, bonuri, retururi și închidere zilnică.",
    intro: "Un POS bun pentru o cafenea mică ajută personalul să servească rapid, ține evidențe curate și dă proprietarului cifrele de care are nevoie la finalul zilei.",
    sections: [
      { title: "Casa trebuie să rămână simplă", body: "Servirea la tejghea e rapidă. Un POS bun face produsele uzuale ușor de găsit, ține coșul clar și lasă personalul să finalizeze o vânzare fără să caute prin meniuri de back-office." },
      { title: "Evidența numerar și card contează", body: "Proprietarii trebuie să compare numerarul din sertar, totalurile pe card, retururile, anulările și evidențele de sfârșit de zi. Contează mai ales când mai mulți angajați folosesc aceeași casă." },
      { title: "Produsele înseamnă mai mult decât butoane", body: "O listă de produse pentru o cafenea ar trebui să includă categorii, cotă TVA, preț de vânzare, cost, comportament de stoc și dacă articolul apare în POS." },
      { title: "La închidere se văd greșelile", body: "Numerar de deschidere, vânzări în numerar, intrări/ieșiri numerar, numerar așteptat, numerar numărat și diferențele ar trebui înregistrate într-un singur loc, ca ziua următoare să înceapă curat." },
      { title: "Cum ajută franchisetech", body: "franchisetech combină POS, produse, tranzacții, retururi, clienți, stoc, rețete, achiziții și rapoarte pentru afaceri alimentare mici." },
    ],
    faqs: [
      { question: "Care este cea mai importantă funcție POS pentru o cafenea mică?", answer: "Viteza și claritatea. Personalul trebuie să poată vinde produsele uzuale rapid, iar proprietarul trebuie să poată revizui evidențe corecte mai târziu." },
      { question: "Ar trebui un POS de cafenea să urmărească stocul?", answer: "Pentru multe cafenele, da. Chiar și o vizibilitate simplă a stocului ajută la achiziții și controlul pierderilor." },
      { question: "franchisetech include hardware de plată?", answer: "franchisetech înregistrează metoda de plată. Integrarea cu hardware și terminale de plată nu trebuie presupusă decât dacă este configurată separat." },
    ],
    related: [{ label: "Funcționalitate POS", href: "/features/pos" }, { label: "Cafenele", href: "/industries/cafes" }, { label: "Ghid raport Z", href: "/resources/z-report-explained" }],
  },
  {
    slug: "recipe-costing-for-cafes",
    path: "/resources/recipe-costing-for-cafes",
    title: "Cum calculați costul rețetei și marja pentru produsele de cafenea",
    metaTitle: "Cum calculați costul rețetei și marja pentru produsele de cafenea",
    description: "Aflați cum calculați costul rețetei, marja pe prețul de vânzare și câte porții puteți face, cu exemplul unui sandviș club.",
    intro: "Costul rețetei îi ajută pe proprietari să înțeleagă dacă un produs este cu adevărat profitabil, ținând cont de ingrediente, mărimea porției și prețul de vânzare.",
    sections: [
      { title: "Porniți de la ingrediente", body: "Listați fiecare ingredient folosit în produs. Pentru un sandviș club, includeți pieptul de pui, salata, sosul, brânza, pâinea și ambalajul." },
      { title: "Adăugați cantitatea folosită", body: "Fiecare linie de rețetă are nevoie de o cantitate. Dacă pieptul de pui costă 40 lei/kg și rețeta folosește 120g, costul pentru o porție este 4,80 lei." },
      { title: "Calculați costul rețetei", body: "Adunați costul fiecărui ingredient. Dacă puiul costă 4,80 lei, salata 1,20 lei, sosul 0,80 lei, brânza 1,50 lei, pâinea 1,00 lei și ambalajul 0,90 lei, costul rețetei este 10,20 lei." },
      { title: "Comparați cu prețul de vânzare", body: "Dacă sandvișul se vinde cu 32 lei și costă 10,20 lei de făcut, profitul brut este 21,80 lei. Marja este profitul brut împărțit la prețul de vânzare, aproximativ 68% înainte de alte cheltuieli." },
      { title: "Folosiți numărul de porții posibile", body: "Dacă în stoc aveți 2,4 kg de piept de pui și fiecare porție folosește 120g, puiul susține 20 de porții. Numărul real de porții posibile este limitat de ingredientul cel mai puțin disponibil." },
      { title: "Cum ajută franchisetech", body: "franchisetech vă lasă să construiți rețete din produse, să urmăriți costul, să comparați prețul de vânzare și să legați stocul de câte porții puteți face." },
    ],
    faqs: [
      { question: "Ce este marja pe rețetă?", answer: "Marja pe rețetă compară prețul de vânzare al produsului cu costul ingredientelor. Arată cât profit brut rămâne înainte de alte cheltuieli." },
      { question: "Ar trebui inclus ambalajul?", answer: "Da. Ambalajul este un cost real și ar trebui inclus când face parte din produs." },
      { question: "Este acesta sfat contabil?", answer: "Nu. Este un ghid operațional. franchisetech ajută la păstrarea unor evidențe organizate și nu înlocuiește consultanța contabilă sau fiscală profesională." },
    ],
    related: [{ label: "Funcționalitate cost rețete", href: "/features/recipe-costing" }, { label: "Gestiune stoc", href: "/features/stock-management" }, { label: "Baruri de sănătate", href: "/industries/health-bars" }],
  },
  {
    slug: "z-report-explained",
    path: "/resources/z-report-explained",
    title: "Ce este raportul Z și de ce contează?",
    metaTitle: "Ce este raportul Z și de ce contează?",
    description: "O explicație pe înțelesul tuturor despre raportul Z, închiderea casei, reconcilierea numerarului, totalurile numerar/card și evidențele zilnice de vânzări.",
    intro: "Raportul Z este raportul de casă de la finalul zilei. Îi ajută pe proprietari să înțeleagă vânzările, totalurile pe metodă de plată și diferențele de numerar.",
    sections: [
      { title: "Ce include de obicei un raport Z", body: "Un raport Z util arată numerarul de deschidere, vânzările în numerar, vânzările cu cardul, intrările de numerar, ieșirile de numerar, numerarul așteptat, numerarul numărat și orice diferență." },
      { title: "De ce contează", body: "Raportul Z creează un punct de închidere pentru zi. Face mai ușor de depistat greșelile, de revizuit retururile și de comparat totalurile numerar/card." },
      { title: "Reconcilierea numerarului", body: "Numerarul așteptat este de obicei numerarul de deschidere plus vânzările în numerar plus intrările de numerar minus ieșirile de numerar. Numerarul numărat este ce se numără fizic la închidere." },
      { title: "Evidențe pregătite pentru TVA", body: "franchisetech ajută la păstrarea unor evidențe pregătite pentru TVA, dar nu înlocuiește consultanța fiscală profesională sau cerințele oficiale." },
      { title: "Cum ajută franchisetech", body: "franchisetech înregistrează sesiunile de casă, metodele de plată, tranzacțiile, mișcările de numerar și cifrele de închidere, într-un singur loc." },
    ],
    faqs: [
      { question: "Raportul Z este același lucru cu un raport de vânzări?", answer: "Nu chiar. Un raport de vânzări se concentrează pe activitatea de vânzare. Un raport Z este de obicei legat de închiderea casei și reconcilierea numerarului." },
      { question: "Raportul Z poate preveni greșelile de numerar?", answer: "Nu poate preveni orice greșeală, dar face diferențele vizibile și mai ușor de revizuit." },
      { question: "franchisetech depune declarații fiscale?", answer: "Nu. franchisetech vă ajută să păstrați evidențe organizate. Nu înlocuiește contabilitatea sau consultanța fiscală." },
    ],
    related: [{ label: "Funcționalitate raport Z", href: "/features/z-report" }, { label: "Ghid închidere de zi", href: "/resources/cash-up-at-end-of-day" }, { label: "Funcționalitate POS", href: "/features/pos" }],
  },
  {
    slug: "food-business-stock-control",
    path: "/resources/food-business-stock-control",
    title: "Control simplu de stoc pentru afaceri alimentare mici",
    metaTitle: "Control simplu de stoc pentru afaceri alimentare mici",
    description: "Ghid practic de control al stocului pentru cafenele, takeaway, food truck-uri și restaurante mici.",
    intro: "Afacerile alimentare mici nu au nevoie de un software complicat de depozit, dar au nevoie de un proces clar de stoc.",
    sections: [
      { title: "Porniți de la produsele care contează", body: "Urmăriți ingredientele și produsele care afectează costul, disponibilitatea sau pierderile. Nu fiecare articol mic are nevoie de același nivel de control." },
      { title: "Înregistrați achizițiile constant", body: "Furnizor, dată de achiziție, produs, cantitate, unitate și cost unitar sunt suficiente pentru un istoric util de achiziții." },
      { title: "Folosiți praguri de reaprovizionare", body: "Un prag de reaprovizionare dă personalului un semnal clar că un produs are nevoie de atenție înainte să se termine." },
      { title: "Legați rețetele de stoc", body: "Când rețetele sunt legate de ingrediente, vânzările pot ajuta să explice consumul de stoc și câte porții mai puteți face." },
      { title: "Cum ajută franchisetech", body: "franchisetech leagă produsele, ingredientele, furnizorii, achizițiile, rețetele și vânzările POS, ca stocul să fie mai ușor de revizuit." },
    ],
    faqs: [
      { question: "Cât de des ar trebui o cafenea mică să verifice stocul?", answer: "Ingredientele care se consumă rapid ar trebui verificate frecvent. Articolele mai lente pot fi revizuite mai rar." },
      { question: "Ce înseamnă câte porții pot face?", answer: "Estimează câte produse finite pot fi făcute din stocul actual de ingrediente." },
      { question: "franchisetech poate importa produse de stoc?", answer: "Da. Importul/exportul de produse este suportat prin CSV." },
    ],
    related: [{ label: "Gestiune stoc", href: "/features/stock-management" }, { label: "Cost rețete", href: "/features/recipe-costing" }, { label: "Restaurante", href: "/industries/restaurants" }],
  },
  {
    slug: "cash-up-at-end-of-day",
    path: "/resources/cash-up-at-end-of-day",
    title: "Cum închideți casa la finalul zilei",
    metaTitle: "Cum închideți casa la finalul zilei",
    description: "Un proces simplu de închidere a casei pentru cafenele și afaceri alimentare mici: numerar de deschidere, vânzări, intrări/ieșiri numerar, numerar numărat și diferențe.",
    intro: "Închiderea casei este obiceiul zilnic de a verifica dacă evidențele de casă se potrivesc cu ce este în sertar și cu ce s-a plătit prin card.",
    sections: [
      { title: "Porniți de la numerarul de deschidere", body: "Numerarul de deschidere este fondul din casă înainte să înceapă vânzările. Ar trebui înregistrat când se deschide casa." },
      { title: "Adăugați vânzările în numerar", body: "Vânzările în numerar cresc numerarul așteptat din sertar. Vânzările cu cardul ar trebui ținute separat, pentru că nu sunt numerar fizic." },
      { title: "Înregistrați intrările și ieșirile de numerar", body: "Numerarul adăugat sau scos din sertar ar trebui să aibă o sumă și un motiv, ca numerarul așteptat să rămână corect." },
      { title: "Numărați sertarul", body: "La finalul zilei, numărați numerarul fizic și comparați-l cu numerarul așteptat. Orice diferență ar trebui înregistrată cu observații." },
      { title: "Folosiți închiderea ca punct de resetare", body: "O închidere curată înseamnă că mâine începe cu o sumă clară de numerar de deschidere și o evidență clară a zilei de ieri." },
    ],
    faqs: [
      { question: "Ce se întâmplă dacă numerarul numărat nu se potrivește cu cel așteptat?", answer: "Înregistrați diferența și observațiile. Scopul este o evidență clară, nu ascunderea diferenței." },
      { question: "Totalurile cu cardul ar trebui incluse în numerar?", answer: "Nu. Totalurile cu cardul ar trebui urmărite separat de numerarul fizic din sertar." },
    ],
    related: [{ label: "Raport Z", href: "/features/z-report" }, { label: "POS", href: "/features/pos" }, { label: "Raportul Z explicat", href: "/resources/z-report-explained" }],
  },
  {
    slug: "pos-software-romania",
    path: "/resources/pos-software-romania",
    title: "Software POS pentru restaurante și cafenele în România",
    metaTitle: "Software POS România — casă, FiscalNet, TVA, stoc | franchisetech",
    description:
      "Ghid practic pentru alegerea unui software POS în România: casă de marcat, FiscalNet, TVA 21%/11%/5%, stoc, rețete și raport Z pentru cafenele și restaurante mici.",
    intro:
      "Un POS bun în România trebuie să rezolve ziua de zi: vânzare rapidă, bon fiscal când FiscalNet e configurat, stoc care nu rămâne în Excel, și închidere casă clară pentru contabil.",
    sections: [
      {
        title: "Ce caută proprietarii români la POS",
        body: "Viteză la servire, lei (RON) peste tot, cote TVA corecte, integrare FiscalNet unde e cazul, și rapoarte pe care contabilul le poate folosi fără reconstrucție manuală.",
      },
      {
        title: "POS plăți-first vs operațiuni-first",
        body: "Terminalul de card rezolvă plata. franchisetech rezolvă ce se întâmplă după: ce s-a vândut, ce stoc s-a consumat, care e marja pe rețetă, și dacă numerarul din sertar se potrivește cu raportul.",
      },
      {
        title: "Trial fără risc",
        body: "Rulați 15 zile în paralel cu sistemul actual. Adăugați produsele principale, faceți o vânzare test, comparați raportul zilnic — apoi decideți.",
      },
    ],
    faqs: [
      {
        question: "franchisetech emite bon fiscal?",
        answer:
          "Da, când FiscalNet este activat și configurat corect pe stația de casă. Nu presupuneți conformitate fără verificarea contabilului.",
      },
      {
        question: "Funcționează pentru retail, nu doar restaurant?",
        answer: "Da. Catalog produse, reduceri, personal și rapoarte zilnice funcționează și pentru magazine mici.",
      },
      {
        question: "Cât costă per angajat?",
        answer: "Planurile plătite includ personal nelimitat — fără taxă per casier.",
      },
    ],
    related: [
      { label: "Pagina România", href: "/industries/romania" },
      { label: "Alternative SmartBill", href: "/compare/smartbill" },
      { label: "Ghid FiscalNet", href: "/help/romania-fiscalnet" },
    ],
  },
  {
    slug: "stock-management-romania",
    path: "/resources/stock-management-romania",
    title: "Gestiune stoc și achiziții pentru restaurante în România",
    metaTitle: "Gestiune stoc restaurant România — NIR, furnizori, rețete | franchisetech",
    description:
      "Cum să țineți stocul, achizițiile de la furnizori și legătura cu rețetele într-un restaurant mic din România — fără software de depozit enterprise.",
    intro:
      "Restaurantele mici nu au nevoie de WMS enterprise, dar au nevoie de claritate: ce a intrat de la furnizor, ce s-a consumat, ce e pe terminate.",
    sections: [
      {
        title: "De la NIR la porții posibile",
        body: "Înregistrați achizițiile cu furnizor, cantitate și cost. Leagați ingredientele de rețete ca să vedeți câte porții puteți face din stocul curent.",
      },
      {
        title: "Alerte stoc scăzut",
        body: "Setați praguri pentru ingredientele critice — lapte, carne, ambalaje — ca să comandați înainte de serviciu, nu în timpul lui.",
      },
      {
        title: "Contabilul vrea claritate",
        body: "franchisetech păstrează mișcări organizate. Nu înlocuiește sfatul fiscal — exportați și reconciliați cu contabilul.",
      },
    ],
    faqs: [
      {
        question: "Pot importa produse din Excel?",
        answer: "Da, prin CSV. Util pentru meniuri mari sau migrare de la alt sistem.",
      },
      {
        question: "Vânzările scad automat stocul?",
        answer: "Da, când rețetele sunt configurate și legate de produsele POS.",
      },
    ],
    related: [
      { label: "Stock feature", href: "/features/stock-management" },
      { label: "Recipe costing", href: "/features/recipe-costing" },
      { label: "Restaurante", href: "/industries/restaurants" },
    ],
  },
  {
    slug: "choose-pos-romania",
    path: "/resources/choose-pos-romania",
    title: "Cum alegi un POS pentru restaurant sau cafenea în România",
    metaTitle: "Cum alegi POS restaurant România — checklist 2026 | franchisetech",
    description:
      "Checklist pentru evaluarea POS-urilor în România: FiscalNet, TVA, stoc, rețete, raport Z, cost total și trial paralel.",
    intro:
      "Piața POS din România e aglomerată. Acest checklist te ajută să compari onest — fără promisiuni pe care niciun vendor nu le poate garanta universal.",
    sections: [
      {
        title: "1. Casă și servire",
        body: "Personalul poate vinde produsele frecvente în sub 3 atingeri? Refundurile și anulările sunt urmărite cu motiv?",
      },
      {
        title: "2. Fiscal și TVA",
        body: "Afișaj lei, cote TVA 19/9/5%, FiscalNet dacă aveți nevoie de bon fiscal — verificați cu contabilul înainte de go-live.",
      },
      {
        title: "3. Stoc și marje",
        body: "Dacă marjele sunt în Excel astăzi, POS-ul trebuie să lege vânzările de ingrediente sau veți continua să ghiciți.",
      },
      {
        title: "4. Cost total",
        body: "Licență + terminale + taxă per casier + ore reconciliere manuală. Compară totalul lunar, nu doar prețul afișat.",
      },
      {
        title: "5. Trial paralel",
        body: "Orice vendor serios permite o perioadă de test în paralel. Refuză dacă singura opțiune e migrare big-bang fără backup.",
      },
    ],
    faqs: [
      {
        question: "Unde compar alternative?",
        answer: "Vezi pagina noastră de comparații: SmartBill, Saga, RezoSoft, Expressoft, hePOS și altele.",
      },
    ],
    related: [
      { label: "Comparații POS", href: "/compare" },
      { label: "SmartBill vs franchisetech", href: "/compare/smartbill" },
      { label: "Obiecții frecvente", href: "/resources/objections-pos-romania" },
      { label: "Prețuri", href: "/pricing" },
    ],
  },
  {
    slug: "objections-pos-romania",
    path: "/resources/objections-pos-romania",
    title: "Obiecții frecvente la alegerea unui POS în România",
    metaTitle: "Obiecții POS România — SmartBill, FiscalNet, timp, preț | franchisetech",
    description:
      "Răspunsuri oneste la obiecțiile din apelurile de vânzare: SmartBill existent, FiscalNet, lipsă de timp, preț — cu trial paralel 15 zile.",
    intro:
      "Aceste obiecții apar în aproape fiecare evaluare POS pentru restaurante și cafenele din România. Răspunsurile de mai jos reflectă ce putem susține onest astăzi — fără promisiuni de conformitate universală.",
    sections: [
      {
        title: "„Am deja SmartBill / Saga”",
        body: "Multe afaceri păstrează SmartBill sau Saga pentru facturare și e-Factura. franchisetech țintește golul zilnic: casă, stoc, rețete, raport Z. Rulați 15 zile în paralel — aceleași produse, aceeași echipă — și comparați timpul de reconciliere la final de zi.",
      },
      {
        title: "„FiscalNet e greu / nu vreau risc fiscal”",
        body: "Integrarea FiscalNet necesită configurare corectă pe stația de casă. Oferim ghid pas cu pas; contabilul verifică înainte de go-live. Nu presupuneți conformitate fără verificare profesională.",
      },
      {
        title: "„Nu am timp de migrare”",
        body: "Nu cerem migrare big-bang. Ghidul de configurare din aplicație include produse demo, deschidere casă și ghidare la prima vânzare, fără cost. Majoritatea trialurilor activează prima vânzare într-o singură sesiune ghidată.",
      },
      {
        title: "„E scump față de Excel / POS vechi”",
        body: "Comparați costul total: licență, taxă per casier, ore reconciliere manuală, rupturi de stoc. Planurile franchisetech includ personal nelimitat — util când rotația echipei e mare.",
      },
    ],
    faqs: [
      {
        question: "Pot păstra contabilul actual?",
        answer: "Da. Exportați rapoarte zilnice și reconciliați cu contabilul — franchisetech nu înlocuiește sfatul fiscal profesional.",
      },
      {
        question: "Unde văd comparația cu SmartBill?",
        answer: "Pagina dedicată: franchisetech vs SmartBill pentru operațiuni zilnice HORECA.",
      },
    ],
    related: [
      { label: "SmartBill vs franchisetech", href: "/compare/smartbill" },
      { label: "Checklist alegere POS", href: "/resources/choose-pos-romania" },
      { label: "Ghid FiscalNet", href: "/help/romania-fiscalnet" },
      { label: "Prețuri și trial", href: "/pricing" },
    ],
  },
  {
    slug: "switch-from-ebriza",
    path: "/resources/switch-from-ebriza",
    title: "Cum migrezi de la Ebriza la franchisetech",
    metaTitle: "Migrare de la Ebriza la franchisetech — ghid practic",
    description:
      "Ghid pas cu pas pentru cafenele și restaurante care vor să testeze franchisetech în paralel cu Ebriza: export, import produse, trial 15 zile și comparație cost total.",
    intro:
      "Migrarea nu trebuie făcută big-bang. Cel mai sigur mod este să exportați datele, să importați catalogul principal în franchisetech și să rulați 15 zile în paralel înainte să decideți.",
    sections: [
      {
        title: "1. Exportați datele din Ebriza",
        body: "Începeți cu produsele active, categorii, prețuri, cote TVA și, dacă folosiți gestiune, articole de stoc. Păstrați exportul original ca backup înainte de orice curățare.",
      },
      {
        title: "2. Curățați catalogul înainte de import",
        body: "Eliminați produse duplicate, produse inactive și denumiri ambigue. Verificați unitatea de măsură, categoria, prețul de vânzare, prețul de cost și cota TVA pentru fiecare produs important.",
      },
      {
        title: "3. Importați produsele în franchisetech",
        body: "Folosiți importul CSV pentru produse și ingrediente. Începeți cu cele mai vândute articole, nu cu întreg istoricul. Scopul primei zile este o casă funcțională și rapoarte clare.",
      },
      {
        title: "4. Rulați în paralel 15 zile",
        body: "Faceți aceleași vânzări test, urmăriți raportul Z, TVA, stocul și timpul de închidere. Nu opriți sistemul vechi până când echipa nu poate face o vânzare și o închidere fără ajutor.",
      },
      {
        title: "5. Comparați costul real",
        body: "Comparați abonamentul, add-on-urile pentru rapoarte, KDS, Saga sau stoc, taxele per terminal/casier și timpul pierdut la reconciliere. Decideți pe cost total lunar, nu doar pe prețul de intrare.",
      },
    ],
    faqs: [
      {
        question: "Trebuie să migrez tot istoricul din Ebriza?",
        answer: "Nu pentru primul trial. Migrați catalogul activ și articolele critice. Istoricul vechi poate rămâne arhivat în sistemul anterior sau în exporturi.",
      },
      {
        question: "Pot rula Ebriza și franchisetech în paralel?",
        answer: "Da. Recomandarea este să testați 15 zile în paralel, cu aceleași produse principale, pentru a compara raportarea și timpul de închidere.",
      },
      {
        question: "franchisetech înlocuiește contabilul?",
        answer: "Nu. franchisetech organizează POS, stoc, NIR și rapoarte operaționale. Contabilul rămâne responsabil pentru verificări fiscale și raportări oficiale.",
      },
    ],
    related: [
      { label: "franchisetech vs Ebriza", href: "/compare/ebriza" },
      { label: "Checklist alegere POS", href: "/resources/choose-pos-romania" },
      { label: "Prețuri", href: "/pricing" },
    ],
  },
  {
    slug: "smartbill-si-franchisetech",
    path: "/resources/smartbill-si-franchisetech",
    title: "SmartBill + franchisetech — folosite împreună",
    metaTitle: "SmartBill și franchisetech împreună — facturare, POS, stoc",
    description:
      "Cum pot lucra împreună SmartBill și franchisetech: SmartBill pentru facturare, franchisetech pentru POS, stoc, NIR, rețete și închiderea de zi.",
    intro:
      "SmartBill și franchisetech nu trebuie privite ca alegere exclusivă. Pentru multe afaceri HORECA din România, SmartBill rămâne pentru facturare, iar franchisetech acoperă operațiunile zilnice.",
    sections: [
      {
        title: "SmartBill rămâne pentru facturare",
        body: "Dacă firma folosește deja SmartBill pentru facturi, clienți B2B sau fluxuri contabile, îl puteți păstra. Nu este nevoie să schimbați facturarea doar ca să îmbunătățiți casa și stocul.",
      },
      {
        title: "franchisetech acoperă operațiunile zilnice",
        body: "franchisetech gestionează vânzările POS, produse, TVA pe produse, stoc, achiziții/NIR, furnizori, rețete și raportul de închidere. Acestea sunt zonele unde Excel și WhatsApp devin fragile.",
      },
      {
        title: "Export/import pentru contabil",
        body: "La final de zi sau perioadă, exportați rapoartele necesare din franchisetech și le transmiteți contabilului sau le reconciliați cu instrumentele existente. Scopul este claritate, nu dublă muncă.",
      },
      {
        title: "Când are sens combinația",
        body: "Combinația are sens dacă aveți nevoie de facturare consacrată, dar echipa din locație are nevoie de POS rapid, stoc legat de vânzări și închidere casă verificabilă.",
      },
    ],
    faqs: [
      {
        question: "Trebuie să renunț la SmartBill?",
        answer: "Nu. Dacă SmartBill funcționează bine pentru facturare, îl puteți păstra și folosi franchisetech pentru operațiunile zilnice.",
      },
      {
        question: "Pot exporta date pentru contabil?",
        answer: "Da. franchisetech oferă rapoarte și exporturi operaționale pentru vânzări, TVA, stoc și achiziții.",
      },
      {
        question: "Care sistem este sursa pentru POS?",
        answer: "franchisetech trebuie să fie sursa pentru vânzările POS și stocul operațional. SmartBill poate rămâne sursa pentru facturi și fluxuri contabile externe.",
      },
    ],
    related: [
      { label: "franchisetech vs SmartBill", href: "/compare/smartbill" },
      { label: "Software POS România", href: "/resources/pos-software-romania" },
      { label: "Gestiune stoc România", href: "/resources/stock-management-romania" },
    ],
  },
];

export const publicPaths = [
  "/",
  "/contact",
  "/pricing",
  "/features",
  ...featurePages.filter((page) => isLeanPublicFeature(page.slug)).map((p) => p.path),
  "/industries",
  ...industryPages.filter((page) => page.slug !== "restaurants").map((p) => p.path),
  "/compare",
  ...comparisonPages.map((p) => p.path),
  "/resources",
  ...resourcePages.map((p) => p.path),
  "/help",
  "/help/romania-fiscalnet",
  "/privacy",
  "/terms",
  "/legal-disclaimer",
];

export function pageMetadata(
  page: {
    metaTitle: string;
    description: string;
    path: string;
    image?: string;
  },
  locale: MarketingLocale = "en",
): Metadata {
  const image = page.image ?? "/showcase/pos-grid.png";
  return {
    title: page.metaTitle,
    description: page.description,
    keywords: marketingKeywords(locale),
    alternates: localeAlternates(page.path, locale),
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: page.path,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: image, width: 1200, height: 750, alt: page.metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.description,
      images: [image],
    },
  };
}

export function findPage<T extends { slug: string }>(pages: T[], slug: string) {
  return pages.find((page) => page.slug === slug);
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}

export const PARTNERS_TITLE = "Partner with franchisetech — Grow your food-business network";
export const PARTNERS_DESCRIPTION =
  "Resellers, consultants, and multi-site operators: offer a modern POS and operations platform your clients can run day to day. We run the product; you grow the network.";

export function seoMeta({
  title,
  description,
  path,
  image = "/showcase/pos-grid.png",
  locale = "en" as MarketingLocale,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  locale?: MarketingLocale;
}): Metadata {
  return {
    title,
    description,
    keywords: marketingKeywords(locale),
    alternates: localeAlternates(path, locale),
    openGraph: {
      title,
      description,
      url: path,
      locale: marketingOpenGraphLocale(locale),
      images: [{ url: image, width: 1200, height: 750, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export const faqSchema = faqJsonLd;
