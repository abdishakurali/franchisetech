import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Resources for POS, Cash Drawer Setup & Business Operations | franchisetech",
  description:
    "Practical guides and checklists for setting up POS, cash drawer workflows, receipt printers, staff permissions, daily close, and reporting with franchisetech.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources for POS, Cash Drawer Setup & Business Operations | franchisetech",
    description:
      "Practical guides and checklists for cafés, restaurants, retail, and service businesses using franchisetech.",
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

type ResourceCard = {
  icon: string;
  category: string;
  title: string;
  summary: string;
  readTime: string;
  href: string;
  cta: string;
};

const GETTING_STARTED: ResourceCard[] = [
  {
    icon: "✅",
    category: "Getting started",
    title: "POS setup checklist",
    summary: "Step-by-step checklist to get your till ready — products, staff, payments, receipts, and a test sale.",
    readTime: "3 min read",
    href: "#pos-setup",
    cta: "Read checklist",
  },
  {
    icon: "🛒",
    category: "Getting started",
    title: "Product and menu setup guide",
    summary: "How to add products, create categories, set prices and VAT rates, and toggle POS availability.",
    readTime: "4 min read",
    href: "#product-setup",
    cta: "Read guide",
  },
  {
    icon: "👥",
    category: "Getting started",
    title: "Staff permissions checklist",
    summary: "Set the right roles for cashiers and managers — refunds, cash movements, settings, and audit access.",
    readTime: "2 min read",
    href: "#staff-permissions",
    cta: "Read checklist",
  },
  {
    icon: "💰",
    category: "Getting started",
    title: "Cash drawer setup guide",
    summary: "Manual mode works for everyone. Automatic opening is available for Windows + LAN printer setups.",
    readTime: "5 min read",
    href: "#cash-drawer",
    cta: "Read guide",
  },
  {
    icon: "🗓️",
    category: "Getting started",
    title: "Daily close checklist",
    summary: "What to do at end of day — count cash, review sales, check refunds, and export totals.",
    readTime: "2 min read",
    href: "#daily-close",
    cta: "Read checklist",
  },
];

const INDUSTRY_GUIDES: ResourceCard[] = [
  { icon: "☕", category: "Industry guides", title: "POS guide for cafés",            summary: "How franchisetech fits the daily rhythm of a busy café counter — orders, cash, and close-of-day.",       readTime: "5 min read", href: "#guide-cafes",        cta: "Read guide" },
  { icon: "🍽️", category: "Industry guides", title: "POS guide for restaurants",     summary: "Order flow, receipts, cash and card tracking, and end-of-day reporting for restaurant teams.",            readTime: "5 min read", href: "#guide-restaurants",  cta: "Read guide" },
  { icon: "🥡", category: "Industry guides", title: "POS guide for takeaways",       summary: "Fast order entry, discounts, refunds, and cash controls for high-volume quick-service businesses.",        readTime: "4 min read", href: "#guide-takeaways",    cta: "Read guide" },
  { icon: "🥐", category: "Industry guides", title: "POS guide for bakeries",        summary: "Sell fresh items, handle morning rushes, track best sellers, and manage opening stock each day.",          readTime: "4 min read", href: "#guide-bakeries",     cta: "Read guide" },
  { icon: "🚚", category: "Industry guides", title: "POS guide for food trucks",     summary: "Compact POS for mobile setups — works as a PWA with manual fallback and simple daily reporting.",          readTime: "4 min read", href: "#guide-foodtrucks",   cta: "Read guide" },
  { icon: "🛍️", category: "Industry guides", title: "POS guide for retail shops",   summary: "Product catalogue, discounts, receipts, staff permissions, and daily sales dashboard for retailers.",      readTime: "4 min read", href: "#guide-retail",       cta: "Read guide" },
  { icon: "✂️", category: "Industry guides", title: "POS guide for salons & barbers", summary: "Service and product sales, staff attribution, cash tracking, and customer-friendly checkout.",           readTime: "4 min read", href: "#guide-salons",       cta: "Read guide" },
  { icon: "🏢", category: "Industry guides", title: "POS guide for franchises",      summary: "Standardise menus, roles, and reporting across multiple locations with franchisetech.",                    readTime: "5 min read", href: "#guide-franchises",   cta: "Read guide" },
];

