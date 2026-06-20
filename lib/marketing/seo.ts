import type { Metadata } from "next";
import { createElement } from "react";
import type { MarketingLocale } from "@/lib/marketing/locale";
import { marketingOpenGraphLocale } from "@/lib/marketing/locale";
import { localeAlternates, marketingKeywords } from "@/lib/marketing/site-locale";
import { blogPosts } from "@/lib/marketing/blog/posts";

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
    slug: "food-safety-records",
    path: "/features/food-safety-records",
    eyebrow: "Food safety records",
    title: "Food Safety Records for Food Businesses",
    metaTitle: "Food Safety Records App — Temperature Logs, Checks & Corrective Actions",
    description: "franchisetech supports food-safety record keeping with checks, failed-check actions, reminders, and reports.",
    h1: "Food-safety records for small food businesses",
    intro: "franchisetech can support record keeping for temperature checks, failed checks, corrective actions, reminders, and reports.",
    bullets: ["Record checks", "Track failed checks", "Corrective actions", "Reminders and reports"],
    sections: [
      { title: "Keep records in one workspace", body: "Food-safety records can sit beside POS, stock, suppliers, and products so owners are not switching between notebooks and spreadsheets." },
      { title: "Follow up failed checks", body: "When a check needs action, franchisetech can help record what was done and when." },
      { title: "Legal-safe support", body: "franchisetech supports record keeping. It does not replace professional food-safety advice or the operator’s legal responsibilities." },
    ],
    faqs: [
      { question: "Does franchisetech certify food-safety compliance?", answer: "No. franchisetech helps keep organised records and does not claim certified compliance." },
      { question: "Can I log temperature checks?", answer: "Yes. The food-safety module can support checks, follow-ups, reminders, and reports." },
      { question: "Can I add this later?", answer: "Yes. Food-safety records can be used alongside POS and stock when the business is ready." },
    ],
    related: [{ label: "Food trucks", href: "/industries/food-trucks" }, { label: "Stock management", href: "/features/stock-management" }, { label: "Legal disclaimer", href: "/legal-disclaimer" }],
    image: "/marketing/sc-reports.png",
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
    slug: "setup-onboarding",
    path: "/features/setup-onboarding",
    eyebrow: "Setup guide",
    title: "Guided Setup for New Businesses",
    metaTitle: "Guided Setup — Products, Till, First Sale, Reports",
    description: "A built-in setup guide walks new owners through products, payment methods, opening the till, first sale, and reports.",
    h1: "Get live faster with a step-by-step setup guide",
    intro: "The in-app setup guide tracks progress from business details through first sale so new teams are not guessing what to configure next.",
    bullets: ["Business, currency, and receipt settings", "Products and payment methods", "Open till and first test sale", "Review daily reports"],
    sections: [
      { title: "Clear milestones", body: "Each step links to the right screen — settings, POS, or reports — so setup stays focused." },
      { title: "Assisted trial support", body: "The 15-day trial includes help setting up products, staff, and a first sale walkthrough." },
      { title: "Owner visibility", body: "Progress is visible in the dashboard so managers know what is still outstanding." },
    ],
    faqs: [
      { question: "How long does setup take?", answer: "Many cafes complete core setup in one session — products, till, and a test sale." },
      { question: "Can I skip steps?", answer: "Yes. The guide is a checklist, not a blocker. You can return to any step later." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Pricing", href: "/pricing" }],
    image: "/showcase/setup-guide.png",
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
    bullets: ["Simple register for service", "Cash/card and daily close", "Products, recipes, and stock", "Food-safety record support", "Browser-based — works on mobile devices"],
    sections: [
      { title: "Pain points", body: "Mobile service has limited time and space. Owners need simple tools that keep records organised without slowing the queue." },
      { title: "How franchisetech helps", body: "franchisetech brings POS, products, stock, recipes, suppliers, and reports into one browser-based workspace." },
      { title: "Suggested setup", body: "Create best-selling products, set up cash/card payment methods, add recipe ingredients, and review stock before service." },
    ],
    faqs: [
      { question: "Does franchisetech work offline?", answer: "franchisetech is a cloud web app and should be treated as requiring internet access." },
      { question: "Can it support food-safety records?", answer: "Yes. It can support record keeping, without replacing professional food-safety advice." },
      { question: "Can I see end-of-day cash?", answer: "Yes. The till close and Z-report help review expected cash and differences." },
    ],
    related: [{ label: "POS", href: "/features/pos" }, { label: "Food-safety records", href: "/features/food-safety-records" }, { label: "Cash-up guide", href: "/resources/cash-up-at-end-of-day" }],
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
      { label: "Food-safety records", href: "/features/food-safety-records" },
      { label: "Z-report and till closing", href: "/features/z-report" },
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

export type ComparisonPage = {
  slug: string;
  path: string;
  competitor: string;
  metaTitle: string;
  description: string;
  intro: string;
  betterFor: string;
};

export const comparisonPages: ComparisonPage[] = [
  {
    slug: "square",
    path: "/compare/square",
    competitor: "Square",
    metaTitle: "franchisetech vs Square for Small Food Businesses",
    description: "A fair comparison of franchisetech and Square for small food businesses that need POS, stock, purchases, recipes, and records.",
    intro: "Square is strong for payments and POS. franchisetech focuses on business control around products, stock, suppliers, purchases, recipe costing, Z-reports, and food-safety records.",
    betterFor: "Square may be better if you need integrated payment hardware immediately. franchisetech may fit if you want a simple POS with stock, purchases, recipes, and food-business records in one place.",
  },
  {
    slug: "sumup",
    path: "/compare/sumup",
    competitor: "SumUp",
    metaTitle: "franchisetech vs SumUp for Small Food Businesses",
    description: "Compare franchisetech and SumUp for cafes, takeaways, restaurants, and food trucks that need simple POS and business records.",
    intro: "SumUp is widely known for card payment tools. franchisetech focuses on the daily operating layer around POS, stock, purchases, suppliers, recipes, and reports.",
    betterFor: "SumUp may be better if your priority is payment acceptance hardware. franchisetech may fit if your priority is connecting sales records with stock, recipes, and daily cash-up.",
  },
  {
    slug: "lightspeed",
    path: "/compare/lightspeed",
    competitor: "Lightspeed",
    metaTitle: "franchisetech vs Lightspeed for Small Food Businesses",
    description: "Compare franchisetech and Lightspeed for food businesses that want POS, stock, suppliers, purchases, recipe costing, and records.",
    intro: "Lightspeed offers broad retail and hospitality tools. franchisetech is positioned for small food businesses that want a simpler operating system around the till.",
    betterFor: "Lightspeed may be better if you need a larger established platform with advanced integrations. franchisetech may fit if you want a focused POS and food-business control workspace.",
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
];

export const publicPaths = [
  "/",
  "/pricing",
  "/features",
  ...featurePages.map((p) => p.path),
  ...industryPages.map((p) => p.path),
  ...comparisonPages.map((p) => p.path),
  "/resources",
  ...resourcePages.map((p) => p.path),
  "/privacy",
  "/terms",
  "/blog",
  ...blogPosts.map((p) => `/blog/${p.slug}`),
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
