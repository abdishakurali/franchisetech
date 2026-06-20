import Image from "next/image";

function BrowserChrome({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <span className="h-2 w-2 rounded-full bg-slate-300" />
      <div className="mx-2 min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200/80">
        franchisetech.ro{path}
      </div>
    </div>
  );
}

function MiniBrowserChrome({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50/90 px-2.5 py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
      <div className="min-w-0 flex-1 truncate rounded bg-white px-2 py-0.5 text-[9px] text-slate-500 ring-1 ring-slate-200/80">
        franchisetech.ro{path}
      </div>
    </div>
  );
}

type HeroVisualCollageProps = {
  posSrc: string;
  posAlt: string;
  posPath: string;
  cafeSrc: string;
  cafeAlt: string;
  kitchenSrc: string;
  kitchenAlt: string;
  kitchenPath: string;
  priority?: boolean;
};

/** POS on top, owner photo bottom-left, kitchen display bottom-right — one unified card. */
export function HeroVisualCollage({
  posSrc,
  posAlt,
  posPath,
  cafeSrc,
  cafeAlt,
  kitchenSrc,
  kitchenAlt,
  kitchenPath,
  priority,
}: HeroVisualCollageProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)]">
      <BrowserChrome path={posPath} />
      <Image
        src={posSrc}
        alt={posAlt}
        width={1200}
        height={750}
        className="w-full object-cover object-top"
        priority={priority}
      />

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 p-2 sm:gap-3 sm:p-3">
        <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm">
          <Image
            src={cafeSrc}
            alt={cafeAlt}
            width={400}
            height={500}
            className="aspect-[4/5] w-full object-cover"
            unoptimized
          />
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <MiniBrowserChrome path={kitchenPath} />
          <Image
            src={kitchenSrc}
            alt={kitchenAlt}
            width={400}
            height={500}
            className="aspect-[4/5] w-full object-cover object-top"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