const OPS_CHECKLISTS: ResourceCard[] = [
  { icon: "🌅", category: "Operations", title: "Opening checklist",                  summary: "Start the day right — open the till, enter opening cash, check products, and brief staff.",                readTime: "2 min read", href: "#opening-checklist",  cta: "View checklist" },
  { icon: "🌙", category: "Operations", title: "Closing checklist",                  summary: "Close the till, count cash, reconcile expected vs actual, and export your daily totals.",                  readTime: "2 min read", href: "#closing-checklist",  cta: "View checklist" },
  { icon: "💵", category: "Operations", title: "Cash in / cash out checklist",       summary: "Record all cash movements during the day — float top-ups, supplier payments, and petty cash.",            readTime: "2 min read", href: "#cash-inout",         cta: "View checklist" },
  { icon: "↩️", category: "Operations", title: "Refunds and voids checklist",        summary: "How to handle refunds and voids correctly, with the right permissions and clear records.",                readTime: "3 min read", href: "#refunds-voids",      cta: "View checklist" },
  { icon: "🔄", category: "Operations", title: "Staff shift handover checklist",     summary: "What to communicate between shifts — cash on hand, open orders, issues, and notes.",                      readTime: "2 min read", href: "#shift-handover",     cta: "View checklist" },
  { icon: "📊", category: "Operations", title: "End-of-day reporting checklist",     summary: "Review daily sales, VAT totals, top products, refunds, and export your Z-report.",                        readTime: "3 min read", href: "#eod-reporting",      cta: "View checklist" },
];

const HARDWARE: ResourceCard[] = [
  { icon: "🗄️",  category: "Hardware & payments", title: "Cash drawer support overview",  summary: "Manual mode works for all setups. Automatic opening requires Windows, LAN printer, and franchisetech Connector.", readTime: "4 min read", href: "#cash-drawer",   cta: "Read guide" },
  { icon: "🖨️",  category: "Hardware & payments", title: "Receipt printer basics",        summary: "What receipt printers work with franchisetech, and how to configure them for LAN or USB connections.",            readTime: "4 min read", href: "#receipt-printer", cta: "Read guide" },
  { icon: "🌐",  category: "Hardware & payments", title: "LAN vs USB printers explained", summary: "The difference between LAN and USB receipt printers, and which setup is needed for automatic cash drawer opening.",  readTime: "3 min read", href: "#lan-vs-usb",    cta: "Read guide" },
  { icon: "🔧",  category: "Hardware & payments", title: "Manual fallback explained",     summary: "How to use franchisetech without any connected hardware — manual cash entry and drawer control.",                  readTime: "2 min read", href: "#manual-fallback", cta: "Read guide" },
  { icon: "💳",  category: "Hardware & payments", title: "Payment terminal planning",     summary: "How to plan for card payment terminals alongside franchisetech — current state and what to expect.",               readTime: "3 min read", href: "#payment-terminals", cta: "Read guide" },
  { icon: "🔍",  category: "Hardware & payments", title: "Hardware compatibility checklist", summary: "What you need for a full hardware setup — Windows PC, LAN printer, cash drawer, and port 9100.",               readTime: "3 min read", href: "#hardware",      cta: "View checklist" },
];

const GROWTH: ResourceCard[] = [
  { icon: "📈", category: "Growth & reporting", title: "Understanding your daily sales",      summary: "How to read your daily sales report, spot trends, and act on what franchisetech shows you.",               readTime: "4 min read", href: "#daily-sales",        cta: "Read guide" },
  { icon: "🏆", category: "Growth & reporting", title: "Tracking best-selling products",      summary: "Use product performance reports to identify your top sellers and adjust your menu or stock.",              readTime: "3 min read", href: "#best-sellers",       cta: "Read guide" },
  { icon: "🧑‍💼", category: "Growth & reporting", title: "Staff accountability with POS",    summary: "How staff roles, transaction records, and audit visibility create accountability across your team.",          readTime: "3 min read", href: "#staff-accountability", cta: "Read guide" },
  { icon: "🏬", category: "Growth & reporting", title: "Multi-location reporting",            summary: "How franchisetech structures reporting across multiple business locations or franchise branches.",           readTime: "4 min read", href: "#multi-location",     cta: "Read guide" },
  { icon: "🚀", category: "Growth & reporting", title: "Preparing for franchise growth",      summary: "What to standardise before expanding — menus, roles, reporting, and operational workflows.",               readTime: "5 min read", href: "#franchise-growth",   cta: "Read guide" },
];

