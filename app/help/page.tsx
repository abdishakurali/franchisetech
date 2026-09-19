import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, CTASection } from "@/components/marketing/MarketingShell";
import { HELP_CATEGORIES, HELP_ARTICLES } from "@/lib/help/articles";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Step-by-step guides for using franchisetech — POS, stock management, reports, recipe costing, and more.",
};

const UI = {
  en: {
    eyebrow: "Help centre",
    h1: "How can we help?",
    sub: "Step-by-step guides for every part of your business.",
    searchPlaceholder: "Search guides… (use Ctrl+F to search this page)",
    guide: (n: number) => `${n} guide${n !== 1 ? "s" : ""}`,
    steps: (n: number) => `${n} steps`,
    read: "Read →",
    stillNeedHelp: "Still need help?",
    replyTime: "Our team replies within one business day.",
    emailUs: "Email us",
  },
  ro: {
    eyebrow: "Centru de ajutor",
    h1: "Cu ce vă putem ajuta?",
    sub: "Ghiduri pas cu pas pentru fiecare parte a afacerii dumneavoastră.",
    searchPlaceholder: "Căutați ghiduri… (folosiți Ctrl+F pentru a căuta pe pagină)",
    guide: (n: number) => `${n} ghid${n !== 1 ? "uri" : ""}`,
    steps: (n: number) => `${n} pași`,
    read: "Citește →",
    stillNeedHelp: "Aveți nevoie de ajutor?",
    replyTime: "Echipa noastră răspunde în maximum o zi lucrătoare.",
    emailUs: "Trimiteți-ne un email",
  },
} as const;

export default async function HelpPage() {
  const locale = await getMarketingLocale();
  const t = UI[locale];

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="bg-gradient-to-b from-accent to-background pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-brass font-semibold text-sm uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{t.h1}</h1>
          <p className="text-lg text-muted-foreground mb-8">{t.sub}</p>
          {/* Search hint */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              readOnly
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-muted-foreground cursor-default shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {HELP_CATEGORIES.map((cat) => {
            const count = HELP_ARTICLES.filter((a) => a.category === cat.id).length;
            const label = locale === "ro" ? cat.labelRo ?? cat.label : cat.label;
            return (
              <Link
                key={cat.id}
                href={`#${cat.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-brass/40 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-semibold text-foreground group-hover:text-brass text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">{t.guide(count)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Articles by category */}
      {HELP_CATEGORIES.map((cat) => {
        const articles = HELP_ARTICLES.filter((a) => a.category === cat.id);
        if (!articles.length) return null;
        const label = locale === "ro" ? cat.labelRo ?? cat.label : cat.label;
        const description = locale === "ro" ? cat.descriptionRo ?? cat.description : cat.description;
        return (
          <section key={cat.id} id={cat.id} className="max-w-6xl mx-auto px-4 pb-16 scroll-mt-24">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-foreground">{label}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map((article) => {
                const title = locale === "ro" ? article.titleRo ?? article.title : article.title;
                const description = locale === "ro" ? article.descriptionRo ?? article.description : article.description;
                return (
                  <Link
                    key={article.slug}
                    href={`/help/${article.slug}`}
                    className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 hover:border-brass/40 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">{article.icon}</span>
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-brass text-sm leading-snug">{title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-2">
                      <span>{t.steps(article.steps.length)}</span>
                      <span className="ml-auto text-brass group-hover:text-brass font-medium">{t.read}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Still need help CTA */}
      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <div className="rounded-2xl bg-accent border border-brass/25 p-8">
          <p className="text-2xl mb-3">💬</p>
          <h2 className="text-xl font-bold text-foreground mb-2">{t.stillNeedHelp}</h2>
          <p className="text-muted-foreground mb-5 text-sm">{t.replyTime}</p>
          <a
            href="mailto:info@franchisetech.ro"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            {t.emailUs}
          </a>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
