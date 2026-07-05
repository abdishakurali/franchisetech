export const marketingPrimary = "#2563eb";

export const marketingSectionY = "py-20 sm:py-28";

export const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/industries", label: "Industries" },
  { href: "/resources/suppliers", label: "Suppliers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/resources", label: "Resources" },
] as const;

/** Shared marketing typography + surfaces */
export const marketingEyebrow =
  "text-xs font-semibold uppercase tracking-[0.2em] text-blue-600";
export const marketingHeading =
  "text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem]";
export const marketingSubtext = "text-base leading-relaxed text-slate-600 sm:text-lg";
export const marketingCard =
  "rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-200";

/** Hero — white base with blue/indigo bloom behind copy */
export const marketingHeroBg = "bg-white";
export const marketingHeroRadial =
  "bg-[radial-gradient(ellipse_70%_55%_at_15%_0%,rgba(59,130,246,0.11),transparent),radial-gradient(ellipse_55%_45%_at_85%_15%,rgba(99,102,241,0.08),transparent),radial-gradient(ellipse_90%_40%_at_50%_100%,rgba(37,99,235,0.04),transparent)]";

/** Primary CTA — solid blue */
export const marketingCtaPrimary =
  "bg-blue-600 shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25";

/** Secondary CTA — visible on white */
export const marketingCtaSecondary =
  "border border-slate-300 bg-slate-50 text-slate-800 shadow-sm hover:border-slate-400 hover:bg-white hover:shadow-md";
