import type { Metadata } from "next";
import { createElement } from "react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { comparisonPages } from "@/lib/marketing/comparisons";

export type { ComparisonPage } from "@/lib/marketing/comparisons";
export { comparisonPages, comparisonsByMarket, COMPARE_HUB_PATH } from "@/lib/marketing/comparisons";

export const SITE_URL = "https://franchisetech.ro";
export const BRAND = "franchisetech";
export const DEFAULT_TITLE = "franchisetech — POS & Business Control for Food Businesses";
export const DEFAULT_DESCRIPTION =
  "Stop guessing after service: run POS, close the till, track stock, see margins, and review daily sales — one platform for cafes and restaurants. No per-seat fees.";

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
    image: "/showcase/pos-cart.png",
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
    image: "/showcase/z-report.png",
  },
  {
    slug: "kitchen-display",
    path: "/features/kitchen-display",
    eyebrow: "Kitchen display",
    title: "Kitchen Display System for Restaurants and Cafes",
    metaTitle: "Kitchen Display (KDS) for Cafes and Restaurants",
    description: "Send paid POS orders to a clear kitchen board — new, preparing, ready, and done — with franchisetech Kitchen Display.",
    h1: "Kitchen display that keeps service moving",
    intro: "When Kitchen Display is enabled, paid POS orders appear on a prep board so kitchen and front-of-house stay aligned without paper tickets.",
    bullets: ["Orders from POS appear automatically", "New → Preparing → Ready → Done workflow", "Takeaway and dine-in labels", "Optional prep stations"],
    sections: [
      { title: "Clear order queue", body: "Staff see order lines, quantities, and timestamps on a large screen instead of shouting across the counter." },
      { title: "Status at a glance", body: "Move orders through preparing and ready so front-of-house knows when to hand off or pack." },
      { title: "Optional feature", body: "Kitchen Display is toggled per business in Settings — enable it only when your team is ready." },
    ],
    faqs: [
      { question: "Does Kitchen Display need extra hardware?", answer: "A tablet or monitor with a browser is enough. Many teams use a wall-mounted screen in the kitchen." },
      { question: "Which orders appear?", answer: "Paid POS orders created after Kitchen Display is enabled for your organisation." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Restaurants", href: "/industries/restaurants" }, { label: "Takeaways", href: "/industries/takeaways" }],
    image: "/showcase/kitchen-display.png",
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
    image: "/showcase/pos-cart.png",
  },
  {
    slug: "setup-onboarding",
    path: "/features/setup-onboarding",
    eyebrow: "Setup guide",
    title: "Guided Setup for New Businesses",
    metaTitle: "From New Account to First Sale in Under an Hour | franchisetech",
    description: "Free in-app setup: demo products, open till, and first test sale — most cafes finish core steps in under an hour. Optional premium setup for large migrations.",
    h1: "From new account to first sale in under an hour",
    intro: "The in-app setup guide walks you from signup through demo products, opening the till, and your first test sale — step by step, at no cost. Optional premium setup (€199) is available for large catalog migrations or FiscalNet hand-holding.",
    bullets: ["0–15 min: signup and business settings", "15–45 min: demo products and payment methods", "45–60 min: open till and first test sale", "Optional premium setup for 200+ SKU imports"],
    sections: [
      { title: "Clear milestones", body: "Each step links to the right screen — settings, POS, or reports — so setup stays focused." },
      { title: "Free self-serve by default", body: "Signup seeds demo products and payment methods. The guided checklist tracks progress from first product to first sale — no card required to open the till." },
      { title: "Premium setup when you need it", body: "Large catalog migration, multi-site rollout, or FiscalNet configuration? Optional assisted setup (€199) covers training and hand-holding — typically 1–2 days, not the core path." },
    ],
    faqs: [
      { question: "How long does setup take?", answer: "Core path (signup → demo products → open till → first sale): most cafes finish in under an hour. Full catalog migration with 200+ products may take 1–2 days — use optional premium setup or spread it over your trial." },
      { question: "What does the timeline look like?", answer: "0–15 min: account and settings. 15–45 min: products and payments. 45–60 min: open till and first test sale. Stock and recipes can wait until after the till is working." },
      { question: "Can I skip steps?", answer: "Yes. The guide is a checklist, not a blocker. You can return to any step later." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Pricing", href: "/pricing" }],
    image: "/showcase/setup-guide.png",
  },
  {
    slug: "qr-code-receipts",
    path: "/features/qr-code-receipts",
    eyebrow: "Fiscal compliance",
    title: "QR Code on Fiscal Receipts — Romania ANAF Ready",
    metaTitle: "QR Code Bon Fiscal România | ANAF November 2026 | franchisetech",
    description: "franchisetech supports QR codes on fiscal receipts for Romanian businesses. Ready for ANAF November 2026 deadline via FiscalNet integration.",
    h1: "QR code on fiscal receipts — ready for Romania's 2026 requirement",
    intro: "Romania mandates QR codes on fiscal receipts from November 1, 2026. franchisetech is ready — our FiscalNet integration supports QR-enabled fiscal devices so your business stays compliant without last-minute scrambling.",
    bullets: [
      "QR code printed on every fiscal receipt",
      "ANAF-compliant data format in the QR",
      "Works with QR-capable fiscal printers (Datecs, Tremol, etc.)",
      "No extra configuration — enabled via FiscalNet driver",
      "November 2026 deadline ready today",
    ],
    sections: [
      {
        title: "What is the QR code requirement?",
        body: "Starting November 1, 2026, Romanian fiscal receipts (bonuri fiscale) must include a QR code containing transaction data: CIF, receipt number, date, total, and VAT breakdown. The QR code allows ANAF to verify receipts instantly. Businesses without compliant systems face fines of 8,000–10,000 RON.",
      },
      {
        title: "How franchisetech handles it",
        body: "franchisetech sends sale data to your FiscalNet-connected fiscal printer. The QR code generation happens in the certified fiscal device firmware — not in our software. This means the QR is generated by the ANAF-approved hardware, ensuring compliance. Your fiscal printer must support the latest firmware update for QR generation.",
      },
      {
        title: "What you need to do",
        body: "1) Ensure your fiscal printer (casa de marcat) has QR-capable firmware — contact your authorized service provider. 2) Verify FiscalNet driver is updated. 3) Continue using franchisetech POS normally. The QR appears automatically on receipts once firmware and driver are ready.",
      },
    ],
    faqs: [
      {
        question: "When does the QR code become mandatory?",
        answer: "November 1, 2026. Sanctions for non-compliance were suspended until this date to give businesses time to upgrade firmware and systems.",
      },
      {
        question: "Does franchisetech generate the QR code?",
        answer: "No. The QR code is generated by your certified fiscal device (casa de marcat) as required by Romanian law. franchisetech sends the sale data; the device prints the compliant receipt with QR.",
      },
      {
        question: "What data is in the QR code?",
        answer: "The QR contains: business CIF, receipt number, date/time, total amount, VAT breakdown, and a verification hash. ANAF specifies the exact XML structure.",
      },
      {
        question: "Do I need to buy new hardware?",
        answer: "Most modern fiscal devices (Datecs, Tremol, Daisy, Custom) support QR via firmware update. Check with your authorized distributor. Older devices may need replacement.",
      },
      {
        question: "What happens if I miss the deadline?",
        answer: "Fines range from 8,000 to 10,000 RON for emitting receipts without the required QR code after November 1, 2026.",
      },
    ],
    related: [
      { label: "Romania FiscalNet guide", href: "/help/romania-fiscalnet" },
      { label: "POS for Romania", href: "/industries/romania" },
      { label: "Z-report and daily closing", href: "/features/z-report" },
    ],
    image: "/marketing/reports-zreport.png",
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
      "TVA breakdown by rate (19%, 9%, 5%, 0%)",
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
        body: "The complete inventory report combining all movements in chronological order: opening stock, NIR entries, consumption, Z-report sales values, and closing stock — split by TVA rate columns (19%, 9%, 5%, 0%).",
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
    image: "/marketing/reports-zreport.png",
  },
];

export const industryPages: SeoPage[] = [
  {
    slug: "cafes",
    path: "/industries/cafes",
    eyebrow: "Cafés & Coffee Shops",
    title: "POS System for Cafes and Coffee Shops",
    metaTitle: "POS System for Cafes and Coffee Shops | franchisetech",
    description: "franchisetech helps cafes run POS sales, track cash and card totals, manage products, stock, recipes, and staff — without per-seat fees.",
    h1: "POS and business control for cafes and coffee shops",
    intro: "Cafes need quick sales, clean cash-up, recipe margins, and simple team management — without a complicated system or locked-in POS contracts.",
    bullets: [
      "Fast POS for counter service",
      "Coffee, food, and retail products",
      "Recipe costing for menu items",
      "Stock, suppliers, purchases, and daily reports",
      "Unlimited staff — no per-user fees",
      "Browser-based — laptop, tablet, or till device",
    ],
    sections: [
      {
        title: "Common café pain points",
        body: "Busy service, cash/card reconciliation, changing prices, ingredient waste, unclear margins, and managing a growing team without per-user software costs can all make small cafes harder to run.",
      },
      {
        title: "One workspace for service and back office",
        body: "POS, stock, purchases, recipes, and reports connect so owners see sales and costs together — not in separate spreadsheets after close.",
      },
      {
        title: "Reports owners get",
        body: "Sales, till close, stock alerts, recipe margins, transactions, refunds, staff audit trail, and export — all accessible from any device.",
      },
    ],
    faqs: [
      { question: "Can I add unlimited baristas and staff?", answer: "Yes. You can add as many team members as you need at no extra cost. Each gets a role — cashier, manager, kitchen, etc." },
      { question: "Can I cost coffee and food recipes?", answer: "Yes. Recipes can be built from ingredients to calculate cost per portion, gross margin, and can-make counts." },
      { question: "Do I need special hardware?", answer: "No. franchisetech runs in the browser. Use a laptop, tablet, or existing till screen to start." },
      { question: "Can I track daily cash-up?", answer: "Yes. Opening cash, cash/card sales, counted cash, and difference are recorded at till close." },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Recipe costing", href: "/features/recipe-costing" },
      { label: "Cafe POS guide", href: "/resources/pos-system-for-small-cafes" },
    ],
    image: "/marketing/industry-cafe.png",
  },
  {
    slug: "restaurants",
    path: "/industries/restaurants",
    eyebrow: "Restaurants",
    title: "Restaurant POS System — Stock, Recipes, Staff",
    metaTitle: "Restaurant POS | Recipe Costing, Staff, Kitchen Display | franchisetech",
    description: "franchisetech helps small restaurants manage POS sales, stock, suppliers, purchases, recipes, staff, and daily reports in one workspace.",
    h1: "POS, stock, and recipe control for small restaurants",
    intro: "Restaurants need clear sales records, ingredient stock, supplier purchases, food cost visibility, and reliable team management — without enterprise complexity or per-seat pricing.",
    bullets: [
      "POS sales and receipts",
      "Supplier and purchase records",
      "Recipe cost per portion and margin",
      "Till close and daily sales reports",
      "Unlimited staff with role-based access",
      "Kitchen display for prep teams",
    ],
    sections: [
      {
        title: "Pain points owners face",
        body: "Food cost drift, unclear margins, stock-outs during service, and till discrepancies at close — without a single system tying sales to ingredients and cash.",
      },
      {
        title: "Food cost and recipe control",
        body: "Connect ingredients to recipes, record supplier purchases, and see cost per portion, gross margin, and can-make counts update as stock changes.",
      },
      {
        title: "Team management for restaurant staff",
        body: "Add unlimited staff — waiters, cashiers, kitchen, managers — each with the right role and access level. Invite by email and review a full audit trail.",
      },
    ],
    faqs: [
      { question: "Can it calculate recipe margins?", answer: "Yes. Recipe costing compares ingredient cost per portion with the sale price and shows gross margin." },
      { question: "How many staff can I add?", answer: "Unlimited. Every team member — kitchen, cashier, manager — at no extra per-user cost." },
      { question: "Is there a kitchen display?", answer: "Yes. Paid POS orders can flow to a prep board — new, preparing, ready, done — when enabled in settings." },
      { question: "Can I track supplier spend?", answer: "Yes. Purchases and supplier records show spend by vendor alongside stock levels." },
    ],
    related: [
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Recipe costing", href: "/features/recipe-costing" },
      { label: "Z-report", href: "/features/z-report" },
      { label: "Kitchen display", href: "/features/kitchen-display" },
    ],
    image: "/marketing/industry-restaurant.png",
  },
  {
    slug: "takeaways",
    path: "/industries/takeaways",
    eyebrow: "Takeaways",
    title: "Takeaway POS System and Stock Management",
    metaTitle: "Takeaway POS System, Stock Management, Products, and Reports",
    description: "franchisetech helps takeaways sell quickly, track payments, manage products, ingredients, stock, purchases, and daily reports.",
    h1: "A simple POS and stock system for takeaways",
    intro: "Takeaways need speed at the till, clear product prices, cash/card totals, and stock records that are easy to maintain.",
    bullets: ["Fast product grid", "Refunds and voids with reason", "Ingredient and stock tracking", "Daily cash-up and reports", "Unlimited staff — no per-seat fees"],
    sections: [
      { title: "Pain points", body: "Fast service can lead to missed records, unclear voids, and stock surprises during busy evenings." },
      { title: "How franchisetech helps", body: "franchisetech keeps sales, voids, customers, products, and stock in one system that owners can review later." },
      { title: "Useful reports", body: "Transactions, Z-report, VAT-ready records, product performance, stock, purchases, and audit export." },
    ],
    faqs: [
      { question: "Can I use franchisetech without payment hardware?", answer: "Yes. It records the payment method, but hardware/payment terminal integration is not claimed as live." },
      { question: "Can I void a mistaken order?", answer: "Yes. Voids can be recorded with a reason." },
      { question: "Can I track stock for ingredients?", answer: "Yes. Ingredients can be stock-tracked products." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Stock management", href: "/features/stock-management" }, { label: "Z-report", href: "/features/z-report" }],
    image: "/showcase/pos-cart.png",
  },
  {
    slug: "food-trucks",
    path: "/industries/food-trucks",
    eyebrow: "Food trucks",
    title: "Food Truck POS and Mobile Food Business Control",
    metaTitle: "Food Truck POS, Cash/Card Tracking, Stock, and Food Records",
    description: "franchisetech helps food trucks and mobile food businesses run sales, track cash/card totals, manage products, stock, recipes, and food records.",
    h1: "POS and business control for food trucks",
    intro: "Food trucks need a simple register, clear cash/card totals, portable product control, and records owners can review after service.",
    bullets: ["Simple register for service", "Cash/card and daily close", "Products, recipes, and stock", "Browser-based — works on mobile devices"],
    sections: [
      { title: "Pain points", body: "Mobile service has limited time and space. Owners need simple tools that keep records organised without slowing the queue." },
      { title: "How franchisetech helps", body: "franchisetech brings POS, products, stock, recipes, suppliers, and reports into one browser-based workspace." },
      { title: "Suggested setup", body: "Create best-selling products, set up cash/card payment methods, add recipe ingredients, and review stock before service." },
    ],
    faqs: [
      { question: "Does franchisetech work offline?", answer: "franchisetech is a cloud web app and should be treated as requiring internet access." },
      { question: "Can I see end-of-day cash?", answer: "Yes. The till close and Z-report help review expected cash and differences." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Z-report", href: "/features/z-report" }, { label: "Cash-up guide", href: "/resources/cash-up-at-end-of-day" }],
    image: "/marketing/industry-food-truck.png",
  },
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
    image: "/marketing/pos-hero.png",
  },
  {
    slug: "romania",
    path: "/industries/romania",
    eyebrow: "🇷🇴 România",
    title: "Soft de Casa de Marcat Romania — FiscalNet, TVA, lei",
    metaTitle: "POS Romania cu FiscalNet | TVA 19%/9%/5% | lei (RON) | franchisetech",
    description: "franchisetech este un sistem POS pentru restaurante, cafenele și magazine din România. Integrare FiscalNet, afișaj în lei (RON), cote TVA românești (19%/9%/5%), membri de echipă nelimitați.",
    h1: "POS pentru afaceri din România — FiscalNet, TVA, lei",
    intro: "franchisetech este configurat pentru piața românească: monedă lei (RON), cote TVA standard, integrare FiscalNet pentru bonuri fiscale, și echipă nelimitată fără costuri suplimentare.",
    bullets: [
      "Afișaj în lei (RON) în tot sistemul — POS, rapoarte, bonuri",
      "Cote TVA românești pre-încărcate: 19%, 9%, 5%, 0%",
      "Integrare FiscalNet pentru bonuri fiscale",
      "Tipuri de plată mapate pentru FiscalNet (coduri 1–8): numerar, card, tichete masă etc.",
      "Grupe TVA FiscalNet (1–5) configurabile per cotă",
      "Membri de echipă nelimitați fără cost suplimentar",
      "Rapoarte zilnice: vânzări, numerar, marjă, stoc",
    ],
    sections: [
      {
        title: "Monedă și TVA pentru România",
        body: "Toate sumele se afișează în lei (RON). Cotele TVA sunt pre-încărcate: TVA Standard 19% (grupa FiscalNet 1), TVA Redus 9% (grupa 2), TVA Super-redus 5% (grupa 3), Scutit 0% (grupa 4). Cotele sunt editabile oricând.",
      },
      {
        title: "Integrare FiscalNet completă",
        body: "franchisetech se conectează la driver-ul FiscalNet pentru emiterea bonurilor fiscale. Suportă toate metodele de plată (cod 1–8): numerar, card, credit, tichete masă, tichete valorice, voucher, plată modernă. Reducerile per articol se transmit automat ca comandă DP^.",
      },
      {
        title: "Echipă nelimitată, roluri clare",
        body: "Adaugă toți angajații fără taxe per utilizator. 8 roluri disponibile: Proprietar, Manager, Casier, Bucătărie, Stoc, Contabil, Suport, Doar citire. Invitații prin email, dezactivare instantă, jurnal de audit complet.",
      },
    ],
    faqs: [
      { question: "franchisetech afișează prețurile în lei?", answer: "Da. Toate prețurile, rapoartele, bonurile și POS-ul afișează în lei (RON) pentru organizațiile din România." },
      { question: "Sunt pre-încărcate cotele TVA românești?", answer: "Da. TVA Standard 19%, TVA Redus 9%, TVA Super-redus 5% și Scutit 0% sunt disponibile de la început. Pot fi editate sau completate oricând." },
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
    image: "/marketing/reports-zreport.png",
  },
  {
    slug: "multi-site",
    path: "/industries/multi-site",
    eyebrow: "Multi-location",
    title: "POS for Multi-Site Food Businesses — €89 per Additional Location",
    metaTitle: "Multi-Location POS for Restaurants & Cafes | franchisetech",
    description:
      "Run 2–5 food locations on one platform: shared product catalogue, per-site till close, stock and reports per location — Scale base + €89/month per additional site, unlimited staff.",
    h1: "One workspace for every location — without per-seat fees",
    intro:
      "Small chains and multi-site operators need the same clarity at each location: till matches drawer, daily Z-report, stock visibility — plus a simple way to add sites as you grow.",
    bullets: [
      "Scale base + €89/month per additional location — unlimited staff",
      "POS, till close, and Z-report at every location",
      "Stock, purchases, and recipes per site (Operations)",
      "Kitchen display where prep teams need it",
      "Browser-based — no locked-in POS hardware contracts",
      "Assisted setup for new locations (optional €199)",
    ],
    sections: [
      {
        title: "Add a second location without starting over",
        body: "When you open site two, you should not rebuild products, payment methods, and workflows from scratch. franchisetech lets each location run daily service with its own till sessions and reports while you keep operational patterns consistent.",
      },
      {
        title: "Per-site truth at close",
        body: "Each location gets expected cash vs counted, card totals, and Z-report visibility for that site — so owners and managers review the right numbers without blending locations in Excel.",
      },
      {
        title: "Grow when ready — not before",
        body: "Start on Core at a single site. Upgrade to Operations for stock and recipes, or Scale for the full module set. Add locations on the multi-location add-on when a second shop is real — not during trial setup.",
      },
    ],
    faqs: [
      {
        question: "How is multi-location priced?",
        answer: "Scale plan (€109/month) as the base, then €89/month per additional location. Unlimited staff at each site — no per-user fees.",
      },
      {
        question: "Can I manage products centrally?",
        answer: "Each organisation runs its site with a consistent product and settings model. For operators with multiple legal entities, contact us — we onboard multi-site setups with assisted setup.",
      },
      {
        question: "Do I need Scale before adding locations?",
        answer: "Yes — the multi-location add-on requires a Scale base plan. Many operators start on Core or Operations at site one, then upgrade to Scale when ready to expand.",
      },
      {
        question: "Does FiscalNet work at every site?",
        answer: "FiscalNet runs on the cashier PC at each Romanian location. We walk through connector setup per site during assisted onboarding.",
      },
    ],
    related: [
      { label: "Pricing", href: "/pricing" },
      { label: "Restaurants", href: "/industries/restaurants" },
      { label: "Romania", href: "/industries/romania" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/showcase/reports-dashboard.png",
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
    image: "/marketing/sc-products.png",
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
    image: "/marketing/pos-hero.png",
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
      "Optional workflows: kitchen display, tips, split payments",
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
        body: "Kitchen display, order types, tips, split payments, and table service can be enabled per organisation in Settings. They are all off by default. Enabling them does not affect unrelated workflows.",
      },
      {
        title: "Hardware connectors — verified setups only",
        body: "Android and Windows connector apps are available for ESC/POS receipt printers and cash drawer triggers. Automatic drawer opening is sent after verified connector setups. A manual fallback is always present — no hardware is required to use the software.",
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
    image: "/marketing/pos-hero.png",
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
    title: "What Small Cafes Need From a POS System",
    metaTitle: "What Small Cafes Need From a POS System",
    description: "A practical guide to POS systems for small cafes, covering till speed, products, cash/card tracking, receipts, refunds, and daily close.",
    intro: "A small cafe POS should help staff serve quickly, keep records clean, and give owners the numbers they need at the end of the day.",
    sections: [
      { title: "The till must stay simple", body: "Counter service is fast. A POS should make common products easy to find, keep the cart clear, and let staff complete a sale without hunting through back-office menus." },
      { title: "Cash and card tracking matters", body: "Owners need to compare cash in the drawer, card totals, refunds, voids, and end-of-day records. This is especially important when several staff members use the same till." },
      { title: "Products are more than buttons", body: "A cafe product list should include categories, VAT rate, sale price, cost, stock behaviour, and whether the item appears in POS." },
      { title: "The close is where errors show", body: "Open cash, cash sales, cash in/out, expected cash, counted cash, and differences should be recorded in one place so the next day starts cleanly." },
      { title: "How franchisetech helps", body: "franchisetech combines POS, products, transactions, refunds, customers, stock, recipes, purchases, and reports for small food businesses." },
    ],
    faqs: [
      { question: "What is the most important POS feature for a small cafe?", answer: "Speed and clarity. Staff should be able to sell common products quickly and owners should be able to review accurate records later." },
      { question: "Should a cafe POS track stock?", answer: "For many cafes, yes. Even simple stock visibility helps with purchasing and waste control." },
      { question: "Does franchisetech include payment hardware?", answer: "franchisetech records payment method today. Hardware and payment terminal integrations should not be assumed unless configured separately." },
    ],
    related: [{ label: "POS feature", href: "/features/pos" }, { label: "Cafes", href: "/industries/cafes" }, { label: "Z-report guide", href: "/resources/z-report-explained" }],
  },
  {
    slug: "recipe-costing-for-cafes",
    path: "/resources/recipe-costing-for-cafes",
    title: "How to Calculate Recipe Cost and Margin for Cafe Products",
    metaTitle: "How to Calculate Recipe Cost and Margin for Cafe Products",
    description: "Learn how to calculate recipe cost, sale price margin, and can-make counts for cafe products using a Chicken Caesar example.",
    intro: "Recipe costing helps owners understand whether a product is actually profitable after ingredients, portion size, and sale price are considered.",
    sections: [
      { title: "Start with ingredients", body: "List every ingredient used in the product. For a Chicken Caesar example, include chicken, lettuce, dressing, parmesan, croutons, wrap or bowl, and packaging." },
      { title: "Add the quantity used", body: "Each recipe line needs a quantity. If chicken costs EUR 10 per kg and the recipe uses 120g, the chicken cost for one portion is EUR 1.20." },
      { title: "Calculate recipe cost", body: "Add each ingredient cost together. If chicken is EUR 1.20, lettuce EUR 0.35, dressing EUR 0.25, parmesan EUR 0.30, croutons EUR 0.18, and packaging EUR 0.22, the recipe cost is EUR 2.50." },
      { title: "Compare with sale price", body: "If the Chicken Caesar sells for EUR 8.95 and costs EUR 2.50 to make, gross profit is EUR 6.45. Margin is gross profit divided by sale price, about 72% before other overheads." },
      { title: "Use can-make counts", body: "If stock has 2.4kg of chicken and each portion uses 120g, chicken supports 20 portions. The true can-make count is limited by the lowest available ingredient." },
      { title: "How franchisetech helps", body: "franchisetech lets you build recipes from products, track cost, compare sale price, and connect stock to can-make visibility." },
    ],
    faqs: [
      { question: "What is recipe margin?", answer: "Recipe margin compares the product sale price with ingredient cost. It helps show how much gross margin remains before overheads." },
      { question: "Should packaging be included?", answer: "Yes. Packaging is a real cost and should be included when it is part of the product." },
      { question: "Is this accounting advice?", answer: "No. This is operational guidance. franchisetech helps keep organised records and does not replace professional accounting or tax advice." },
    ],
    related: [{ label: "Recipe costing feature", href: "/features/recipe-costing" }, { label: "Stock management", href: "/features/stock-management" }, { label: "Health bars", href: "/industries/health-bars" }],
  },
  {
    slug: "z-report-explained",
    path: "/resources/z-report-explained",
    title: "What Is a Z-report and Why Does It Matter?",
    metaTitle: "What Is a Z-report and Why Does It Matter?",
    description: "A plain-language explanation of Z-reports, till closing, cash reconciliation, cash/card totals, and daily sales records.",
    intro: "A Z-report is an end-of-day till report. It helps owners understand sales, payment totals, and cash differences.",
    sections: [
      { title: "What a Z-report usually includes", body: "A useful Z-report shows opening cash, cash sales, card sales, cash in, cash out, expected cash, counted cash, and any difference." },
      { title: "Why it matters", body: "The Z-report creates a closing point for the day. It makes it easier to spot mistakes, review refunds, and compare cash/card totals." },
      { title: "Cash reconciliation", body: "Expected cash is usually opening cash plus cash sales plus cash in minus cash out. Counted cash is what is physically counted at close." },
      { title: "VAT-ready records", body: "franchisetech can help keep VAT-ready records, but it does not replace professional tax advice or official requirements." },
      { title: "How franchisetech helps", body: "franchisetech records till sessions, payment methods, transactions, cash movements, and close-till figures in one place." },
    ],
    faqs: [
      { question: "Is a Z-report the same as a sales report?", answer: "Not exactly. A sales report focuses on sales activity. A Z-report is usually tied to till close and cash reconciliation." },
      { question: "Can Z-reports prevent cash mistakes?", answer: "They cannot prevent every mistake, but they make differences visible and easier to review." },
      { question: "Does franchisetech file tax returns?", answer: "No. franchisetech helps you keep organised records. It does not replace accounting or tax advice." },
    ],
    related: [{ label: "Z-report feature", href: "/features/z-report" }, { label: "Cash-up guide", href: "/resources/cash-up-at-end-of-day" }, { label: "POS feature", href: "/features/pos" }],
  },
  {
    slug: "food-business-stock-control",
    path: "/resources/food-business-stock-control",
    title: "Simple Stock Control for Small Food Businesses",
    metaTitle: "Simple Stock Control for Small Food Businesses",
    description: "A practical stock-control guide for cafes, takeaways, food trucks, and small restaurants.",
    intro: "Small food businesses do not need complicated warehouse software, but they do need a clear stock process.",
    sections: [
      { title: "Start with the products that matter", body: "Track the ingredients and products that affect cost, availability, or waste. Not every small item needs the same level of control." },
      { title: "Record purchases consistently", body: "Supplier, purchase date, product, quantity, unit, and unit cost are enough to build a useful purchase history." },
      { title: "Use reorder levels", body: "A reorder level gives staff a clear signal that a product needs attention before it runs out." },
      { title: "Connect recipes to stock", body: "When recipes are connected to ingredients, sales can help explain stock usage and can-make counts." },
      { title: "How franchisetech helps", body: "franchisetech connects products, ingredients, suppliers, purchases, recipes, and POS sales so stock is easier to review." },
    ],
    faqs: [
      { question: "How often should a small cafe check stock?", answer: "Fast-moving ingredients should be checked frequently. Slower items can be reviewed less often." },
      { question: "What is can-make?", answer: "Can-make estimates how many finished products can be made from current ingredient stock." },
      { question: "Can franchisetech import stock products?", answer: "Yes. Product import/export is supported by CSV." },
    ],
    related: [{ label: "Stock management", href: "/features/stock-management" }, { label: "Recipe costing", href: "/features/recipe-costing" }, { label: "Restaurants", href: "/industries/restaurants" }],
  },
  {
    slug: "cash-up-at-end-of-day",
    path: "/resources/cash-up-at-end-of-day",
    title: "How to Cash Up at the End of the Day",
    metaTitle: "How to Cash Up at the End of the Day",
    description: "A simple cash-up process for cafes and small food businesses, including opening cash, sales, cash in/out, counted cash, and differences.",
    intro: "Cash-up is the daily habit of checking that till records match what is in the drawer and what was paid by card.",
    sections: [
      { title: "Start with opening cash", body: "Opening cash is the float in the till before sales begin. It should be recorded when the till is opened." },
      { title: "Add cash sales", body: "Cash sales increase the expected cash in the drawer. Card sales should be kept separate because they are not physical cash." },
      { title: "Record cash in and cash out", body: "Cash added to or removed from the drawer should have an amount and reason so the expected cash stays accurate." },
      { title: "Count the drawer", body: "At the end of the day, count physical cash and compare it with expected cash. Any difference should be recorded with notes." },
      { title: "Use the close as a reset point", body: "A clean close means tomorrow starts with a clear opening cash amount and a traceable record of yesterday." },
    ],
    faqs: [
      { question: "What if counted cash does not match expected cash?", answer: "Record the difference and notes. The goal is a clear record, not hiding the variance." },
      { question: "Should card totals be included in cash?", answer: "No. Card totals should be tracked separately from physical cash in the drawer." },
      { question: "Can franchisetech open a cash drawer?", answer: "A cloud app can only attempt this through a configured local connector. Without one, staff should open the drawer manually." },
    ],
    related: [{ label: "Z-report", href: "/features/z-report" }, { label: "POS", href: "/features/pos" }, { label: "Z-report explained", href: "/resources/z-report-explained" }],
  },
  {
    slug: "pos-software-romania",
    path: "/resources/pos-software-romania",
    title: "Software POS pentru restaurante și cafenele în România",
    metaTitle: "Software POS România — casă, FiscalNet, TVA, stoc | franchisetech",
    description:
      "Ghid practic pentru alegerea unui software POS în România: casă de marcat, FiscalNet, TVA 19%/9%/5%, stoc, rețete și raport Z pentru cafenele și restaurante mici.",
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
        body: "Nu cerem migrare big-bang. Setup asistat (199€) include produse demo, deschidere casă și ghidare la prima vânzare. Majoritatea trialurilor activează prima vânzare într-o singură sesiune ghidată.",
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
  "/pricing",
  "/features",
  ...featurePages.map((p) => p.path),
  ...industryPages.map((p) => p.path),
  "/compare",
  ...comparisonPages.map((p) => p.path),
  "/resources",
  ...resourcePages.map((p) => p.path),
  "/partners",
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
  const image = page.image ?? "/showcase/pos-cart.png";
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
  image = "/showcase/pos-cart.png",
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