const FAQ = [
  {
    q: "What businesses is franchisetech built for?",
    a: "franchisetech is built for cafés, restaurants, takeaways, bakeries, food trucks, retail shops, salons, barbers, and franchise operators. Any growing local business that needs a practical POS and clear daily records is a good fit.",
  },
  {
    q: "Does franchisetech support cash drawers?",
    a: "Yes. Manual cash drawer mode works for all businesses with no hardware needed — you manage cash manually and record movements through the app. Automatic drawer opening (triggered by sales) is a beta feature for verified connector setups (Windows or Android) with a LAN ESC/POS receipt printer and the franchisetech Connector.",
  },
  {
    q: "What hardware is needed for automatic cash drawer opening?",
    a: "A Windows or Android till, a LAN-connected ESC/POS receipt printer on the same network (TCP port 9100 for Windows; USB/Bluetooth/WiFi for Android), and the franchisetech Connector app installed on the till. The cash drawer connects to the receipt printer via RJ11/RJ12. iOS automatic opening is not supported — use manual mode on iOS.",
  },
  {
    q: "Does franchisetech work on tablets?",
    a: "Yes. The POS is a Progressive Web App (PWA) that works in any modern browser on tablet or desktop. Android tablet setups work well for the POS. iOS is functional but automatic hardware integration (cash drawer, receipt printer) is not supported on iOS.",
  },
  {
    q: "Is franchisetech suitable for multiple locations?",
    a: "Yes. Each location is a separate workspace with its own products, staff, till sessions, and reports. Owners can run consistent product catalogues and reporting across locations.",
  },
  {
    q: "Can I track ingredients and calculate recipe margins?",
    a: "Yes. Add ingredients as stock items, connect them to recipes, and franchisetech calculates cost per portion, gross margin percentage, and how many portions you can make from current stock.",
  },
  {
    q: "Can I import my existing products?",
    a: "Yes. Download a CSV template, fill in your products, and import them. Imports are supported for products, ingredients, suppliers, purchases, recipes, and customers.",
  },
  {
    q: "Is manual cash drawer mode available for all businesses?",
    a: "Yes. Manual mode is the default and requires no hardware. You open the drawer yourself and record cash in/out movements through the app at any time. Automatic opening is an optional add-on for supported hardware setups.",
  },
];

// ─── Reusable card component (inline) ─────────────────────────────────────────

