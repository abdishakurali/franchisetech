export type HelpStep = {
  title: string;
  body: string;
  screenshot?: string;
};

export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  steps: HelpStep[];
  relatedSlugs?: string[];
};

export type HelpCategory = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: "getting-started", label: "Getting started",    icon: "🚀", description: "Set up your account and get selling fast" },
  { id: "pos",             label: "POS & selling",      icon: "🛒", description: "Make sales, apply discounts, and take payments" },
  { id: "products",        label: "Products",           icon: "📦", description: "Add products, set prices, and manage your menu" },
  { id: "stock",           label: "Stock & purchases",  icon: "📊", description: "Track stock levels and record supplier deliveries" },
  { id: "reports",         label: "Reports",            icon: "📈", description: "Daily Z-reports, sales summaries, and VAT breakdowns" },
  { id: "recipes",         label: "Recipe costing",     icon: "🧾", description: "Link ingredients to dishes and see your margins" },
  { id: "settings",        label: "Settings",           icon: "⚙️",  description: "Manage your business, team, and billing" },
  { id: "romania",         label: "Romania & FiscalNet", icon: "🇷🇴", description: "FiscalNet fiscal receipts, TVA rates, and lei/RON setup for Romanian businesses" },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "setup-your-account",
    title: "Set up your account",
    description: "Complete the setup checklist to get your business ready to sell in minutes.",
    category: "getting-started",
    icon: "🚀",
    steps: [
      { title: "Open the Setup guide", body: "After logging in, click **Setup guide** in the left sidebar. You will see a checklist of everything needed before your first sale.", screenshot: "setup-checklist.png" },
      { title: "Add your business details", body: "Enter your business name, currency, and timezone. These appear on reports and receipts.", screenshot: "settings.png" },
      { title: "Add your first product", body: "Go to **Products → New product**. Give it a name, set the selling price, and choose a category. Click Save.", screenshot: "products-new.png" },
      { title: "Open the POS and make a test sale", body: "Click **POS** in the sidebar. Tap a product to add it to the cart, then press **Charge**. Your setup is complete.", screenshot: "pos-with-items.png" },
    ],
    relatedSlugs: ["make-a-sale", "add-a-product"],
  },
  {
    slug: "first-15-minutes-checklist",
    title: "First 15 minutes checklist",
    description: "The fastest path from signup to a working first sale.",
    category: "getting-started",
    icon: "✅",
    steps: [
      { title: "Add business details", body: "Open **Settings** and confirm the business name, country, currency, and receipt details." },
      { title: "Add your first 5 products", body: "Open **Products** and add the most common items you sell. Keep it simple: name, category, selling price, and POS visibility." },
      { title: "Check payment methods", body: "Open **Settings** and make sure Cash and Card are available. Add other methods only if you really use them." },
      { title: "Open the till", body: "Open **POS**, enter the opening cash float, and start the session." },
      { title: "Make a test sale", body: "Add one product to the cart, choose a payment method, and press **Charge**." },
      { title: "Check the daily report", body: "Open **Reports** and confirm the sale, payment method, and total are visible." },
    ],
    relatedSlugs: ["setup-your-account", "make-a-sale", "sales-report"],
  },
  {
    slug: "first-day-checklist",
    title: "First day checklist",
    description: "What to do on the first real trading day.",
    category: "getting-started",
    icon: "📅",
    steps: [
      { title: "Add main products", body: "Add the products your staff sell most often. Leave slow-moving or special items until later." },
      { title: "Create clear categories", body: "Use simple categories such as Drinks, Food, Snacks, Retail, or Services." },
      { title: "Train one staff member", body: "Show them how to open POS, add products, choose Cash or Card, and complete a sale." },
      { title: "Record real sales", body: "Use franchisetech for normal sales during the day. Do not mix test sales with real sales unless you clearly void them." },
      { title: "Compare cash/card totals", body: "At the end of the day, compare the report totals with your drawer and card terminal totals." },
      { title: "Review the report", body: "Check sales total, transaction count, payment method split, and top products." },
    ],
    relatedSlugs: ["make-a-sale", "sales-report", "reading-your-z-report"],
  },
  {
    slug: "first-week-checklist",
    title: "First week checklist",
    description: "Use the first week to clean setup and decide what matters next.",
    category: "getting-started",
    icon: "🗓️",
    steps: [
      { title: "Review top products", body: "Open **Reports** and check which products sell most often." },
      { title: "Check sales by day", body: "Look for busy and quiet days so you understand the trading pattern." },
      { title: "Clean the product list", body: "Rename unclear products, remove duplicates, and put products into the right categories." },
      { title: "Decide on stock and recipes", body: "If margins or stock control matter now, start the stock/margin checklist. If not, keep selling first." },
      { title: "Choose a plan", body: "Open **Billing** and choose Starter or Pro before the trial ends." },
    ],
    relatedSlugs: ["manage-stock-levels", "recipe-costing-intro", "manage-settings"],
  },
  {
    slug: "stock-margin-checklist",
    title: "Stock and margin checklist",
    description: "Add ingredients, suppliers, purchases, and recipes when you are ready to track cost.",
    category: "recipes",
    icon: "📊",
    steps: [
      { title: "Add ingredients", body: "Add stock items you buy, such as milk, coffee beans, chicken, packaging, or bottles." },
      { title: "Add suppliers", body: "Add the suppliers you buy from most often." },
      { title: "Record a purchase", body: "Record what arrived, quantity, unit, and cost. This updates stock and cost information." },
      { title: "Create a recipe", body: "Connect a sellable product to the ingredients used for one portion." },
      { title: "Check margin", body: "Open **Reports → Margins** to review cost, selling price, and margin." },
    ],
    relatedSlugs: ["add-an-ingredient", "record-a-purchase", "recipe-costing-intro"],
  },
  {
    slug: "owner-daily-checklist",
    title: "Owner daily checklist",
    description: "The numbers an owner should check every trading day.",
    category: "reports",
    icon: "👤",
    steps: [
      { title: "Open the dashboard", body: "Start with today’s sales, expected cash, and top products." },
      { title: "Check cash and card totals", body: "Compare franchisetech totals with the drawer and card terminal." },
      { title: "Check top products", body: "Look for best sellers and unusual gaps." },
      { title: "Review refunds or voids", body: "Check any failed, voided, or refunded items so mistakes are caught early." },
      { title: "Close the till", body: "Count cash, enter counted cash, add notes if needed, and close the session." },
    ],
    relatedSlugs: ["dashboard-overview", "sales-report", "reading-your-z-report"],
  },
  {
    slug: "staff-cashier-checklist",
    title: "Staff and cashier checklist",
    description: "A short checklist for anyone using the till.",
    category: "pos",
    icon: "🧑‍💼",
    steps: [
      { title: "Log in", body: "Use your own account so sales and actions are traceable." },
      { title: "Select products", body: "Tap the products the customer wants and check quantities before charging." },
      { title: "Apply discount only if allowed", body: "Only apply a discount when the manager or owner has approved it." },
      { title: "Take payment", body: "Choose the right payment method: Cash, Card, Online, or Other." },
      { title: "Give receipt if needed", body: "Open the receipt after sale completion if the customer asks." },
      { title: "Call a manager for refunds", body: "If a sale needs refunding or voiding, ask the manager unless you have permission." },
    ],
    relatedSlugs: ["make-a-sale", "manage-settings"],
  },
  {
    slug: "dashboard-overview",
    title: "Understanding your dashboard",
    description: "See today's revenue, top products, and next steps at a glance.",
    category: "getting-started",
    icon: "📊",
    steps: [
      { title: "View your daily summary", body: "The dashboard shows **Sales**, **Expected cash**, and **Top product** for today. Switch between Today / This week / This month using the buttons at the top right.", screenshot: "dashboard-overview.png" },
      { title: "Next best action", body: "The **Next best action** panel suggests what to do next — add products, manage stock, create a recipe — so you always know where to focus.", screenshot: "dashboard-overview.png" },
      { title: "Quick links", body: "Use the Reports shortcuts at the bottom to jump straight to Sales, Till closes, VAT, and Margins without navigating the sidebar.", screenshot: "dashboard-overview.png" },
    ],
    relatedSlugs: ["reading-your-z-report", "sales-report"],
  },
  {
    slug: "make-a-sale",
    title: "Make a sale",
    description: "Add items to the cart, apply discounts, and take payment.",
    category: "pos",
    icon: "🛒",
    steps: [
      { title: "Open the POS", body: "Click **POS** in the left sidebar. You will see your product grid on the left and the cart on the right.", screenshot: "pos-empty.png" },
      { title: "Add items to the cart", body: "Tap any product tile to add it to the cart. Tap again to increase the quantity, or use the **+** / **−** buttons next to each cart line.", screenshot: "pos-with-items.png" },
      { title: "Apply a discount (optional)", body: "Tap **Discount** below the cart total. Enter a percentage (e.g. 10%) or a fixed amount. The total updates immediately.", screenshot: "pos-with-items.png" },
      { title: "Charge the customer", body: "Press the blue **Charge €X.XX** button. Select the payment method — Cash, Card, or Other — then confirm. The sale is recorded and stock is deducted automatically.", screenshot: "pos-with-items.png" },
      { title: "Add a customer name (optional)", body: "Tap the customer field at the top of the cart and type a name or order number. Useful for table service or click-and-collect.", screenshot: "pos-with-items.png" },
    ],
    relatedSlugs: ["reading-your-z-report", "setup-your-account"],
  },
  {
    slug: "add-a-product",
    title: "Add a product",
    description: "Create a new product with a name, price, and category.",
    category: "products",
    icon: "📦",
    steps: [
      { title: "Go to Products", body: "Click **Products** in the sidebar to see your product list.", screenshot: "products-list.png" },
      { title: "Click New product", body: "Press the **New product** button at the top right.", screenshot: "products-list.png" },
      { title: "Fill in the details", body: "Enter the **Product name**, **Selling price** (inc. VAT), and choose a **Category**. Categories group products on the POS screen.", screenshot: "products-new.png" },
      { title: "Enable stock tracking (optional)", body: "Toggle **Track stock** if you want the app to deduct one unit each time this product is sold. Set an initial **Stock on hand** quantity.", screenshot: "products-new.png" },
      { title: "Save", body: "Click **Save product**. The product appears on your POS immediately.", screenshot: "products-list.png" },
    ],
    relatedSlugs: ["manage-stock-levels", "recipe-costing-intro"],
  },
  {
    slug: "add-an-ingredient",
    title: "Add an ingredient",
    description: "Track raw ingredients and their unit cost for recipe margin calculations.",
    category: "products",
    icon: "🧂",
    steps: [
      { title: "Switch to Ingredients view", body: "Go to **Products** and click the **Ingredients** filter tab at the top.", screenshot: "ingredients-list.png" },
      { title: "Click New ingredient", body: "Press **New ingredient**. Enter the name (e.g. \"Oat milk\"), unit (litre, kg, unit), and unit cost.", screenshot: "ingredients-list.png" },
      { title: "Set stock tracking", body: "Toggle **Track stock** and enter current quantity on hand. The app will deduct ingredient quantity each time a linked recipe product is sold.", screenshot: "ingredients-list.png" },
      { title: "Save", body: "Click **Save ingredient**. You can now link this ingredient to a product recipe.", screenshot: "ingredients-list.png" },
    ],
    relatedSlugs: ["recipe-costing-intro", "manage-stock-levels"],
  },
  {
    slug: "manage-stock-levels",
    title: "Manage stock levels",
    description: "View current stock, adjust quantities, and spot items running low.",
    category: "stock",
    icon: "📦",
    steps: [
      { title: "Open Stock", body: "Click **Stock levels** under the Inventory section in the sidebar.", screenshot: "stock-levels.png" },
      { title: "Read the stock table", body: "Each row shows product name, category, **On hand** quantity, **Reorder point**, unit, and cost. Rows in red are below reorder threshold.", screenshot: "stock-levels.png" },
      { title: "Update a quantity inline", body: "Click any **On hand** number to edit it directly. Type the new quantity and press **Enter** (or click ✓). Saved immediately.", screenshot: "stock-levels.png" },
      { title: "Filter by category", body: "Use the category filter at the top to focus on one group at a time — e.g. show only Ingredients.", screenshot: "stock-levels.png" },
    ],
    relatedSlugs: ["record-a-purchase", "add-a-product"],
  },
  {
    slug: "record-a-purchase",
    title: "Record a supplier purchase",
    description: "Log a delivery from a supplier to update stock and track purchasing costs.",
    category: "stock",
    icon: "🚚",
    steps: [
      { title: "Go to Purchases", body: "Click **Purchases** under Inventory in the sidebar.", screenshot: "purchases.png" },
      { title: "Click New purchase", body: "Press **New purchase**. Select the supplier, set the delivery date, and add line items.", screenshot: "purchases.png" },
      { title: "Add line items", body: "For each item delivered, select the ingredient or product, enter quantity received and unit cost. The total calculates automatically.", screenshot: "purchases.png" },
      { title: "Save the purchase", body: "Click **Save purchase**. Stock on hand is updated immediately for every item on the purchase.", screenshot: "purchases.png" },
    ],
    relatedSlugs: ["manage-stock-levels"],
  },
  {
    slug: "sales-report",
    title: "Sales report",
    description: "See gross sales, transaction count, and payment method breakdown for any date range.",
    category: "reports",
    icon: "💶",
    steps: [
      { title: "Open Sales report", body: "Go to **Reports → Sales** in the sidebar.", screenshot: "reports-sales.png" },
      { title: "Select a date range", body: "Use the date picker to choose Today, This week, This month, or a custom range.", screenshot: "reports-sales.png" },
      { title: "Read the summary", body: "The top row shows **Gross sales**, **Net sales**, **VAT collected**, and **Transactions**. Below is a breakdown by payment method.", screenshot: "reports-sales.png" },
      { title: "See top products", body: "Scroll down to see your best-selling products ranked by revenue for the period.", screenshot: "reports-sales.png" },
    ],
    relatedSlugs: ["reading-your-z-report", "vat-report"],
  },
  {
    slug: "reading-your-z-report",
    title: "Reading your Z-report",
    description: "The Z-report is your end-of-day till close summary — used to reconcile cash and verify takings.",
    category: "reports",
    icon: "🏁",
    steps: [
      { title: "Open the Z-report", body: "Go to **Reports → Till closes** in the sidebar.", screenshot: "reports-zreport.png" },
      { title: "Select the date", body: "Use the date picker to choose any trading day. Each till close for that day is listed.", screenshot: "reports-zreport.png" },
      { title: "Check the totals", body: "The report shows **Total sales**, **Cash sales**, **Card sales**, **Refunds**, and **Net**. Compare Cash on hand against your physical cash to spot discrepancies.", screenshot: "reports-zreport.png" },
      { title: "Print or export", body: "Press **Print** (or save as PDF) to keep a copy for your records. Often required for VAT filing.", screenshot: "reports-zreport.png" },
    ],
    relatedSlugs: ["sales-report", "vat-report"],
  },
  {
    slug: "vat-report",
    title: "VAT report",
    description: "Net, VAT, and gross figures broken down by rate — ready for your accountant.",
    category: "reports",
    icon: "🧾",
    steps: [
      { title: "Open the VAT report", body: "Go to **Reports → VAT** in the sidebar.", screenshot: "reports-vat.png" },
      { title: "Select your filing period", body: "Choose the date range that matches your VAT period (bi-monthly in Ireland).", screenshot: "reports-vat.png" },
      { title: "Read the breakdown", body: "The report shows **Net**, **VAT**, and **Gross** for each rate (0%, 9%, 13.5%, 23%). The totals row is what you report to Revenue.", screenshot: "reports-vat.png" },
      { title: "Share with your accountant", body: "Export as CSV or print. Your accountant needs the Net and VAT columns to complete your VAT return.", screenshot: "reports-vat.png" },
    ],
    relatedSlugs: ["sales-report", "reading-your-z-report"],
  },
  {
    slug: "recipe-costing-intro",
    title: "Set up recipe costing",
    description: "Link ingredients to a product to calculate cost, margin, and how many you can make.",
    category: "recipes",
    icon: "🧾",
    steps: [
      { title: "Add your ingredients first", body: "Before creating a recipe, make sure each ingredient exists in **Products → Ingredients** with a unit cost set.", screenshot: "ingredients-list.png" },
      { title: "Open the product to add a recipe to", body: "Go to **Products**, find the product (e.g. \"Flat White\"), and click it to open the edit view.", screenshot: "products-list.png" },
      { title: "Add recipe lines", body: "In the **Recipe** section, click **Add ingredient**. Select the ingredient and enter the quantity used per serving.", screenshot: "ingredients-list.png" },
      { title: "Read the margin summary", body: "The recipe panel shows **Cost per portion**, **Margin %**, and **Portions available** based on current stock. Adjust price or reduce waste to improve margins.", screenshot: "reports-margins.png" },
    ],
    relatedSlugs: ["add-an-ingredient", "manage-stock-levels"],
  },
  {
    slug: "romania-fiscalnet-setup",
    title: "Romania setup: FiscalNet, TVA, and fiscal receipts",
    description: "Configure franchisetech for Romanian organisations — FiscalNet fiscal receipts, TVA rates, lei/RON, and owner checklist before go-live.",
    category: "romania",
    icon: "🇷🇴",
    steps: [
      {
        title: "Who this guide is for",
        body: "This guide is for business owners operating in Romania who want to issue fiscal receipts through FiscalNet via franchisetech. You will need a FiscalNet provider (fiscal printer or cloud fiscal service) and your accountant's sign-off before going live.",
      },
      {
        title: "Enable Romania settings in your account",
        body: "Go to **Settings → Business**. Set your **Currency** to RON (lei) and your **Country** to Romania. This unlocks Romanian TVA rates and the FiscalNet configuration section.",
        screenshot: "settings.png",
      },
      {
        title: "Set your TVA rates on products",
        body: "Romanian TVA rates — 19% (standard), 9% (food/hospitality), 5% (reduced), and 0% (exempt) — are pre-loaded. Go to **Products**, edit each product, and assign the correct TVA rate. Your accountant can confirm which rate applies to each product type.",
        screenshot: "products-new.png",
      },
      {
        title: "Configure FiscalNet",
        body: "Go to **Settings → FiscalNet**. Enter your FiscalNet provider credentials (CIF, serial number, and API token) supplied by your fiscal printer or cloud fiscal service provider. Do not use live credentials for test transactions.",
        screenshot: "settings.png",
      },
      {
        title: "Map payment types to FiscalNet codes",
        body: "FiscalNet requires a payment type code for every transaction. Payment types mapped for FiscalNet (codes 1–8): **1 = cash, 2 = card, 3 = credit, 4 = tichete masă, 5 = tichete valorice, 6 = voucher, 7 = plată modernă**. Review the mapping in **Settings → FiscalNet → Payment mapping** and adjust if your provider requires a different mapping.",
        screenshot: "settings.png",
      },
      {
        title: "Test with your fiscal provider before go-live",
        body: "Use the **Test fiscal receipt** button in **Settings → FiscalNet** to send a test transaction to your fiscal provider. Confirm the test receipt prints or is logged correctly. Do not go live until your provider and accountant have verified the setup.",
      },
      {
        title: "Owner checklist before go-live",
        body: "Before taking your first real fiscal sale:\n\n✅ FiscalNet credentials entered and verified\n✅ All products assigned the correct TVA rate\n✅ Payment type mapping reviewed\n✅ Test receipt confirmed with your fiscal provider\n✅ Accountant has reviewed the configuration\n✅ Backup cash/card process agreed in case of FiscalNet downtime",
      },
      {
        title: "Daily reconciliation with the Z-report",
        body: "At the end of each trading day, go to **Reports → Till closes** and run the Z-report. This shows daily totals by payment method and TVA rate. Keep a copy for your records — your accountant or fiscal advisor may need it for periodic filings.",
        screenshot: "reports-zreport.png",
      },
      {
        title: "What franchisetech does not do",
        body: "franchisetech supports the fiscal receipt workflow through FiscalNet. It does not replace advice from a Romanian accountant, tax advisor, or fiscal printer provider. Businesses remain responsible for their own legal, fiscal, and accountant review. If in doubt about compliance, consult a qualified Romanian accountant.",
      },
    ],
    relatedSlugs: ["reading-your-z-report", "vat-report", "manage-settings"],
  },
  {
    slug: "manage-settings",
    title: "Manage your settings",
    description: "Update your business name, invite team members, and manage your subscription.",
    category: "settings",
    icon: "⚙️",
    steps: [
      { title: "Open Settings", body: "Click **Settings** at the bottom of the sidebar.", screenshot: "settings.png" },
      { title: "Update business details", body: "Change your business name, contact email, or VAT number in the **Business** section. Press **Save** to apply.", screenshot: "settings.png" },
      { title: "Invite a team member", body: "Go to the **Team** tab. Enter an email and assign the **Staff** role (POS only) or **Manager** role (full access).", screenshot: "settings.png" },
      { title: "Manage your subscription", body: "The **Billing** tab shows your current plan, renewal date, and a link to update payment method or cancel.", screenshot: "settings.png" },
    ],
    relatedSlugs: ["setup-your-account"],
  },
];

export function getArticlesByCategory(categoryId: string): HelpArticle[] {
  return HELP_ARTICLES.filter((a) => a.category === categoryId);
}

export function getArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
