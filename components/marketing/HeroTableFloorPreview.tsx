"use client";

import { floorBackgroundUrl } from "@/lib/floor-plan/constants";

const TABLES: Array<{
  n: string;
  x: number;
  y: number;
  w: number;
  h: number;
  round: boolean;
  occupied?: boolean;
}> = [
  { n: "1", x: 6, y: 12, w: 14, h: 14, round: false },
  { n: "2", x: 24, y: 10, w: 18, h: 12, round: false },
  { n: "3", x: 46, y: 12, w: 14, h: 14, round: true },
  { n: "4", x: 64, y: 10, w: 18, h: 12, round: false },
  { n: "5", x: 82, y: 12, w: 14, h: 14, round: false },
  { n: "6", x: 10, y: 38, w: 14, h: 14, round: true },
  { n: "7", x: 30, y: 36, w: 18, h: 12, round: false, occupied: true },
  { n: "8", x: 52, y: 36, w: 18, h: 12, round: false },
  { n: "9", x: 74, y: 38, w: 14, h: 14, round: true },
  { n: "10", x: 14, y: 62, w: 14, h: 14, round: false },
  { n: "11", x: 36, y: 60, w: 18, h: 12, round: false },
  { n: "12", x: 62, y: 62, w: 14, h: 14, round: true },
];

const SECTIONS = ["Sală", "Terasă", "Bar"] as const;

/** Compact floor picker for marketing hero — matches live POS table UI. */
export function HeroTableFloorPreview() {
  const bgUrl = floorBackgroundUrl({});

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-x-0 top-0 bg-black/35 backdrop-blur-sm border-b border-amber-200/20 px-3 py-2">
        <p className="text-[11px] font-semibold text-amber-50 sm:text-xs">Alege masa</p>
        <p className="text-[9px] text-amber-100/80 hidden sm:block">Apasă o masă pentru comandă</p>
      </div>

      <div className="absolute left-2 right-2 top-12 flex gap-1.5 overflow-hidden sm:left-3 sm:right-3">
        {SECTIONS.map((name, i) => (
          <span
            key={name}
            className={`shrink-0 rounded-md px-2.5 py-1 text-[9px] font-medium sm:text-[10px] ${
              i === 0
                ? "bg-amber-100 text-amber-950 border border-amber-300"
                : "bg-black/25 text-amber-50 border border-amber-200/30"
            }`}
          >
            {name}
          </span>
        ))}
      </div>

      <div className="absolute inset-0 pt-[3.25rem] pb-2 px-2 sm:pt-14">
        {TABLES.map((t) => (
          <div
            key={t.n}
            className="absolute flex flex-col items-center justify-center border-2 text-center shadow-sm"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: `${t.w}%`,
              height: `${t.h}%`,
              borderRadius: t.round ? "9999px" : "10px",
              backgroundColor: t.occupied ? "rgba(254,226,226,0.95)" : "rgba(236,253,245,0.92)",
              borderColor: t.occupied ? "#ef4444" : "#10b981",
              color: t.occupied ? "#991b1b" : "#065f46",
            }}
          >
            <span className="text-[10px] font-bold leading-none sm:text-xs">{t.n}</span>
            <span className="text-[7px] opacity-80 sm:text-[8px]">4 locuri</span>
          </div>
        ))}
      </div>
    </div>
  );
}
