import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Industries — franchisetech",
  description: "franchisetech is a simple cloud POS and business dashboard for cafes, takeaways, small retail shops, and convenience shops.",
  alternates: { canonical: "/industries" },
};

const industries = [
  ["Cafes", "Sell drinks, snacks, and daily specials while keeping daily sales clear.", "/industries/cafes"],
  ["Takeaways", "Move fast at the counter and see sales by product, payment method, and day.", "/industries/takeaways"],
  ["Small retail", "Manage products, customers, staff, and sales without a complicated system.", "/pricing"],
  ["Convenience shops", "Keep categories, prices, staff access, and daily totals easy to check.", "/pricing"],
];

export default function IndustriesPage() {
  return (
    <MarketingShell>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Industries</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Built for local independent shops.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            franchisetech starts with the daily basics: POS, products, customers, staff, sales tracking, and reports.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {industries.map(([title, body, href]) => (
              <Link key={title} href={href} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-300">
                <CheckCircle2 className="mb-3 h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
