import Image from "next/image";
import { FRANCHISETECH_BRAND, getCompetitorBrand } from "@/lib/marketing/competitor-brands";

type Props = {
  competitorSlug: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { box: "h-10 w-10", text: "text-lg", gap: "gap-3", vs: "text-sm" },
  md: { box: "h-14 w-14", text: "text-xl", gap: "gap-4", vs: "text-base" },
  lg: { box: "h-20 w-20", text: "text-2xl", gap: "gap-6", vs: "text-lg" },
};

export function CompareBrandLogos({ competitorSlug, size = "md" }: Props) {
  const brand = getCompetitorBrand(competitorSlug);
  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap}`} aria-hidden="true">
      <div className={`relative ${s.box} shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm`}>
        <Image
          src={FRANCHISETECH_BRAND.logoFallbackSrc}
          alt=""
          width={80}
          height={80}
          className="h-full w-full object-contain"
        />
      </div>
      <span className={`font-semibold text-slate-400 ${s.vs}`}>vs</span>
      {brand ? (
        <div
          className={`relative ${s.box} shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm`}
          style={{ boxShadow: `0 0 0 1px ${brand.accent}22` }}
        >
          <Image src={brand.logoSrc} alt="" width={80} height={80} className="h-full w-full object-contain" />
        </div>
      ) : (
        <div
          className={`flex ${s.box} shrink-0 items-center justify-center rounded-xl font-bold text-white ${s.text}`}
          style={{ backgroundColor: "#64748b" }}
        >
          ?
        </div>
      )}
    </div>
  );
}

export function CompareBrandLogosLabeled({ competitorSlug }: { competitorSlug: string }) {
  const brand = getCompetitorBrand(competitorSlug);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
      <div className="flex items-center gap-3">
        <CompareBrandLogos competitorSlug={competitorSlug} size="lg" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
        <span>
          <strong className="text-slate-800">{FRANCHISETECH_BRAND.name}</strong> — POS + stock + recipes
        </span>
        {brand ? (
          <span>
            <strong className="text-slate-800">{brand.name}</strong> — {brand.market === "ro" ? "RO market" : "global"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
