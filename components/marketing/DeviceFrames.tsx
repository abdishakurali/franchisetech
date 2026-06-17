import React from "react";
import Image from "next/image";

interface FrameProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

/** Laptop/browser chrome frame */
export function BrowserFrame({ src, alt, width = 1200, height = 750, priority, className }: FrameProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 ${className ?? ""}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="mx-3 flex-1 max-w-xs rounded-md bg-white border border-slate-200 px-3 py-0.5 text-[10px] text-slate-400">
          franchisetech.ro/app/pos
        </div>
      </div>
      <Image src={src} alt={alt} width={width} height={height} className="w-full object-cover object-top" priority={priority} />
    </div>
  );
}

/** Tablet frame */
export function TabletFrame({ src, alt, width = 1024, height = 768, priority, className }: FrameProps) {
  return (
    <div className={`relative inline-block ${className ?? ""}`}>
      {/* Outer bezel */}
      <div className="relative overflow-hidden rounded-[2rem] border-[10px] border-slate-800 bg-slate-800 shadow-2xl shadow-slate-400/50">
        {/* Home bar */}
        <div className="absolute inset-x-0 top-0 z-10 flex justify-center pt-1.5">
          <div className="h-1.5 w-12 rounded-full bg-slate-600" />
        </div>
        {/* Screen */}
        <div className="overflow-hidden rounded-[1.4rem]">
          <Image src={src} alt={alt} width={width} height={height} className="block w-full object-cover" priority={priority} />
        </div>
        {/* Bottom bar */}
        <div className="flex justify-center pb-2 pt-1.5">
          <div className="h-1 w-20 rounded-full bg-slate-600" />
        </div>
      </div>
    </div>
  );
}

/** Slim laptop/notebook frame */
export function LaptopFrame({ src, alt, width = 1280, height = 800, priority, className }: FrameProps) {
  return (
    <div className={`${className ?? ""}`}>
      {/* Screen */}
      <div className="relative overflow-hidden rounded-t-xl border-[10px] border-b-0 border-slate-700 bg-slate-900 shadow-xl">
        <Image src={src} alt={alt} width={width} height={height} className="w-full object-cover" priority={priority} />
      </div>
      {/* Base */}
      <div className="relative flex justify-center">
        <div className="h-3 w-full rounded-b-lg bg-gradient-to-b from-slate-600 to-slate-700 shadow-lg" />
        <div className="absolute bottom-0 h-1 w-1/3 rounded-b-full bg-slate-500/50" />
      </div>
    </div>
  );
}
