import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { HELP_ARTICLES, HELP_CATEGORIES, getArticle, getArticlesByCategory } from "@/lib/help/articles";
import { ChevronRight, ArrowLeft, CheckCircle2 } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return HELP_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

function renderBody(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
}

export default async function HelpArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = HELP_CATEGORIES.find((c) => c.id === article.category);
  const related = (article.relatedSlugs ?? [])
    .map((s) => HELP_ARTICLES.find((a) => a.slug === s))
    .filter(Boolean);
  const morInCat = getArticlesByCategory(article.category).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <MarketingShell>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-8">
          <Link href="/help" className="hover:text-blue-600 transition-colors">Help centre</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/help#${article.category}`} className="hover:text-blue-600 transition-colors">
            {category?.label}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600">{article.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <p className="text-3xl mb-3">{article.icon}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{article.title}</h1>
          <p className="text-lg text-slate-500">{article.description}</p>
          <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
            <span className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium">{category?.label}</span>
            <span>{article.steps.length} steps</span>
          </div>
        </header>

        {/* Steps */}
        <ol className="space-y-10">
          {article.steps.map((step, idx) => (
            <li key={idx} className="relative">
              {/* Step number connector line */}
              {idx < article.steps.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-px bg-slate-100" />
              )}
              <div className="flex gap-4">
                <div className="flex-shrink-0 flex items-start justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm z-10">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 pb-2">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2 mt-1.5">{step.title}</h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{renderBody(step.body)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* Done banner */}
        <div className="mt-12 rounded-xl bg-green-50 border border-green-100 p-5 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">You are all set!</p>
            <p className="text-xs text-green-700 mt-0.5">Still stuck? Use the chat widget in the bottom-right corner — our team replies within one business day.</p>
          </div>
        </div>

        {/* Related articles */}
        {(related.length > 0 || morInCat.length > 0) && (
          <section className="mt-14 border-t border-slate-100 pt-10">
            <h2 className="text-lg font-bold text-slate-800 mb-5">Related guides</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[...related, ...morInCat].slice(0, 4).map((a) => (
                <Link
                  key={a!.slug}
                  href={`/help/${a!.slug}`}
                  className="group flex items-start gap-3 rounded-lg border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <span className="text-xl">{a!.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">{a!.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{a!.steps.length} steps</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10">
          <Link href="/help" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Help centre
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
