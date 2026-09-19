"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

type TestimonialItem = {
  quote: string;
  rating: number | null;
  companyName: string;
  name: string;
  role: string;
};

export function TestimonialCarouselTrack({ items }: { items: TestimonialItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 380), behavior: "smooth" });
  }

  return (
    <div className="relative mt-6">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="w-[85vw] max-w-sm shrink-0 snap-start rounded-2xl border border-border bg-card p-6 shadow-sm sm:w-[380px]"
          >
            {item.rating ? (
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s < item.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
            ) : null}
            <p className="text-sm leading-relaxed text-foreground">&ldquo;{item.quote}&rdquo;</p>
            <footer className="mt-4 text-sm">
              <p className="font-semibold text-foreground">{item.name || item.companyName}</p>
              <p className="text-muted-foreground">
                {[item.role, item.companyName].filter(Boolean).join(" · ")}
              </p>
            </footer>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollBy(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-mid hover:border-brass/40 hover:text-brass"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Următor"
            onClick={() => scrollBy(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-mid hover:border-brass/40 hover:text-brass"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
