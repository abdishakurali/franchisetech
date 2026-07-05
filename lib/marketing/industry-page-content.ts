import type { SeoPage } from "@/lib/marketing/seo";
import { showcaseAssets } from "@/lib/marketing/showcase";
import {
  INDUSTRY_COMPETITOR_SLUGS,
  INDUSTRY_SHOWCASE_DEFAULTS,
} from "@/lib/marketing/industry-verticals";

const pos = showcaseAssets.posCart;
const floor = showcaseAssets.tableFloor;
const tableOrder = showcaseAssets.posTableOrder;
const dashboard = showcaseAssets.ownerDashboard;
const kitchen = showcaseAssets.kitchenDisplay;
const recipes = showcaseAssets.recipeCosting;
const zReport = showcaseAssets.zReport;
const stock = showcaseAssets.stockLevels;

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
        image: pos.src,
        imageAlt: "franchisetech POS product grid",
        path: pos.path,
      },
      {
        title: "Recipe costing for every drink",
        body: "Link milk, coffee, syrups, and packaging to menu items. See cost per portion, gross margin, and how many you can make from current stock.",
        image: recipes.src,
        imageAlt: "franchisetech recipe costing",
        path: recipes.path,
      },
      {
        title: "Z-report when you lock the door",
        body: "Opening float, cash and card totals, cash in/out, expected vs counted — daily close figures owners and accountants can trust.",
        image: zReport.src,
        imageAlt: "franchisetech Z-report",
        path: zReport.path,
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
      { label: "Recipe costing", href: "/features/recipe-costing" },
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
    title: "Restaurant POS — Floor Plan, Kitchen, Z-Report",
    metaTitle: "Restaurant POS Romania — Table Service, KDS, FiscalNet | franchisetech",
    description:
      "Restaurant POS in the browser: visual floor plan, send rounds to kitchen, recipe margins, FiscalNet, and Z-report — no dedicated POS hardware required.",
    h1: "From table order to Z-report — all in one place.",
    heroBefore: "From table order to ",
    heroHighlight: "Z-report",
    heroAfter: " — all in one place.",
    heroSubheadline: "Floor plan, kitchen display, and till close on any tablet in the restaurant.",
    intro:
      "Full-service restaurants need table workflows, kitchen coordination, ingredient control, and fiscal compliance — without enterprise contracts or fixed POS terminals.",
    bullets: [
      "Visual floor plan — pick a table, send rounds",
      "Kitchen display when enabled",
      "One fiscal receipt when the table pays",
      "Recipe margins per dish",
      "Sections: dining room, terrace, bar",
      "Browser-based — any tablet",
    ],
    painPoints: [
      {
        title: "Orders lost between floor and kitchen",
        text: "Waiters shout or scribble tickets. With table service you send rounds from the till; kitchen sees tickets on the display when enabled.",
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
        title: "Floor plan and table tabs",
        body: "Choose sala, terrace, or bar section. Tap a table, add rounds with Trimite, charge once with Încasează — fiscal receipt on final payment when FiscalNet is enabled.",
        image: floor.src,
        imageAlt: "franchisetech restaurant floor plan",
        path: floor.path,
      },
      {
        title: "Table checkout and fiscal close",
        body: "Multiple send rounds, one payment at the end. Staff see the running tab; owners see the sale linked to the table session.",
        image: tableOrder.src,
        imageAlt: "franchisetech table order POS",
        path: tableOrder.path,
      },
      {
        title: "Kitchen display",
        body: "Paid orders flow to a prep board — new, preparing, ready, done — when Kitchen Display is enabled for your organisation.",
        image: kitchen.src,
        imageAlt: "franchisetech kitchen display",
        path: kitchen.path,
      },
      {
        title: "Owner dashboard and Z-report",
        body: "Daily sales, till status, VAT breakdown, and export packs for your accountant — from the same workspace as the floor.",
        image: dashboard.src,
        imageAlt: "franchisetech owner dashboard",
        path: dashboard.path,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS.restaurants,
    competitorRows: [
      ["Runs in browser", "Yes — laptop or tablet", "Often dedicated hardware"],
      ["Table / floor plan", "Visual plan + table tabs", "Varies — may need modules"],
      ["Kitchen display", "Optional add-on", "Often bundled in enterprise"],
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
        question: "How does table service work?",
        answer: "Enable table service in Integrations. Configure your floor plan, tap a table, send rounds to kitchen, then settle and print the fiscal receipt once.",
      },
      {
        question: "Can I separate terrace and dining room?",
        answer: "Yes. Floor sections (sala, terasa, bar) keep service organised on one plan.",
      },
      {
        question: "Is there a kitchen display?",
        answer: "Yes, as an optional module. Orders appear on a browser-based board for prep teams.",
      },
      {
        question: "VAT breakdown for my accountant?",
        answer: "Sales reports and export packs include TVA by rate for Romanian organisations.",
      },
    ],
    related: [
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Kitchen display", href: "/features/kitchen-display" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/marketing/industry-restaurant.png",
    ctaTitle: "Try restaurant POS — 15 days free",
    ctaSubtitle: "Floor plan, kitchen, and till close — configured for full service.",
  },
  {
    slug: "takeaways",
    path: "/industries/takeaways",
    eyebrow: "Takeaway & fast food",
    title: "Takeaway POS — Glovo, Bolt, FiscalNet",
    metaTitle: "Takeaway POS Romania — Glovo Integration, Fast Counter | franchisetech",
    description:
      "Takeaway and fast food POS: Glovo orders in automatically, fast counter grid, separate delivery sales, FiscalNet, and daily Z-report.",
    h1: "Glovo, Bolt, and Tazz recorded correctly. No ANAF headaches.",
    heroBefore: "",
    heroHighlight: "Glovo, Bolt, and Tazz recorded correctly",
    heroAfter: ". No ANAF headaches.",
    heroSubheadline: "Delivery and counter sales in one till — separate channels, correct fiscal records.",
    intro:
      "Takeaway operators juggle counter speed, delivery platforms, and fiscal compliance. franchisetech records in-house and delivery sales separately with Glovo integrated automatically.",
    bullets: [
      "Glovo — automatic webhook import",
      "Bolt Food and Tazz — manual in POS today; auto coming",
      "Fast product grid at counter",
      "Split cash and card",
      "Stock updates as you produce",
      "Z-report for delivery vs in-house",
    ],
    painPoints: [
      {
        title: "Delivery orders re-typed at the till",
        text: "Glovo pings the tablet and someone types it again into the fiscal register. Automatic import puts orders in your workspace — ready to record correctly.",
      },
      {
        title: "Payout vs cash drawer",
        text: "Platform payouts and in-house cash are different animals. Channel-separated sales help you reconcile what you earned vs what is in the drawer.",
      },
      {
        title: "Queue speed at peak",
        text: "Lunch rush cannot wait for nested menus. A flat product grid and one-tap charge keep the line moving.",
      },
    ],
    featureRows: [
      {
        title: "Glovo integrated",
        body: "Orders from Glovo arrive via webhook — no double entry. Record them with the right payment channel for fiscal and reporting.",
        image: pos.src,
        imageAlt: "franchisetech POS takeaway",
        path: pos.path,
      },
      {
        title: "Counter speed",
        body: "Categories, search, and charge — built for high-volume takeaway and fast food service.",
        image: pos.src,
        imageAlt: "franchisetech fast checkout",
        path: pos.path,
      },
      {
        title: "Daily close by channel",
        body: "Z-report and sales reports show cash, card, and delivery totals so owners know what happened today.",
        image: dashboard.src,
        imageAlt: "franchisetech sales dashboard",
        path: dashboard.path,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS.takeaways,
    competitorRows: [
      ["Glovo auto-import", "Included in plan", "Varies — often optional module"],
      ["Bolt / Wolt auto", "Bolt/Tazz coming", "POSnet: Glovo/Bolt/Wolt auto"],
      ["Recipe / stock", "Operations plan", "Varies"],
      ["Listed price", "From €49/mo", "Often quote-only"],
      ["Browser POS", "Yes", "Often installed client"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS.takeaways,
    sections: [],
    faqs: [
      {
        question: "Is Glovo integrated automatically?",
        answer: "Yes. Glovo orders arrive via webhook when integration is configured. Bolt Food and Tazz can be recorded in POS; automatic import is on the roadmap.",
      },
      {
        question: "Are delivery sales separate from in-house?",
        answer: "Yes. Sales can be recorded per channel so reports and fiscal records stay clear.",
      },
      {
        question: "Does it work with FiscalNet?",
        answer: "Yes, when FiscalNet is enabled on the cashier PC. Fiscal receipts follow your configured hardware path.",
      },
      {
        question: "Can I run from a tablet at the counter?",
        answer: "Yes. franchisetech is browser-based — ideal for compact takeaway counters.",
      },
    ],
    related: [
      { label: "POS", href: "/features/pos" },
      { label: "Integrations", href: "/app/integrations" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/showcase/pos-cart.png",
    ctaTitle: "Start takeaway POS — 15 days free",
    ctaSubtitle: "Glovo, counter sales, and Z-report in one setup.",
  },
  {
    slug: "bar-pub",
    path: "/industries/bar-pub",
    eyebrow: "Bars & pubs",
    title: "POS for Bars and Pubs",
    metaTitle: "Bar POS Romania — Stock, TVA, Till Close | franchisetech",
    description:
      "Bar and pub POS: table spots on the floor plan, high-value drinks stock, TVA 9% vs 19%, unlimited staff, and fast till close after late service.",
    h1: "Keep tables open. At close, the till matches.",
    heroBefore: "Keep tables open. At close, ",
    heroHighlight: "the till matches",
    heroAfter: ".",
    heroSubheadline: "Bar service, drinks stock, and late-night Z-report — browser POS on any tablet.",
    intro:
      "Bars and pubs need fast pours, organised table spots, accurate drinks inventory, and a till close that works at 2am — without per-seat licensing.",
    bullets: [
      "Floor plan for bar tables and high tops",
      "Send rounds before final payment",
      "Drinks stock and purchase tracking",
      "TVA 9% and 19% on the right products",
      "Unlimited bartenders on one plan",
      "Quick Z-report after service",
    ],
    painPoints: [
      {
        title: "Busy bar, many open tables",
        text: "When service is table-based, staff pick a spot on the plan, send rounds, and charge once — instead of losing track of open orders.",
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
        title: "Table spots on the floor",
        body: "Configure bar and high-top tables on the plan. Send rounds with Trimite, settle with Încasează when the table is done — when table service is enabled.",
        image: floor.src,
        imageAlt: "franchisetech bar floor plan",
        path: floor.path,
      },
      {
        title: "Drinks stock and TVA",
        body: "Products carry the right TVA rate — 9% or 19% as configured. Stock movements follow purchases and sales when stock tracking is on.",
        image: stock.src,
        imageAlt: "franchisetech stock levels",
        path: stock.path,
      },
      {
        title: "Till close after late service",
        body: "Cash in drawer, card totals, and difference on one Z-report — so owners trust the number before they leave.",
        image: zReport.src,
        imageAlt: "franchisetech till close",
        path: zReport.path,
      },
    ],
    competitorSlug: INDUSTRY_COMPETITOR_SLUGS["bar-pub"],
    competitorRows: [
      ["Browser POS", "Tablet at the bar", "Often fixed terminals"],
      ["Table workflow", "Floor plan + tabs", "Varies"],
      ["Stock / inventory", "Operations plan", "Varies"],
      ["Staff fees", "Unlimited", "Check per-user pricing"],
      ["Listed price", "From €79/mo", "Often quote-only"],
    ],
    showcase: INDUSTRY_SHOWCASE_DEFAULTS["bar-pub"],
    sections: [],
    faqs: [
      {
        question: "Can I run tabs per table?",
        answer: "With table service enabled, each table spot can hold open rounds until you settle and print the fiscal receipt once.",
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
      { label: "Stock management", href: "/features/stock-management" },
      { label: "Z-report", href: "/features/z-report" },
    ],
    image: "/showcase/pos-cart.png",
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
        image: recipes.src,
        imageAlt: "franchisetech patisserie recipe costing",
        path: recipes.path,
      },
      {
        title: "Production from stock",
        body: "Can-make counts show how many pieces today’s stock supports before you schedule the oven.",
        image: stock.src,
        imageAlt: "franchisetech bakery stock",
        path: stock.path,
      },
      {
        title: "POS for counter and wholesale",
        body: "Fast grid for retail sales; products can be sold by unit or weight as configured on your menu.",
        image: pos.src,
        imageAlt: "franchisetech bakery POS",
        path: pos.path,
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
    related: [
      { label: "Recipe costing", href: "/features/recipe-costing" },
      { label: "Bon consum report", href: "/app/reports/consum" },
      { label: "Stock management", href: "/features/stock-management" },
    ],
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
        image: pos.src,
        imageAlt: "franchisetech food truck POS",
        path: pos.path,
      },
      {
        title: "Offline when you need it",
        body: "Short outages queue sales in the browser. Sync status shows when records are uploaded — do not clear browser data during an outage.",
        image: pos.src,
        imageAlt: "franchisetech offline POS",
        path: pos.path,
      },
      {
        title: "Z-report at end of service",
        body: "Counted cash vs expected after the last burger — same close workflow as a fixed location.",
        image: zReport.src,
        imageAlt: "franchisetech Z-report food truck",
        path: zReport.path,
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
        image: dashboard.src,
        imageAlt: "franchisetech multi-site dashboard",
        path: dashboard.path,
      },
      {
        title: "Per-site Z-report",
        body: "Each location closes its own till. Expected vs counted cash stays tied to that site — not blended in Excel.",
        image: zReport.src,
        imageAlt: "franchisetech per-site Z-report",
        path: zReport.path,
      },
      {
        title: "Compare locations",
        body: "Reports per site help you see which unit delivers better margins and cleaner closes.",
        image: dashboard.src,
        imageAlt: "franchisetech location reports",
        path: dashboard.path,
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
      { label: "Restaurants", href: "/industries/restaurants" },
      { label: "Romania", href: "/industries/romania" },
    ],
    image: "/showcase/reports-dashboard.png",
    ctaTitle: "Grow to multi-location — talk to us",
    ctaSubtitle: "Scale plan + €89/site — unlimited staff everywhere.",
  },
];
