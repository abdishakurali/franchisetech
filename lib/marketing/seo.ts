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
    related: [{ label: "Z-report", href: "/features/z-report" }, { label: "Cafes", href: "/industries/cafes" }],
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
      { question: "Can I transfer stock between locations?", answer: "Not yet. Stock transfer between locations is on the roadmap — today, each location's stock is tracked separately." },
    ],
    related: [{ label: "Recipe costing", href: "/features/recipe-costing" }, { label: "Stock control article", href: "/blog/stoc-negativ-cauze-si-solutii" }, { label: "Restaurants", href: "/industries/restaurants" }],
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
    related: [{ label: "Stock management", href: "/features/stock-management" }],
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
    related: [{ label: "Z-report explained", href: "/resources/z-report-explained" }, { label: "POS feature", href: "/features/pos" }],
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
      { question: "Is this included in my plan?", answer: "It's part of the platform's feature set. Contact us to have it enabled for your organisation." },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Cafes", href: "/industries/cafes" },
    ],
  },
];

export const industryPages: SeoPage[] = [
  ...primaryIndustryPages,
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
    ],
    image: "/showcase/reports-dashboard.png",
    heroComponent: OwnerDashboardProof,
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
      { label: "Romania", href: "/industries/romania" },
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
    related: [{ label: "Funcționalitate raport Z", href: "/features/z-report" }, { label: "Ghid închidere de zi", href: "/blog/inchidere-zi-cafenea-cum-faci-corect" }, { label: "Funcționalitate POS", href: "/features/pos" }],
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
