import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { comparisonPages, findPage, SITE_URL } from "@/lib/marketing/seo";

const rows = [
  ["POS", "Simple food-business POS register", "Available depending on product setup"],
  ["Payments/hardware", "Records payment method; integrations planned", "May be stronger if payment hardware is the main need"],
  ["Stock", "Products, ingredients, low stock, can-make", "Varies by provider and plan"],
  ["Recipes/costing", "Recipe cost, margin, can-make", "Varies by provider and plan"],
  ["Purchases/suppliers", "Supplier and purchase records", "Varies by provider and plan"],
  ["Food safety", "Record-keeping support, no compliance certification claim", "Varies by provider"],
  ["Reports", "Z-report, sales, VAT-ready records, audit export", "Varies by provider and plan"],
  ["Best fit", "Small food businesses wanting POS plus operating records", "Businesses prioritising that provider’s ecosystem"],
];

export function generateStaticParams() {
  return comparisonPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(comparisonPages, (await params).slug);
  if (!page) return {};
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: { canonical: page.path },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const page = findPage(comparisonPages, (await params).slug);
  if (!page) notFound();

  return (
    <MarketingShell>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Compare", item: `${SITE_URL}/compare/${page.slug}` },
        { "@type": "ListItem", position: 2, name: `franchisetech vs ${page.competitor}`, item: `${SITE_URL}${page.path}` },
      ] }} />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Comparison</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">franchisetech vs {page.competitor} for small food businesses</h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">{page.intro}</p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">{page.betterFor}</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link><Link href="/pricing" className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">View pricing</Link></div>
        </div>
      </section>
      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-3 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950"><span>Area</span><span>franchisetech</span><span>{page.competitor}</span></div>
          {rows.map((row) => <div key={row[0]} className="grid grid-cols-3 gap-3 border-t border-slate-100 px-4 py-4 text-sm"><strong>{row[0]}</strong><span className="text-slate-600">{row[1]}</span><span className="text-slate-600">{row[2]}</span></div>)}
        </div>
        <p className="mx-auto mt-5 max-w-6xl text-xs text-slate-500">Information may change. Check each provider’s current pricing and features before making a buying decision.</p>
      </section>
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap gap-4 text-sm font-medium">
          <Link href="/features/pos" className="text-blue-600 hover:underline">POS feature <ArrowRight className="inline h-4 w-4" /></Link>
          <Link href="/features/stock-management" className="text-blue-600 hover:underline">Stock management <ArrowRight className="inline h-4 w-4" /></Link>
          <Link href="/features/recipe-costing" className="text-blue-600 hover:underline">Recipe costing <ArrowRight className="inline h-4 w-4" /></Link>
        </div>
      </section>
      <CTASection />
    </MarketingShell>
  );
}
