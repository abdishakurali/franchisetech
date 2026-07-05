import Link from "next/link";
import type { PublicVendor } from "@/lib/vendors/queries";
import type { MarketingLocale } from "@/lib/marketing/locale";

const REPORT_EMAIL = "info@franchisetech.ro";

function reportMailto(vendor: PublicVendor, locale: MarketingLocale): string {
  const subject =
    locale === "ro"
      ? `Semnalare listare furnizor: ${vendor.slug}`
      : `Vendor listing report: ${vendor.slug}`;
  const body =
    locale === "ro"
      ? `Furnizor: ${vendor.legalName} (${vendor.slug})\n\nDescrie problema:\n`
      : `Vendor: ${vendor.legalName} (${vendor.slug})\n\nDescribe the issue:\n`;
  return `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function VendorCard({ vendor, locale }: { vendor: PublicVendor; locale: MarketingLocale }) {
  const displayName = vendor.brandName || vendor.legalName;
  const isPartner = vendor.verificationStatus === "verified_partner";

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-md">
      {/* Main clickable area → vendor detail page. Kept as its own Link
          (not wrapping the whole card) so the "Visit website"/"Report an
          error" links below can remain separate, valid, non-nested links. */}
      <Link href={`/resources/suppliers/vendor/${vendor.slug}`} className="group flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {vendor.logoUrl ? (
              // Plain <img>, not next/image — logos are re-hosted on Supabase
              // Storage, a domain not (yet) allowlisted in next.config.
              // logoBackground: some logos are white-on-transparent, designed
              // for a dark navbar, and render invisibly on a white card —
              // logoBackground: 'dark' gives those a dark container instead.
              <div
                className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border p-1 ${
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
            <h3 className="text-base font-semibold text-slate-950 group-hover:text-blue-700 group-hover:underline">
              {displayName}
            </h3>
          </div>
          {isPartner ? (
            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {locale === "ro" ? "Partener confirmat" : "Confirmed partner"}
            </span>
          ) : null}
        </div>

        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{vendor.description}</p>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <a
          href={vendor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="font-semibold text-blue-600 hover:underline"
        >
          {locale === "ro" ? "Vizitează site-ul" : "Visit website"}
        </a>
        {vendor.hqCity ? <span className="text-slate-400">{vendor.hqCity}</span> : null}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        {!isPartner ? (
          <span className="text-slate-400">
            {locale === "ro" ? "Listare informativă" : "Directory listing"}
          </span>
        ) : (
          <span />
        )}
        <a
          href={reportMailto(vendor, locale)}
          className="text-slate-400 hover:text-slate-600 hover:underline"
        >
          {locale === "ro" ? "Semnalează o eroare" : "Report an error"}
        </a>
      </div>
    </div>
  );
}
