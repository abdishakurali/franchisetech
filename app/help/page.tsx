import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, CTASection } from "@/components/marketing/MarketingShell";
import { HELP_CATEGORIES, HELP_ARTICLES } from "@/lib/help/articles";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Step-by-step guides for using franchisetech — POS, stock management, reports, recipe costing, and more.",
};

export default function HelpPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3">Help centre</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">How can we help?</h1>
          <p className="text-lg text-slate-500 mb-8">Step-by-step guides for every part of your business.</p>
          {/* Search hint */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              readOnly
              placeholder="Search guides… (use Ctrl+F to search this page)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-400 cursor-default shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {HELP_CATEGORIES.map((cat) => {
            const count = HELP_ARTICLES.filter((a) => a.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href={`#${cat.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm">{cat.label}</span>
                <span className="text-xs text-slate-400">{count} guide{count !== 1 ? "s" : ""}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Articles by category */}
      {HELP_CATEGORIES.map((cat) => {
        const articles = HELP_ARTICLES.filter((a) => a.category === cat.id);
        if (!articles.length) return null;
        return (
          <section key={cat.id} id={cat.id} className="max-w-6xl mx-auto px-4 pb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{cat.label}</h2>
                <p className="text-sm text-slate-500">{cat.description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/help/${article.slug}`}
                  className="group flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{article.icon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 text-sm leading-snug">{article.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{article.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-auto pt-2">
                    <span>{article.steps.length} steps</span>
                    <span className="ml-auto text-blue-500 group-hover:text-blue-700 font-medium">Read →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Still need help CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-8">
          <p className="text-2xl mb-3">💬</p>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Still need help?</h2>
          <p className="text-slate-500 mb-5 text-sm">Our team replies within one business day.</p>
          <a
            href="mailto:info@franchisetech.ro"
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Email us
          </a>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
