import React from "react";
import Image from "next/image";

interface FrameProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  /** Path shown in browser chrome — e.g. /app/pos */
  path?: string;
  fit?: "cover" | "contain";
}

/** Minimal browser chrome — light shadow, no heavy bezel */
export function BrowserFrame({
  src,
  alt,
  width = 1200,
  height = 750,
  priority,
  className,
  path = "",
  fit = "cover",
}: FrameProps) {
  const objectClass = fit === "contain" ? "object-contain object-top" : "object-cover object-top";
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.18)] ${className ?? ""}`}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/80 px-4 py-2">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <div className="mx-2 min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-200/80">
          franchisetech.ro{path}
        </div>
      </div>
      <div className={fit === "contain" ? "bg-slate-50" : undefined}>
        <Image src={src} alt={alt} width={width} height={height} className={`w-full ${objectClass}`} priority={priority} />
      </div>
    </div>
  );
}

/** Tablet frame */
export function TabletFrame({ src, alt, width = 1024, height = 768, priority, className }: FrameProps) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      <div className="relative overflow-hidden rounded-[1.75rem] border-[8px] border-slate-900 bg-slate-900 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.25)]">
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-1.5">
          <div className="h-1 w-10 rounded-full bg-slate-700" />
        </div>
        <div className="overflow-hidden rounded-[1.25rem]">
          <Image src={src} alt={alt} width={width} height={height} className="block w-full object-cover" priority={priority} />
        </div>
      </div>
    </div>
  );
}

/** Slim laptop frame */
export function LaptopFrame({ src, alt, width = 1280, height = 800, priority, className }: FrameProps) {
  return (
    <div className={className ?? ""}>
      <div className="relative overflow-hidden rounded-t-xl border-[8px] border-b-0 border-slate-800 bg-slate-900 shadow-xl">
        <Image src={src} alt={alt} width={width} height={height} className="w-full object-cover" priority={priority} />
      </div>
      <div className="relative flex justify-center">
        <div className="h-2.5 w-full rounded-b-lg bg-slate-700" />
      </div>
    </div>
  );
}
