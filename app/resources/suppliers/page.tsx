import { CTASection, MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { VendorFilterBar } from "@/components/marketing/suppliers/VendorFilterBar";
import { VendorGrid } from "@/components/marketing/suppliers/VendorGrid";
import { VendorCategorySidebar } from "@/components/marketing/suppliers/VendorCategorySidebar";
import { VENDOR_CATEGORIES } from "@/lib/marketing/vendor-categories";
import { getCounties, getPublicVendors } from "@/lib/vendors/queries";
import { breadcrumbSchema, seoMeta, SITE_URL } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";

export const revalidate = 3600;

export async function generateMetadata() {
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  return seoMeta({
    locale,
    path: "/resources/suppliers",
    title: isRo
      ? "Furnizori verificați HoReCa România | franchisetech"
      : "Verified HoReCa suppliers directory Romania | franchisetech",
    description: isRo
      ? "Director de furnizori pentru cafenele și restaurante din România — cafea, lactate, carne, băuturi, ambalaje și mai multe, verificați manual înainte de listare."
      : "Directory of Romanian HoReCa suppliers — coffee, dairy, meat, beverages, packaging, and more, manually verified before listing.",
  });
}

export default async function VendorDirectoryHubPage() {
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const [counties, vendors] = await Promise.all([getCounties(), getPublicVendors()]);

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: isRo ? "Acasă" : "Home", path: "/" },
          { name: isRo ? "Resurse" : "Resources", path: "/resources" },
          { name: isRo ? "Furnizori" : "Suppliers", path: "/resources/suppliers" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: isRo ? "Director furnizori HoReCa" : "HoReCa supplier directory",
          url: `${SITE_URL}/resources/suppliers`,
          description: isRo
            ? "Furnizori verificați pentru cafenele și restaurante din România, pe categorii."
            : "Verified suppliers for Romanian cafés and restaurants, by category.",
          hasPart: VENDOR_CATEGORIES.map((cat) => ({
            "@type": "WebPage",
            name: isRo ? cat.labelRo : cat.labelEn,
            url: `${SITE_URL}${cat.path}`,
          })),
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            {isRo ? "Resurse" : "Resources"}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {isRo ? "Furnizori HoReCa din România" : "HoReCa suppliers in Romania"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-slate-600">
            {isRo
              ? "Un director informativ de furnizori pentru cafenele și restaurante — cafea, lactate, carne, băuturi, ambalaje, echipamente și mai multe. Fiecare listare este verificată manual înainte de publicare; o listare nu implică un parteneriat, decât dacă este marcată explicit ca atare."
              : "An informational directory of suppliers for cafés and restaurants — coffee, dairy, meat, beverages, packaging, equipment, and more. Every listing is manually reviewed before publishing; a listing does not imply a partnership unless explicitly marked as one."}
          </p>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[220px_1fr]">
          <aside>
            <VendorCategorySidebar />
          </aside>
          <div className="space-y-8">
            <VendorFilterBar counties={counties} locale={locale} />

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
