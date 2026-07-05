import { notFound } from "next/navigation";
import { MarketingShell, CTASection } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { VendorFilterBar } from "@/components/marketing/suppliers/VendorFilterBar";
import { VendorGrid } from "@/components/marketing/suppliers/VendorGrid";
import { VendorCategorySidebar } from "@/components/marketing/suppliers/VendorCategorySidebar";
import { VENDOR_CATEGORY_SLUGS, findVendorCategory } from "@/lib/marketing/vendor-categories";
import { getCounties, getPublicVendors } from "@/lib/vendors/queries";
import { breadcrumbSchema, seoMeta, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";

export const revalidate = 3600;

export function generateStaticParams() {
  return VENDOR_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = findVendorCategory(categorySlug);
  if (!category) return {};
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  return seoMeta({
    locale,
    path: category.path,
    title: isRo
      ? `${category.labelRo} — Furnizori HoReCa verificați | franchisetech`
      : `${category.labelEn} — Verified HoReCa suppliers | franchisetech`,
    description: isRo ? category.descriptionRo : category.descriptionEn,
  });
}

export default async function VendorCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = findVendorCategory(categorySlug);
  if (!category) notFound();

  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const [counties, vendors] = await Promise.all([
    getCounties(),
    getPublicVendors({ category: category.slug }),
  ]);

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: isRo ? "Acasă" : "Home", path: "/" },
          { name: isRo ? "Furnizori" : "Suppliers", path: "/resources/suppliers" },
          { name: isRo ? category.labelRo : category.labelEn, path: category.path },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: isRo ? category.labelRo : category.labelEn,
          url: `${SITE_URL}${category.path}`,
          description: isRo ? category.descriptionRo : category.descriptionEn,
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {isRo ? "Furnizori" : "Suppliers"}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {isRo ? category.labelRo : category.labelEn}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {isRo ? category.descriptionRo : category.descriptionEn}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <VendorCategorySidebar />
          </aside>
          <div className="space-y-8">
            <VendorFilterBar counties={counties} currentCategory={category.slug} locale={locale} />
            <VendorGrid
              vendors={vendors}
              locale={locale}
              emptyMessage={
                isRo
                  ? "Niciun furnizor listat încă în această categorie. Verificăm și adăugăm furnizori în mod continuu."
                  : "No suppliers listed yet in this category. We verify and add suppliers on an ongoing basis."
              }
            />
          </div>
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
