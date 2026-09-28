import Link from "next/link";
import { comparisonPages } from "@/lib/marketing/comparisons";
import { blogPosts } from "@/lib/marketing/blog";

// Surfaces the site's proven pages (comparisons + guides that actually get
// traffic) on every marketing page, above the footer, so the homepage and
// /pricing link somewhere other than the sitemap. Keep this list in sync
// with lib/marketing/comparisons.ts and lib/marketing/blog.ts as pages are
// added or cut — a slug here that no longer exists is silently dropped
// (see the .filter(Boolean) below), not an error.
const FEATURED_COMPARISON_SLUGS = ["ebriza", "smartbill", "expressoft", "rkeeper", "boogit", "posnet"];
const FEATURED_GUIDE_SLUGS = [
  "bon-fiscal-obligatoriu-cand-si-cum",
  "cum-anulezi-un-bon-fiscal-emis-gresit",
  "ce-este-raportul-z-si-cum-il-faci",
];

export function DiscoveryLinks() {
  const comparisons = FEATURED_COMPARISON_SLUGS
    .map((slug) => comparisonPages.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const guides = FEATURED_GUIDE_SLUGS
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (!comparisons.length && !guides.length) return null;

  return (
    <section className="border-t border-border bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2">
        {comparisons.length > 0 && (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Comparații</p>
            <ul className="mt-4 space-y-2.5">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <Link href={c.path} className="text-sm font-medium text-mid hover:text-brass">
                    franchisetech vs {c.competitor} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {guides.length > 0 && (
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ghiduri</p>
            <ul className="mt-4 space-y-2.5">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/blog/${g.slug}`} className="text-sm font-medium text-mid hover:text-brass">
                    {g.title} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
