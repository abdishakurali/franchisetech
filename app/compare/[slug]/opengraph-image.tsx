import { compareOgContentType, compareOgSize, renderCompareOgImage } from "@/lib/marketing/og/compare-og";
import { comparisonPages, findPage } from "@/lib/marketing/seo";

export const alt = "franchisetech comparison";
export const size = compareOgSize;
export const contentType = compareOgContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPage(comparisonPages, slug);
  if (!page) {
    return renderCompareOgImage({
      title: "franchisetech comparisons",
      subtitle: "POS, stock, recipes, and till close for food businesses",
    });
  }

  return renderCompareOgImage({
    competitorSlug: slug,
    title: page.h1,
    subtitle: page.description.slice(0, 140),
  });
}
