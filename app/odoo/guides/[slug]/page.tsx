import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { OdooGuideText, renderOdooGuideInline } from "@/components/marketing/OdooGuideText";
import { ODOO_GUIDES, getOdooGuide } from "@/lib/marketing/odoo-guides";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ODOO_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getOdooGuide(slug);
  if (!guide) return {};
  return {
    title: `${guide.title} | SALUT TECH SRL`,
    description: guide.description,
    alternates: { canonical: `/odoo/guides/${guide.slug}` },
  };
}

export default async function OdooGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getOdooGuide(slug);
  if (!guide) notFound();
  const others = ODOO_GUIDES.filter((other) => other.slug !== guide.slug);

  return (
    <ClaudeMarketingShellAuth>
      <article lang="en" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">Odoo guides · SALUT TECH SRL</p>
            <Link href="/odoo" className="shrink-0 text-sm font-medium text-[#0D0F0E] underline underline-offset-2">
              Odoo services
            </Link>
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-[#0D0F0E] sm:text-4xl">{guide.title}</h1>

          <div className="mt-8">
            <OdooGuideText body={guide.body} />
          </div>

          <p className="mt-8 border-t border-[#0D0F0E]/10 pt-5 text-sm italic leading-6 text-[#5B5D57]">
            {renderOdooGuideInline(guide.sources, "src")}
          </p>

          <p className="mt-8 rounded-lg border border-[#0D0F0E]/10 bg-white p-5 text-base leading-7">
            <Link href="/odoo#contact" className="font-semibold text-[#165DFC] underline underline-offset-2">
              {guide.closing}
            </Link>
          </p>

          <nav aria-label="More Odoo guides" className="mt-12">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#0D0F0E]">More Odoo guides</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link href={`/odoo/guides/${other.slug}`} className="font-medium text-[#0D0F0E] underline underline-offset-2">
                    {other.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </article>
    </ClaudeMarketingShellAuth>
  );
}
