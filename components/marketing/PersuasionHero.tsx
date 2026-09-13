import type { ReactNode } from "react";
import { marketingHeroBg, marketingHeroRadial } from "@/lib/marketing/tokens";

/**
 * Dark hero band for persuasion pages only (homepage, pricing, features,
 * compare) — see docs/adr/0001-persuasion-vs-reference-page-styling.md.
 * Reference pages (blog, help, resources) and auth pages stay on the
 * warm paper background and don't use this.
 */
export function PersuasionHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={`relative overflow-hidden ${marketingHeroBg} ${marketingHeroRadial} px-4 py-16 sm:px-6 lg:px-8`}>
      <div className="relative mx-auto max-w-3xl text-center">
        {eyebrow && (
          <p className="inline-block rounded-full border border-[#5B9CFF]/35 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#5B9CFF]">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[#FAF8F4] sm:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-[#FAF8F4]/72">{subtitle}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
