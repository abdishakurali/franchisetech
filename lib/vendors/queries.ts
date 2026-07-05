import { createPublicClient } from "@/lib/supabase/server";
import type { VendorCategorySlug } from "@/lib/marketing/vendor-categories";

/**
 * Public, server-side data access for the HoReCa vendor directory.
 * Deliberately uses the anon-key client (createPublicClient — no cookie
 * plumbing, safe in generateStaticParams/sitemap contexts with no HTTP
 * request), not the service-role client — public pages read through the
 * real RLS policy (vendors_public_select) rather than bypassing it, so
 * this code path itself proves the policy is correct.
 */

export type VendorVerificationStatus = "listed" | "verified_partner";
export type VendorLogoBackground = "light" | "dark";

export type PublicVendor = {
  id: string;
  legalName: string;
  brandName: string | null;
  slug: string;
  cui: string | null;
  category: VendorCategorySlug;
  subcategories: string[];
  description: string;
  websiteUrl: string;
  hqCity: string | null;
  logoUrl: string | null;
  /** Card container background the logo needs to render against (most are 'light'). See migration 20260704140000. */
  logoBackground: VendorLogoBackground;
  contactEmail: string | null;
  contactPhone: string | null;
  verificationStatus: VendorVerificationStatus;
  counties: string[];
  /** Self-reported "delivers nationally" claim — distinct from verified `counties`. See migration 20260704130000. */
  servesAllCounties: boolean;
  lastChecked: string | null;
};

export type County = { slug: string; name: string };

/** Category×county combinations only get their own SEO landing page above this threshold. */
export const MIN_VENDORS_FOR_COUNTY_PAGE = 3;

type VendorRow = {
  id: string;
  legal_name: string;
  brand_name: string | null;
  slug: string;
  cui: string | null;
  category: VendorCategorySlug;
  subcategories: string[] | null;
  description: string;
  website_url: string;
  hq_city: string | null;
  logo_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  verification_status: VendorVerificationStatus;
  serves_all_counties: boolean;
  logo_background: VendorLogoBackground;
  last_checked: string | null;
  vendor_regions: Array<{ county_slug: string }> | null;
};

function mapVendorRow(row: VendorRow): PublicVendor {
  return {
    id: row.id,
    legalName: row.legal_name,
    brandName: row.brand_name,
    slug: row.slug,
    cui: row.cui,
    category: row.category,
    subcategories: row.subcategories ?? [],
    description: row.description,
    websiteUrl: row.website_url,
    hqCity: row.hq_city,
    logoUrl: row.logo_url,
    logoBackground: row.logo_background,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    verificationStatus: row.verification_status,
    counties: (row.vendor_regions ?? []).map((r) => r.county_slug),
    servesAllCounties: row.serves_all_counties,
    lastChecked: row.last_checked,
  };
}

const VENDOR_SELECT =
  "id, legal_name, brand_name, slug, cui, category, subcategories, description, website_url, hq_city, logo_url, logo_background, contact_email, contact_phone, verification_status, serves_all_counties, last_checked, vendor_regions(county_slug)";

export async function getPublicVendors(
  opts: { category?: VendorCategorySlug; county?: string } = {},
): Promise<PublicVendor[]> {
  const supabase = createPublicClient();
  let query = supabase.from("vendors").select(VENDOR_SELECT).order("legal_name", { ascending: true });
  if (opts.category) query = query.eq("category", opts.category);

  const { data, error } = await query;
  if (error || !data) return [];

  let vendors = (data as unknown as VendorRow[]).map(mapVendorRow);
  if (opts.county) {
    // A vendor with servesAllCounties matches any county filter, regardless
    // of what (if anything) is in vendor_regions — see migration
    // 20260704130000 for why this is a distinct, self-reported flag rather
    // than 42 unverified rows in the verified-coverage join table.
    vendors = vendors.filter((v) => v.servesAllCounties || v.counties.includes(opts.county as string));
  }
  return vendors;
}

export async function getVendorBySlug(slug: string): Promise<PublicVendor | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("vendors").select(VENDOR_SELECT).eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapVendorRow(data as unknown as VendorRow);
}

/** All publicly visible vendor slugs — used by generateStaticParams and the sitemap for vendor detail pages. */
export async function getAllPublicVendorSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("vendors").select("slug");
  if (error || !data) return [];
  return (data as Array<{ slug: string }>).map((row) => row.slug);
}

/** Vendor count per category, for the hub page's category grid. */
export async function getVendorCategoryCounts(): Promise<Partial<Record<VendorCategorySlug, number>>> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("vendors").select("category");
  if (error || !data) return {};
  const counts: Partial<Record<VendorCategorySlug, number>> = {};
  for (const row of data as Array<{ category: VendorCategorySlug }>) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return counts;
}

export async function getCounties(): Promise<County[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("ro_counties").select("slug, name").order("name");
  if (error || !data) return [];
  return data as County[];
}

/**
 * Category×county combinations that qualify for their own SEO landing
 * page (>= MIN_VENDORS_FOR_COUNTY_PAGE). Shared by generateStaticParams
 * (app/resources/suppliers/[category]/[county]/page.tsx) and the sitemap
 * (lib/marketing/vendor-sitemap.ts) so the two can never drift apart.
 */
export async function getQualifyingCategoryCounties(): Promise<
  Array<{ category: VendorCategorySlug; county: string; count: number }>
> {
  const vendors = await getPublicVendors();
  const counts = new Map<string, number>();
  for (const vendor of vendors) {
    // Deliberately uses vendor.counties (real, verified vendor_regions
    // rows) ONLY — never servesAllCounties — for deciding whether a page
    // is justified. A county page must earn its existence from actual
    // county-specific coverage; if servesAllCounties vendors counted
    // toward this threshold too, a handful of self-reported "national"
    // vendors could uniformly push many categories over the line in all
    // 42 counties, mass-producing pages whose vendor lists are otherwise
    // identical except for the county name — exactly the thin/duplicate
    // content pattern this threshold exists to prevent. Once a page
    // qualifies this way, getPublicVendors({ county }) still includes
    // servesAllCounties vendors in what actually renders on it — they're
    // legitimate listings on a page that exists for other reasons, just
    // not sufficient to create the page on their own.
    for (const county of vendor.counties) {
      const key = `${vendor.category}::${county}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  const result: Array<{ category: VendorCategorySlug; county: string; count: number }> = [];
  for (const [key, count] of counts) {
    if (count < MIN_VENDORS_FOR_COUNTY_PAGE) continue;
    const [category, county] = key.split("::");
    result.push({ category: category as VendorCategorySlug, county, count });
  }
  return result;
}

export async function isQualifyingCategoryCounty(category: VendorCategorySlug, county: string): Promise<boolean> {
  const qualifying = await getQualifyingCategoryCounties();
  return qualifying.some((q) => q.category === category && q.county === county);
}
