import type { SeoPage } from "@/lib/marketing/seo";
import { showcaseAssets } from "@/lib/marketing/showcase";
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

const floor = showcaseAssets.tableFloor;

/** Primary 7 HoReCa vertical pages with extended landing fields (EN base). */
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
    image: "/showcase/pos-grid.png",
    ctaTitle: "Start takeaway POS — 15 days free",
    ctaSubtitle: "Fast counter, FiscalNet receipts, and Z-report in one setup.",
  },
  {
    slug: "bar-pub",
    path: "/industries/bar-pub",
    eyebrow: "Bars & pubs",
    title: "POS for Bars and Pubs",
    metaTitle: "Bar POS Romania — Stock, TVA, Till Close | franchisetech",
    description:
      "Bar and pub POS: table spots on the floor plan, high-value drinks stock, TVA 21% / 11%, unlimited staff, and fast till close after late service.",
    h1: "Keep tables open. At close, the till matches.",
    heroBefore: "Keep tables open. At close, ",
    heroHighlight: "the till matches",
    heroAfter: ".",
    heroSubheadline: "Bar service, drinks stock, and late-night Z-report — browser POS on any tablet.",
    intro:
      "Bars and pubs need fast pours, organised table spots, accurate drinks inventory, and a till close that works at 2am — without per-seat licensing.",
    bullets: [
      "Fast browser POS at the bar",
      "Quick checkout during busy service",
      "Drinks stock and purchase tracking",
      "TVA 21% and 11% on the right products",
      "Unlimited bartenders on one plan",
      "Quick Z-report after service",
    ],
    painPoints: [
      {
        title: "Busy bar, fast checkout",
        text: "Staff need a simple product grid, quick payment, and a close that matches after service.",
      },
      {
        title: "Expensive bottles in stock",
        text: "Spirits and wine need accurate inventory. Purchases and stock levels help you spot shrinkage before it hurts margin.",
      },
      {
        title: "Late close, tired staff",
        text: "After the last call you need counted cash vs expected in two minutes — not a 20-minute Excel ritual.",
      },
    ],
    featureRows: [
      {
        title: "Fast bar POS",
        body: "Use a browser POS on the bar tablet or laptop. Add drinks, take payment, and keep each sale ready for daily close.",
        image: floor.src,
        imageAlt: "franchisetech bar floor plan",
        path: floor.path,
      },
      {
        title: "Drinks stock and TVA",
        body: "Products carry the right TVA rate — 21%, 11% or 5% as configured. Stock movements follow purchases and sales when stock tracking is on.",
        component: OwnerStockProof,
      },
      {
        title: "Till close after late service",
        body: "Cash in drawer, card totals, and difference on one Z-report — so owners trust the number before they leave.",
        component: OwnerZReportProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS["bar-pub"],
    competitorRows: [
      ["Browser POS", "Tablet at the bar", "Often fixed terminals"],
      ["Fast checkout", "Browser POS", "Varies"],
      ["Stock / inventory", "Operations plan", "Varies"],
      ["Staff fees", "Unlimited", "Check per-user pricing"],
      ["Listed price", "From €79/mo", "Often quote-only"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS["bar-pub"],
    sections: [],
    faqs: [
      {
        question: "Can I run fast counter sales?",
        answer: "Yes. Use the browser POS for products, payment, fiscal receipt, and daily close.",
      },
      {
        question: "Different TVA on soft drinks vs alcohol?",
        answer: "Yes. Products use configured TVA groups; FiscalNet groups map in Settings for Romanian organisations.",
      },
      {
        question: "Multiple bartenders on one till?",
        answer: "Yes. Unlimited staff with roles — each sale is tied to the logged-in user in the audit trail.",
      },
      {
        question: "Do I need a fixed POS terminal?",
        answer: "No. A browser on a tablet at the bar is enough; FiscalNet runs on the connected fiscal PC.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/showcase/pos-grid.png",
    ctaTitle: "Open the bar POS — 15 days free",
    ctaSubtitle: "Table spots, stock, and till close — no per-seat fees.",
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
    image: "/showcase/recipe-costing.png",
    ctaTitle: "Start patisserie POS — 15 days free",
    ctaSubtitle: "Recipes, bon de consum, and counter sales in one place.",
  },
  {
    slug: "food-trucks",
    path: "/industries/food-trucks",
    eyebrow: "Food trucks",
    title: "Food Truck POS — Mobile, Offline, Z-Report",
    metaTitle: "Food Truck POS Romania — Tablet, Offline Mode | franchisetech",
    description:
      "Food truck POS on tablet: sell when signal drops with offline queue, sync when back online, FiscalNet when connected, Z-report at end of day.",
    h1: "Sell anywhere. Your Z-report waits at close.",
    heroBefore: "Sell anywhere. Your ",
    heroHighlight: "Z-report waits at close",
    heroAfter: ".",
    heroSubheadline: "Browser POS on tablet — offline sales queue, sync when connection returns.",
    intro:
      "Food trucks move between markets and festivals. You need a portable till, sales that survive weak signal, and a clear end-of-day close.",
    bullets: [
      "Tablet or laptop — no fixed install",
      "Offline queue when signal drops",
      "Sync when connection returns",
      "Portable fiscal path via FiscalNet PC",
      "Simple product grid for one operator",
      "Z-report after service",
    ],
    painPoints: [
      {
        title: "Signal dies mid-festival",
        text: "Mobile data fails when the crowd arrives. Offline mode queues sales locally and syncs when you reconnect — service does not stop.",
      },
      {
        title: "One person, three jobs",
        text: "You cook, sell, and count cash. A three-screen POS in the browser beats a heavy back-office system.",
      },
      {
        title: "Different spot every day",
        text: "Same product list whether you are at the market or a street pitch — one organisation, consistent reports.",
      },
    ],
    featureRows: [
      {
        title: "POS on your tablet",
        body: "No fixed terminal. Run the till from a laptop or Android tablet in the browser.",
        component: OwnerPosProof,
      },
      {
        title: "Offline when you need it",
        body: "Short outages queue sales in the browser. Sync status shows when records are uploaded — do not clear browser data during an outage.",
        component: OwnerPosProof,
      },
      {
        title: "Z-report at end of service",
        body: "Counted cash vs expected after the last burger — same close workflow as a fixed location.",
        component: OwnerZReportProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS["food-trucks"],
    competitorRows: [
      ["Browser / tablet", "Yes — primary", "Square: strong on hardware"],
      ["Offline sales queue", "Built into POS", "Varies by product"],
      ["Food-specific stock", "Operations plan", "Square: retail-first"],
      ["FiscalNet Romania", "When configured", "Square: not Romania fiscal"],
      ["Listed monthly price", "From €49/mo", "Payment-terminal focus"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS["food-trucks"],
    sections: [],
    faqs: [
      {
        question: "Does franchisetech work offline?",
        answer: "Yes. The POS queues sales locally during short outages and syncs when the browser reconnects. Fiscal printing still depends on your FiscalNet setup when online.",
      },
      {
        question: "Do I need a laptop and a tablet?",
        answer: "One device is enough for many trucks. Some operators use a tablet at the window and a laptop for reports.",
      },
      {
        question: "Portable fiscal printer?",
        answer: "Fiscal receipts go through FiscalNet and your certified device — typically a compact fiscal printer connected to a PC on the truck.",
      },
      {
        question: "Multiple locations same week?",
        answer: "One organisation; you run the same product list. Multi-location add-on applies when you operate separate legal sites.",
      },
    ],
    related: [
      { label: "Offline POS", href: "/features/offline" },
      { label: "POS", href: "/features/pos" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/marketing/industry-food-truck.png",
    ctaTitle: "Try food truck POS — 15 days free",
    ctaSubtitle: "Tablet till, offline queue, and Z-report.",
  },
  {
    slug: "multi-site",
    path: "/industries/multi-site",
    eyebrow: "Multi-location",
    title: "Multi-Location POS for Food Businesses",
    metaTitle: "Multi-Location Restaurant POS — Central Dashboard | franchisetech",
    description:
      "Run 2–10 locations: per-site till and Z-report, owner dashboard, shared product catalog, Saga export — €89/location/mo, unlimited staff.",
    h1: "All your locations, one panel. Real numbers every night.",
    heroBefore: "All your locations, ",
    heroHighlight: "one panel",
    heroAfter: ". Real numbers every night.",
    heroSubheadline: "Per-site till close, compared sales, and accountant exports — without enterprise contracts.",
    intro:
      "Operators with two or more sites need the same discipline at each address: till matches drawer, daily Z, and visibility across locations — without per-seat fees at every site.",
    bullets: [
      "Owner dashboard across sites",
      "Per-location till and Z-report",
      "Shared product catalog and stock across all sites",
      "Staff access per location",
      "€89/month per additional site",
      "Saga export for one accountant",
    ],
    painPoints: [
      {
        title: "Spreadsheets between shops",
        text: "Each manager sends WhatsApp numbers at night. A consolidated dashboard shows sales and till status per site in one view.",
      },
      {
        title: "Second site means starting over",
        text: "Add a location without rebuilding your product model from scratch — consistent setup, per-site sessions.",
      },
      {
        title: "Accountant wants one export",
        text: "Audit CSV and Saga XML packs per site — one contabil, clear files per locație.",
      },
    ],
    featureRows: [
      {
        title: "Owner dashboard",
        body: "Today at a glance: sales, till status, and alerts — see which location needs attention first.",
        component: OwnerDashboardProof,
      },
      {
        title: "Per-site Z-report",
        body: "Each location closes its own till. Expected vs counted cash stays tied to that site — not blended in Excel.",
        component: OwnerZReportProof,
      },
      {
        title: "Compare locations",
        body: "Reports per site help you see which unit delivers better margins and cleaner closes.",
        component: OwnerDashboardProof,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS["multi-site"],
    competitorRows: [
      ["Listed multi-site price", "€89/loc/mo on Scale", "Nexus: quote-only ERP"],
      ["POS per site, shared catalog", "Operations + multi add-on", "ERP breadth, long projects"],
      ["Self-serve setup", "Hours, not months", "Often IT project"],
      ["Unlimited staff / site", "Yes", "Check per-seat"],
      ["Saga export", "Pro/Scale", "Varies"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS["multi-site"],
    sections: [],
    faqs: [
      {
        question: "How is multi-location priced?",
        answer: "€89/month per additional active location, on top of a Scale base plan. Unlimited staff at each site.",
      },
      {
        question: "One dashboard for all sites?",
        answer: "Owners switch between sites and review per-location reports from one account.",
      },
      {
        question: "Does each site need FiscalNet?",
        answer: "Each Romanian location runs FiscalNet on its cashier PC. We help per site during assisted onboarding.",
      },
      {
        question: "Can my accountant get all exports?",
        answer: "Yes. Audit CSV and Saga XML exports are available per organisation/site for your contabil.",
      },
    ],
    related: [
      { label: "Pricing", href: "/pricing" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/reports-dashboard.png",
    ctaTitle: "Grow to multi-location — talk to us",
    ctaSubtitle: "Scale plan + €89/site — unlimited staff everywhere.",
  },
];