function Card({ card }: { card: ResourceCard }) {
  return (
    <Link
      href={card.href}
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">{card.icon}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">{card.category}</span>
      </div>
      <h3 className="font-semibold text-slate-900">{card.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-slate-500">{card.summary}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">{card.readTime}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
          {card.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function SectionHeader({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mb-8 scroll-mt-24">
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
      {text}
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  return (
    <MarketingShell>
      {/* ── HERO ── */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Resources</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Resources for running a better local business
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Guides, checklists, and practical advice for cafés, restaurants, retailers, and service teams using franchisetech.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["#getting-started", "Getting started"],
              ["#industry-guides", "Industry guides"],
              ["#operations",      "Operations"],
              ["#hardware",        "Hardware & payments"],
              ["#growth",          "Growth & reporting"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SEO GUIDES (indexable articles) ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            title="POS & restaurant guides (Romania & international)"
            subtitle="Searchable guides with comparisons, checklists, and honest vendor evaluations."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { href: "/compare", title: "Compare POS software", summary: "SmartBill, Saga, RezoSoft, Square — logos and feature tables.", image: "/showcase/pos-cart.png" },
              { href: "/resources/pos-software-romania", title: "Software POS România", summary: "FiscalNet, TVA, stoc și raport Z pentru restaurante.", image: "/marketing/pos-hero.png" },
              { href: "/resources/choose-pos-romania", title: "Checklist alegere POS", summary: "Evaluare onestă în 5 pași pentru proprietari RO.", image: "/showcase/reports-dashboard.png" },
              { href: "/industries/romania", title: "POS pentru România", summary: "lei, TVA, FiscalNet, echipă nelimitată.", image: "/marketing/reports-zreport.png" },
              { href: "/compare/smartbill", title: "vs SmartBill", summary: "Facturare vs operațiuni zilnice — comparație onestă.", image: "/compare/logos/smartbill.png" },
              { href: "/help/romania-fiscalnet", title: "Ghid FiscalNet", summary: "Configurare pas cu pas pentru bonuri fiscale.", image: "/marketing/reports-zreport.png" },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="relative aspect-[16/9] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.image} alt="" className="h-full w-full object-cover object-top opacity-90 transition group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">{card.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{card.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── GETTING STARTED ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="getting-started"
            title="Getting started"
            subtitle="Everything you need to get franchisetech running for your business."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GETTING_STARTED.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── INDUSTRY GUIDES ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="industry-guides"
            title="Industry guides"
            subtitle="How franchisetech fits the daily operations of specific types of businesses."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {INDUSTRY_GUIDES.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── OPERATIONS ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="operations"
            title="Operations checklists"
            subtitle="Day-to-day checklists to keep your team and till running consistently."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {OPS_CHECKLISTS.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── HARDWARE ── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="hardware"
            title="Hardware & payments"
            subtitle="Understand your hardware options, what works, and what to expect."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HARDWARE.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ── GROWTH ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            id="growth"
            title="Growth & reporting"
            subtitle="Use franchisetech data to understand performance and plan for growth."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GROWTH.map((card) => <Card key={card.title} card={card} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          GUIDE CONTENT — anchored sections
      ══════════════════════════════════════════════════════════════════════ */}

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-20">

          {/* ── POS SETUP CHECKLIST ── */}
          <article id="pos-setup" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS setup checklist</h2>
            <p className="mt-3 text-slate-600">
              Follow this checklist when you first set up franchisetech to make sure your till is ready for real use.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Add your business name and details in Settings",
                "Add your product categories (e.g. Coffee, Food, Drinks)",
                "Add at least a few products with prices and VAT rates",
                "Set each product as available in POS if you want it to appear on the till",
                "Add staff users and assign roles (cashier or manager)",
                "Set up payment methods (Cash, Card, and any custom types you use)",
                "Configure VAT rates if you sell items at different rates",
                "Set up receipt preferences if you use a receipt printer",
                "Choose your cash drawer mode — manual (default) or automatic if hardware is connected",
                "Run a test sale and process a test refund to confirm everything works",
                "Check reports after the test sale to confirm data appears correctly",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── CASH DRAWER SETUP ── */}
          <article id="cash-drawer" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Cash drawer setup guide</h2>
            <p className="mt-3 text-slate-600">
              There are two ways to use the cash drawer with franchisetech: manual mode (available for everyone) and automatic mode (beta, requires specific hardware).
            </p>
            <h3 className="mt-6 font-semibold text-slate-900">Manual mode (all setups)</h3>
            <ul className="mt-3 space-y-2">
              {[
                "Manual mode works for all businesses with no hardware required",
                "You open and close the drawer yourself — the app tracks cash in and cash out",
                "Record each cash movement (cash in, cash out, opening float) through the POS",
                "The expected cash total is calculated automatically from your movements",
                "Simulation mode lets you test the cash workflow without a physical drawer",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
            <h3 className="mt-6 font-semibold text-slate-900">Automatic mode (beta — Windows and Android connector)</h3>
            <ul className="mt-3 space-y-2">
              {[
                "Requires: Windows PC (Windows 10 or newer) or Android till device",
                "Requires: franchisetech Connector app installed on the till device",
                "Windows: LAN ESC/POS receipt printer on the same network (TCP port 9100)",
                "Android: USB, Bluetooth, or WiFi/LAN ESC/POS receipt printer connected to the Android till",
                "The cash drawer connects to the receipt printer via an RJ11/RJ12 cable",
                "When a sale is completed, the Connector sends a drawer-open command to the printer",
                "Diagnostics inside the app help identify connection and printing issues",
                "iOS automatic drawer opening is not supported — use manual mode on iOS",
                "Always test automatic mode before using it with customers",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── DAILY CLOSE CHECKLIST ── */}
          <article id="daily-close" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Daily close checklist</h2>
            <p className="mt-3 text-slate-600">
              Run through this at the end of each trading day to close correctly and keep your records clean.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Review today's sales report — total sales, transaction count, and payment method breakdown",
                "Count the physical cash in the drawer",
                "Compare counted cash to the expected cash figure in franchisetech",
                "Record any cash movements you did not log during the day (cash out, float adjustments)",
                "Check for any refunds or voids — confirm they were authorised and recorded correctly",
                "Review staff activity if relevant — who processed transactions, refunds, or cash movements",
                "Close the till session to lock in the day's records",
                "Export or screenshot the Z-report / till closing summary for your records",
                "Note any stock issues or product changes needed for tomorrow",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── STAFF PERMISSIONS ── */}
          <article id="staff-permissions" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Getting started</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Staff permissions checklist</h2>
            <p className="mt-3 text-slate-600">
              Set the right access levels for each team member before they start using franchisetech.
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Cashier role</h3>
                <ul className="mt-3 space-y-1.5">
                  {[
                    "Access to POS register",
                    "Can process sales and receipts",
                    "Can apply pre-configured discounts",
                    "Can record customer details",
                    "Cannot access settings or financial configuration",
                  ].map((item) => <CheckItem key={item} text={item} />)}
                </ul>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-900">Manager role</h3>
                <ul className="mt-3 space-y-1.5">
                  {[
                    "All cashier access",
                    "Can process refunds and voids",
                    "Can record cash in / cash out movements",
                    "Access to reports and transaction history",
                    "Can access settings if permitted by owner",
                    "Audit log visibility",
                  ].map((item) => <CheckItem key={item} text={item} />)}
                </ul>
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              <strong>Good practice:</strong> Assign the minimum permissions needed for each role. Review permissions periodically as your team changes.
            </div>
          </article>

          {/* ── HARDWARE CHECKLIST ── */}
          <article id="hardware" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Hardware & payments</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Hardware compatibility checklist</h2>
            <p className="mt-3 text-slate-600">
              Use this checklist to confirm your hardware is ready for a full franchisetech setup with automatic cash drawer support.
            </p>
            <h3 className="mt-6 font-semibold text-slate-900">Required for automatic cash drawer</h3>
            <ul className="mt-3 space-y-2">
              {[
                "Windows 10 or newer PC or laptop at the till",
                "LAN-connected ESC/POS receipt printer (not USB-only)",
                "Printer accessible on the local network at a known IP address",
                "Printer accepts connections on TCP port 9100",
                "Cash drawer connected to the receipt printer via RJ11 cable",
                "franchisetech Connector app installed and running on the till PC",
                "Connector app configured with the correct printer IP address",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
            <h3 className="mt-6 font-semibold text-slate-900">Not supported</h3>
            <ul className="mt-3 space-y-2">
              {[
                "USB-only receipt printers (automatic opening not supported)",
                "iOS devices (automatic hardware opening not supported)",
                "Android automatic opening (not currently supported)",
                "Bluetooth printers (not currently supported for automatic opening)",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
            <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Note:</strong> All hardware setups should be tested before going live with customers. Use the simulation and diagnostics tools in Settings to verify your setup works correctly.
            </div>
          </article>

          {/* ── INDUSTRY: CAFÉS ── */}
          <article id="guide-cafes" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for cafés</h2>
            <p className="mt-3 text-slate-600">
              franchisetech fits naturally into the rhythm of a café counter — fast order entry, cash and card tracking, and a clear end-of-day close.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Set up product categories: Hot Drinks, Cold Drinks, Food, Pastries",
                "Add modifiers (e.g. milk type, size) as separate products or variants",
                "Use the fast product grid to keep popular items in easy reach",
                "Run cash and card split payments or separate them as different payment methods",
                "Use the cash drawer workflow to manage your float each day",
                "Check daily sales at close to see total revenue, best sellers, and cash balance",
                "Track ingredients (milk, coffee beans, syrups) for stock visibility and recipe costing",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: RESTAURANTS ── */}
          <article id="guide-restaurants" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for restaurants</h2>
            <p className="mt-3 text-slate-600">
              For restaurants, franchisetech handles orders, payments, receipts, and end-of-day reporting in one clear system.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Organise products by meal type: Starters, Mains, Desserts, Drinks",
                "Add customers to orders for tracking and receipt personalisation",
                "Use receipts for customer copies and kitchen communication",
                "Set cash and card as separate payment methods for accurate Z-report splits",
                "Track recipe costs for your most popular dishes to protect your margins",
                "Use the daily sales report to see covers, average spend, and best sellers",
                "Assign staff to till sessions to track individual performance",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: TAKEAWAYS ── */}
          <article id="guide-takeaways" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for takeaways</h2>
            <p className="mt-3 text-slate-600">
              Speed is everything in quick service. franchisetech keeps the checkout fast and gives you the cash controls you need.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Keep the product grid simple — group by meal type or by popular order combos",
                "Add order notes to capture kitchen instructions per transaction",
                "Use discounts for meal deals, loyalty offers, or end-of-day markdowns",
                "Record cash in/out regularly during busy periods to keep your float accurate",
                "Run refunds quickly without leaving the POS view",
                "Use the close-of-day report to review takings across cash and card",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: BAKERIES ── */}
          <article id="guide-bakeries" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for bakeries</h2>
            <p className="mt-3 text-slate-600">
              Bakeries need speed at the counter, clear best-seller data, and good stock visibility for opening each day.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Organise products by bake: Bread, Pastries, Cakes, Drinks",
                "Mark products as sold out quickly during the day when stock runs low",
                "Use product performance reports to see which items sell fastest each morning",
                "Track raw materials (flour, butter, eggs) to understand ingredient costs",
                "Build recipes for your key products to see cost per unit and gross margin",
                "Review opening stock each morning to plan production for the day",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: FOOD TRUCKS ── */}
          <article id="guide-foodtrucks" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for food trucks</h2>
            <p className="mt-3 text-slate-600">
              franchisetech runs as a PWA on any device, making it ideal for mobile setups with limited hardware.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Install franchisetech as a PWA on your phone or tablet for portable till access",
                "Use manual cash drawer mode — no printer or hardware required",
                "Keep the product list short and focused on your menu for the day",
                "Use cash in/out to record your opening float and any change movements",
                "Review your daily total at the end of each event",
                "Export transaction records for accurate accounting after each event day",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: RETAIL ── */}
          <article id="guide-retail" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for retail shops</h2>
            <p className="mt-3 text-slate-600">
              franchisetech handles the product catalogue, discounts, receipts, and daily reporting that retail shops need.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Add your full product range with categories (e.g. Clothing, Accessories, Gifts)",
                "Set sale prices, standard prices, and apply discounts at the point of sale",
                "Issue receipts for all transactions — important for refund and warranty management",
                "Use staff permissions to control who can process refunds or access reports",
                "Check the sales dashboard daily to see which product lines are performing",
                "Use the import feature to upload large product catalogues from a spreadsheet",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: SALONS ── */}
          <article id="guide-salons" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for salons & barbers</h2>
            <p className="mt-3 text-slate-600">
              Salons and barbers sell a mix of services and retail products. franchisetech handles both in one simple checkout.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Add services as products (e.g. Haircut, Colour, Blowdry) with fixed prices",
                "Add retail products (shampoo, styling products) in a separate category",
                "Attach customer names to transactions for basic appointment tracking",
                "Record which staff member completed each service for attribution",
                "Use cash and card as separate payment methods for accurate daily reconciliation",
                "Check end-of-day totals per staff member to understand individual performance",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

          {/* ── INDUSTRY: FRANCHISES ── */}
          <article id="guide-franchises" className="scroll-mt-24">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Industry guide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">POS guide for franchises & multi-location operators</h2>
            <p className="mt-3 text-slate-600">
              franchisetech supports multi-location businesses with consistent product setups, role-based staff access, and location-level reporting.
            </p>
            <ul className="mt-5 space-y-2">
              {[
                "Create a separate workspace for each location with its own products and staff",
                "Use a consistent product naming and category structure across all locations",
                "Assign manager roles at each location to local team leads",
                "Review each location's daily reports separately for performance comparison",
                "Use the same payment method setup across all locations for consistent reporting",
                "Export transaction data per location for consolidated accounting",
                "Plan product updates centrally before pushing changes to individual locations",
              ].map((item) => <CheckItem key={item} text={item} />)}
            </ul>
          </article>

        </div>
      </div>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-slate-900">Frequently asked questions</h2>
          <p className="mt-2 text-slate-500">Honest answers about how franchisetech works and what it requires.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-slate-200 bg-white p-5">
                <h3 className="font-semibold text-slate-900">{q}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTERNAL LINKS ── */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-500">Related pages:</span>
            {[
              ["/compare",                   "Compare POS"],
              ["/resources/pos-software-romania", "POS România guide"],
              ["/",                          "← Home"],
              ["/features/pos",              "POS register"],
              ["/features/stock-management", "Stock management"],
              ["/features/recipe-costing",   "Recipe costing"],
              ["/features/z-report",         "Z-report"],
              ["/pricing",                   "Pricing"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-blue-600 hover:border-blue-300 hover:underline">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Ready to simplify your daily operations?" />
    </MarketingShell>
  );
}
