import Image from "next/image";
import { HeroPosTableOrderPreview } from "@/components/marketing/HeroPosTableOrderPreview";
import { HeroTableFloorPreview } from "@/components/marketing/HeroTableFloorPreview";

type HeroVisualCollageProps = {
  floorAlt: string;
  floorSrc?: string;
  tableOrderAlt: string;
  tableOrderSrc?: string;
  dashboardSrc: string;
  dashboardAlt: string;
  priority?: boolean;
};

/**
 * Hero showcase: panou (main) on top, plan sală + POS masă below.
 * Framed with depth — no fake browser chrome.
 */
export function HeroVisualCollage({
  floorAlt,
  floorSrc,
  tableOrderAlt,
  tableOrderSrc,
  dashboardSrc,
  dashboardAlt,
  priority,
}: HeroVisualCollageProps) {
  return (
    <div className="marketing-hero-rise marketing-hero-delay-4 perspective-[1200px]">
      <div className="rotate-[1.25deg] transition-transform duration-500 hover:rotate-0 lg:rotate-[1.75deg]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_64px_-12px_rgba(15,23,42,0.18),0_8px_24px_-8px_rgba(37,99,235,0.12)] ring-1 ring-slate-900/[0.04]">
          <Image
            src={dashboardSrc}
            alt={dashboardAlt}
            width={1400}
            height={900}
            className="w-full object-cover object-top"
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 64rem"
          />

          <div className="grid grid-cols-1 gap-3 border-t border-slate-100 bg-white p-3 max-sm:hidden sm:grid-cols-2 sm:gap-3 sm:p-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {floorSrc ? (
                <Image
                  src={floorSrc}
                  alt={floorAlt}
                  width={700}
                  height={520}
                  className="w-full object-cover object-top"
                  priority={priority}
                  sizes="(max-width: 1024px) 100vw, 32rem"
                />
              ) : (
                <div className="min-h-[280px] w-full sm:min-h-[320px]" role="img" aria-label={floorAlt}>
                  <HeroTableFloorPreview />
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {tableOrderSrc ? (
                <Image
                  src={tableOrderSrc}
                  alt={tableOrderAlt}
                  width={700}
                  height={520}
                  className="w-full object-cover object-top"
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 32rem"
                />
              ) : (
                <div className="min-h-[280px] w-full sm:min-h-[320px]" role="img" aria-label={tableOrderAlt}>
                  <HeroPosTableOrderPreview />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
