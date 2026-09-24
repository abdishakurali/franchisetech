import type { SeoPage } from "@/lib/marketing/seo";
import {
  INDUSTRY_COMPETITOR_SLUGS,
  INDUSTRY_SHOWCASE_DEFAULTS,
} from "@/lib/marketing/industry-verticals";
import {
  OwnerDashboardProof,
  OwnerPosProof,
  OwnerRecipeProof,
  OwnerStockProof,
  OwnerZReportProof,
} from "@/components/marketing/OwnerProofScreens";

/** Primary HoReCa vertical pages with extended landing fields (EN base). */
export const primaryIndustryPages: SeoPage[] = [
  {
    slug: "cafes",
    path: "/industries/cafes",
    eyebrow: "Cafés & coffee shops",
    title: "POS for Cafes and Coffee Shops",
    metaTitle: "POS for Cafes — FiscalNet, Recipe Costing, Z-Report | franchisetech",
    description:
      "Browser POS for Romanian cafes: fast counter sales, recipe margins, FiscalNet receipts, unlimited staff, and Z-report in under 30 seconds.",
    h1: "Your cafe sells fast. You know the numbers at close.",
    heroBefore: "Your cafe sells fast. ",
    heroHighlight: "You know the numbers at close",
    heroAfter: ".",
    heroSubheadline: "Counter POS, ingredient stock, and daily till close — one workspace, no per-seat fees.",
    intro:
      "Cafes need rush-hour speed at the counter, clear margins on coffee and food, and a till that matches the drawer — without locked hardware or per-user pricing.",
    bullets: [
      "One-tap product grid for rush hour",
      "Recipe costing for coffee and food",
      "Cash, card, and meal voucher payments",
      "FiscalNet fiscal receipts when configured",
      "Z-report and till close in minutes",
      "Unlimited baristas — no per-seat fees",
    ],
    painPoints: [
      {
        title: "Rush hour at the counter",
        text: "The queue grows while staff hunt through menus. You need a product grid that sells in one tap — espresso, pastries, and add-ons without training marathons.",
      },
      {
        title: "Margins hidden in the menu",
        text: "Milk, syrup, and beans move fast but you are not sure which drinks actually pay. Recipe costing ties ingredients to each cup so you see margin before you change prices.",
      },
      {
        title: "Till vs drawer at close",
        text: "Card totals, cash in the drawer, and Sodexo slips should add up without a spreadsheet. Opening cash, sales, and counted cash live in one Z-report workflow.",
      },
    ],
    featureRows: [
      {
        title: "Fast counter POS",
        body: "Product grid, cart, and charge on laptop or tablet — no proprietary till required. New baristas can sell from day one with a clear layout.",
        component: OwnerPosProof,
      },
      {
        title: "Recipe costing for every drink",
        body: "Link milk, coffee, syrups, and packaging to menu items. See cost per portion, gross margin, and how many you can make from current stock.",
        component: OwnerRecipeProof,
      },
      {
        title: "Z-report when you lock the door",
        body: "Opening float, cash and card totals, cash in/out, expected vs counted — daily close figures owners and accountants can trust.",
        component: OwnerZReportProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS.cafes,
    competitorRows: [
      ["Counter POS speed", "Browser grid — laptop or tablet", "Varies — often desktop-first"],
      ["Recipe margins", "Built-in recipe costing", "Often limited in POS-only tools"],
      ["Staff pricing", "Unlimited on paid plans", "Check per-terminal or per-user fees"],
      ["FiscalNet (RO)", "When enabled in Settings", "Varies by vendor and setup"],
      ["Monthly price listed", "From €49/mo on site", "Often quote-only"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS.cafes,
    sections: [],
    faqs: [
      {
        question: "Does it work with my existing fiscal printer?",
        answer:
          "franchisetech connects via FiscalNet on the cashier PC when enabled. Your certified fiscal device prints the receipt; we send sale data. Check firmware supports QR if you need November 2026 compliance.",
      },
      {
        question: "Can new baristas use it without long training?",
        answer: "Yes. The product grid is designed for counter speed — tap product, charge, done. Roles limit who can void or close the till.",
      },
      {
        question: "Can I track milk, coffee, and syrups automatically?",
        answer: "Yes, with Operations: recipes link ingredients to products and sales can reduce stock when configured.",
      },
      {
        question: "Cash, card, and meal vouchers?",
        answer: "Payment methods map to FiscalNet codes where configured — cash, card, meal tickets, and more.",
      },
      {
        question: "How fast is daily close?",
        answer: "Most cafes record counted cash and review the Z-report in a few minutes once the till session is open.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/marketing/industry-cafe.png",
    ctaTitle: "Open the till free — 15 days",
    ctaSubtitle: "Guided setup for cafes: demo products, first sale, and Z-report.",
  },
  {
    slug: "restaurants",
    path: "/industries/restaurants",
    eyebrow: "Restaurants",
    title: "Restaurant POS — Sales, Stock, Z-Report",
    metaTitle: "Restaurant POS Romania — Sales, Recipes, FiscalNet | franchisetech",
    description:
      "Restaurant POS in the browser: fast sales, recipe margins, FiscalNet, and Z-report — no dedicated POS hardware required.",
    h1: "From first sale to Z-report — all in one place.",
    heroBefore: "From first sale to ",
    heroHighlight: "Z-report",
    heroAfter: " — all in one place.",
    heroSubheadline: "Sales, recipes, stock, and till close on any tablet in the restaurant.",
    intro:
      "Restaurants need fast checkout, ingredient control, and fiscal compliance — without enterprise contracts or fixed POS terminals.",
    bullets: [
      "Fast POS checkout",
      "One fiscal receipt per sale",
      "Recipe margins per dish",
      "Sections: dining room, terrace, bar",
      "Browser-based — any tablet",
    ],
    painPoints: [
      {
        title: "Sales hard to reconcile at close",
        text: "Cash, card, and VAT need to match quickly without a separate spreadsheet.",
      },
      {
        title: "Food cost you cannot see",
        text: "Ingredient prices move but menu prices stay fixed. Recipes tie purchases to portions so you know margin per dish before service.",
      },
      {
        title: "Close night with mixed payments",
        text: "Cash, card, and split tables should reconcile to one Z-report. Expected vs counted cash and card totals stay in one session.",
      },
    ],
    featureRows: [
      {
        title: "Fast checkout and fiscal receipts",
        body: "Open the till, add products, take payment, and issue the fiscal receipt when FiscalNet is enabled.",
        component: OwnerPosProof,
      },
      {
        title: "Daily till close",
        body: "Owners see cash expected, card totals, TVA breakdown, and the Z-report workflow in one place.",
        component: OwnerZReportProof,
      },
      {
        title: "Owner dashboard and Z-report",
        body: "Daily sales, till status, VAT breakdown, and export packs for your accountant — from the same workspace as POS.",
        component: OwnerDashboardProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS.restaurants,
    competitorRows: [
      ["Runs in browser", "Yes — laptop or tablet", "Often dedicated hardware"],
      ["Stock + recipes", "Included in Operations", "Varies — may need modules"],
      ["Z-report / VAT report", "Included", "Varies by package"],
      ["Listed monthly price", "From €79/mo Operations", "Often quote-only install"],
      ["Setup time", "Under an hour self-serve", "Often on-site project"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS.restaurants,
    sections: [],
    faqs: [
      {
        question: "Do I need special POS hardware?",
        answer: "No. franchisetech runs in the browser on tablets you already use. FiscalNet runs on the cashier PC for fiscal receipts.",
      },
      {
        question: "Can I start with counter POS only?",
        answer: "Yes. The core flow is counter POS: products, cart, payment, fiscal receipt, and Z-report.",
      },
      {
        question: "Can I track recipe costs?",
        answer: "Yes. Operations includes recipes, ingredients, purchases, and margin reports.",
      },
      {
        question: "VAT breakdown for my accountant?",
        answer: "Sales reports and export packs include TVA by rate for Romanian organisations.",
      },
    ],
    related: [
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/marketing/industry-restaurant.png",
    ctaTitle: "Try restaurant POS — 15 days free",
    ctaSubtitle: "Sales, stock, recipes, and till close — configured for daily control.",
  },
  {
    slug: "takeaways",
    path: "/industries/takeaways",
    eyebrow: "Takeaway & fast food",
    title: "Takeaway POS — fast counter, FiscalNet",
    metaTitle: "Takeaway POS Romania — Fast Counter, Till Close | franchisetech",
    description:
      "Takeaway and fast food POS: fast counter grid, split cash and card, FiscalNet receipts, and daily Z-report.",
    h1: "Orders out in three taps, not three screens.",
    heroBefore: "Orders out in ",
    heroHighlight: "three taps, not three screens",
    heroAfter: ".",
    heroSubheadline: "A flat product grid built for peak-hour speed, with a fiscal receipt on every sale.",
    intro:
      "Takeaway operators need queue speed and fiscal compliance, not a feature wall. franchisetech keeps the counter grid flat and fast, and every sale gets a FiscalNet receipt.",
    bullets: [
      "Flat product grid at counter — no nested menus",
      "Split cash and card, with change calculated",
      "Stock updates as you sell, on Operations",
      "Z-report and sales reports at close",
    ],
    painPoints: [
      {
        title: "Rush hour queues and mis-rung orders",
        text: "Fixed-price menu items render as tiles that don't move position, so muscle memory takes over at peak.",
      },
      {
        title: "Different shifts, one shared drawer",
        text: "Each shift gets its own till open, cash movements, and close, with a named person responsible.",
      },
      {
        title: "Not sure what's actually selling",
        text: "The sales report shows top items over an explicit date range; Operations adds cost per portion.",
      },
    ],
    featureRows: [
      {
        title: "Counter speed",
        body: "Fixed-price menu tiles with stable positions, search, and one-tap charge — built for high-volume service.",
        component: OwnerPosProof,
      },
      {
        title: "Fiscal on every sale",
        body: "FiscalNet issues the fiscal receipt locally, on the cashier device, for every sale.",
        component: OwnerPosProof,
      },
      {
        title: "Daily close",
        body: "Z-report and sales reports show cash and card totals so owners know what happened today.",
        component: OwnerDashboardProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS.takeaways,
    competitorRows: [
      ["Product grid", "Flat, fixed-position tiles", "Varies"],
      ["Recipe / stock", "Operations plan", "Varies"],
      ["Listed price", "From €49/mo", "Often quote-only"],
      ["Browser POS", "Yes", "Often installed client"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS.takeaways,
    sections: [],
    faqs: [
      {
        question: "Does it work with FiscalNet?",
        answer: "Yes, when FiscalNet is enabled on the cashier PC. Fiscal receipts follow your configured hardware path.",
      },
      {
        question: "Can I run from a tablet at the counter?",
        answer: "Yes. franchisetech is browser-based — ideal for compact takeaway counters.",
      },
      {
        question: "Can each shift have its own till session?",
        answer: "Yes. Each shift opens and closes its own till, with cash movements and a named responsible person.",
      },
      {
        question: "Can I track what's actually selling?",
        answer: "Yes. Sales reports show top items over any date range; Operations adds cost per portion and margin.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/marketing/live/pos.png",
    ctaTitle: "Start takeaway POS — 15 days free",
    ctaSubtitle: "Fast counter, FiscalNet receipts, and Z-report in one setup.",
  },
  {
    slug: "patisserie-bakery",
    path: "/industries/patisserie-bakery",
    eyebrow: "Patisseries & bakeries",
    title: "POS for Patisseries and Bakeries",
    metaTitle: "Patisserie POS Romania — Recipe Cost, Bon Consum, FiscalNet",
    description:
      "Patisserie and bakery POS: recipe cost per croissant, bon de consum for accountants, kg and piece sales, stock and FiscalNet.",
    h1: "Know the cost of every croissant before it hits the shelf.",
    heroBefore: "Know the cost of every ",
    heroHighlight: "croissant before it hits the shelf",
    heroAfter: ".",
    heroSubheadline: "Recipe costing, consumption notes, and retail POS — for patisseries and bakeries.",
    intro:
      "Bakeries and patisseries live on thin margins per unit. You need recipe cost, production from stock, wholesale and retail on one till, and bon de consum for accounting.",
    bullets: [
      "Recipe cost per pastry and bread",
      "Can-make from current flour, butter, eggs",
      "Sell by piece or by kg on POS",
      "Bon de consum from recipe sales",
      "Stock and purchase tracking",
      "FiscalNet receipts when configured",
    ],
    painPoints: [
      {
        title: "Margin invisible per tray",
        text: "Butter and flour prices move weekly. Recipe costing shows cost per croissant or loaf before you price the vitrine.",
      },
      {
        title: "Accountant asks for bon de consum",
        text: "Ingredient consumption from recipe sales can feed bon de consum reports — less manual Excel for your contabil.",
      },
      {
        title: "Wholesale and retail same day",
        text: "Sell by piece to walk-ins and by kg to B2B from one product list — with correct TVA and fiscal records.",
      },
    ],
    featureRows: [
      {
        title: "Recipe cost per product",
        body: "Flour, butter, eggs, and packaging on each recipe. Compare cost to shelf price and see gross margin per line.",
        component: OwnerRecipeProof,
      },
      {
        title: "Production from stock",
        body: "Can-make counts show how many pieces today’s stock supports before you schedule the oven.",
        component: OwnerStockProof,
      },
      {
        title: "POS for counter and wholesale",
        body: "Fast grid for retail sales; products can be sold by unit or weight as configured on your menu.",
        component: OwnerPosProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS["patisserie-bakery"],
    competitorRows: [
      ["Recipe costing", "Built-in per portion", "SmartBill: invoicing-first"],
      ["Bon de consum", "From recipe consumption", "Not a POS focus"],
      ["POS + stock together", "One workspace", "Often separate tools"],
      ["FiscalNet POS", "When configured", "SmartBill: e-Factura focus"],
      ["Listed price", "From €79/mo Operations", "Different product category"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS["patisserie-bakery"],
    sections: [],
    faqs: [
      {
        question: "Can I cost each pastry recipe?",
        answer: "Yes. Add ingredients and quantities; franchisetech calculates cost per portion and margin vs sale price.",
      },
      {
        question: "Is bon de consum included?",
        answer: "Yes, for Romanian organisations with recipes configured — consumption from sales feeds bon de consum reports.",
      },
      {
        question: "Sell by kg and by piece?",
        answer: "Products support unit of measure on the catalogue; configure items for retail pieces or weight-based sale as needed.",
      },
      {
        question: "Works with FiscalNet?",
        answer: "Yes, when enabled on the cashier PC — same path as other food businesses.",
      },
    ],
    related: [],
    image: "/marketing/live/recipes.png",
    ctaTitle: "Start patisserie POS — 15 days free",
    ctaSubtitle: "Recipes, bon de consum, and counter sales in one place.",
  },
];
