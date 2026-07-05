import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell, CTASection } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/marketing/JsonLd";
import { findVendorCategory } from "@/lib/marketing/vendor-categories";
import { getAllPublicVendorSlugs, getCounties, getVendorBySlug } from "@/lib/vendors/queries";
import { breadcrumbSchema, seoMeta } from "@/lib/marketing/seo";
import { getMarketingLocale } from "@/lib/marketing/locale-server";

const REPORT_EMAIL = "info@franchisetech.ro";

/**
 * force-dynamic, matching the fix already applied to
 * [category]/[county]/page.tsx: new vendors get published via
 * scripts/publish-vendor-batch.mjs independent of a full site rebuild,
 * so a request for a freshly-published slug not yet in the static
 * params set is a routine occurrence here (not a rare edge case),
 * which is exactly the condition that triggers DYNAMIC_SERVER_USAGE in
 * production when generateMetadata calls getMarketingLocale()
 * (cookies()/headers()). See that file's comment for the full
 * explanation of the underlying Next.js behavior.
 */
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllPublicVendorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) return {};
  const category = findVendorCategory(vendor.category);
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const displayName = vendor.brandName || vendor.legalName;
  const categoryLabel = category ? (isRo ? category.labelRo : category.labelEn) : "";

  return seoMeta({
    locale,
    path: `/resources/suppliers/vendor/${slug}`,
    title: isRo
      ? `${displayName} — ${categoryLabel} | franchisetech`
      : `${displayName} — ${categoryLabel} | franchisetech`,
    description: vendor.description,
  });
}

export default async function VendorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const category = findVendorCategory(vendor.category);
  const locale = await getMarketingLocale();
  const isRo = locale === "ro";
  const displayName = vendor.brandName || vendor.legalName;
  const isPartner = vendor.verificationStatus === "verified_partner";

  const allCounties = await getCounties();
  const countyNames = vendor.counties
    .map((slug) => allCounties.find((c) => c.slug === slug)?.name)
    .filter((name): name is string => Boolean(name));

  const reportSubject = isRo ? `Semnalare listare furnizor: ${vendor.slug}` : `Vendor listing report: ${vendor.slug}`;
  const reportBody = isRo
    ? `Furnizor: ${vendor.legalName} (${vendor.slug})\n\nDescrie problema:\n`
    : `Vendor: ${vendor.legalName} (${vendor.slug})\n\nDescribe the issue:\n`;
  const reportMailto = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(reportSubject)}&body=${encodeURIComponent(reportBody)}`;

  return (
    <MarketingShell>
      <JsonLd
        data={breadcrumbSchema([
          { name: isRo ? "Acasă" : "Home", path: "/" },
          { name: isRo ? "Furnizori" : "Suppliers", path: "/resources/suppliers" },
          ...(category
            ? [{ name: isRo ? category.labelRo : category.labelEn, path: category.path }]
            : []),
          { name: displayName, path: `/resources/suppliers/vendor/${vendor.slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": vendor.hqCity ? "LocalBusiness" : "Organization",
          name: vendor.legalName,
          alternateName: vendor.brandName ?? undefined,
          description: vendor.description,
          url: vendor.websiteUrl,
          logo: vendor.logoUrl ?? undefined,
          address: vendor.hqCity ? { "@type": "PostalAddress", addressLocality: vendor.hqCity, addressCountry: "RO" } : undefined,
          email: vendor.contactEmail ?? undefined,
          telephone: vendor.contactPhone ?? undefined,
        }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {category ? (
            <Link
              href={category.path}
              className="text-sm font-semibold uppercase tracking-wide text-blue-600 hover:underline"
            >
              {isRo ? category.labelRo : category.labelEn}
            </Link>
          ) : null}

          <div className="mt-4 flex items-center gap-4">
            {vendor.logoUrl ? (
              <div
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1.5 ${
                  vendor.logoBackground === "dark"
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <img
                  src={vendor.logoUrl}
                  alt={`${displayName} logo`}
                  className={`h-full w-full object-contain ${
                    vendor.logoBackground === "dark" ? "text-slate-100" : ""
                  }`}
                />
              </div>
            ) : null}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{displayName}</h1>
              {vendor.brandName && vendor.brandName !== vendor.legalName ? (
                <p className="mt-1 text-sm text-slate-500">{vendor.legalName}</p>
              ) : null}
            </div>
            {isPartner ? (
              <span className="ml-auto shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {isRo ? "Partener confirmat" : "Confirmed partner"}
              </span>
            ) : null}
          </div>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">{vendor.description}</p>

          {vendor.subcategories.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {vendor.subcategories.map((sub) => (
                <span
                  key={sub}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  {sub}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 grid grid-cols-1 gap-6 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {isRo ? "Site web" : "Website"}
              </h2>
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-1 block font-semibold text-blue-600 hover:underline"
              >
                {vendor.websiteUrl.replace(/^https?:\/\//, "")}
              </a>
            </div>

            {vendor.contactEmail ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isRo ? "Email" : "Email"}
                </h2>
                <a href={`mailto:${vendor.contactEmail}`} className="mt-1 block text-slate-700 hover:underline">
                  {vendor.contactEmail}
                </a>
              </div>
            ) : null}

            {vendor.contactPhone ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isRo ? "Telefon" : "Phone"}
                </h2>
                <p className="mt-1 text-slate-700">{vendor.contactPhone}</p>
              </div>
            ) : null}

            {vendor.hqCity ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {isRo ? "Sediu" : "Headquarters"}
                </h2>
                <p className="mt-1 text-slate-700">{vendor.hqCity}</p>
              </div>
            ) : null}

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {isRo ? "Acoperire" : "Coverage"}
              </h2>
              <p className="mt-1 text-slate-700">
                {vendor.servesAllCounties
                  ? isRo
                    ? "Livrare în toată țara (afirmație autodeclarată de furnizor)"
                    : "Delivers nationwide (self-reported by the vendor)"
                  : countyNames.length
                    ? countyNames.join(", ")
                    : isRo
                      ? "Neprecizat"
                      : "Not specified"}
              </p>
            </div>

            {vendor.cui ? (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">CUI</h2>
                <p className="mt-1 text-slate-700">{vendor.cui}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm">
            <p className="text-slate-400">
              {!isPartner
                ? isRo
                  ? "Listare informativă — nu implică un parteneriat."
                  : "Directory listing — does not imply a partnership."
                : null}
              {vendor.lastChecked
                ? ` ${isRo ? "Verificat ultima dată" : "Last checked"}: ${vendor.lastChecked}`
                : null}
            </p>
            <a href={reportMailto} className="text-slate-400 hover:text-slate-600 hover:underline">
              {isRo ? "Semnalează o eroare / solicită eliminarea" : "Report an error / request removal"}
            </a>
          </div>

          {category ? (
            <Link
              href={category.path}
              className="mt-8 inline-flex items-center text-sm font-semibold text-blue-600 hover:underline"
            >
              {isRo ? `← Vezi toți furnizorii din ${category.labelRo}` : `← See all ${category.labelEn} suppliers`}
            </Link>
          ) : null}
        </div>
      </section>

      <CTASection />
    </MarketingShell>
  );
}
