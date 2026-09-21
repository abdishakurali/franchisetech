"use client";

import { useEffect, useRef, useState } from "react";

type SettingsSectionNavProps = {
  sections: Array<{ id: string; label: string }>;
};

const pillBase =
  "rounded-full px-3 py-1.5 text-sm font-medium transition whitespace-nowrap";
const pillInactive = "border border-border bg-card text-mid hover:border-brass hover:text-foreground";
const pillActive = "border border-brass bg-brass text-ink font-semibold";

export function SettingsSectionNav({ sections }: SettingsSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(sections[0]?.id ?? null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Find the actual scrolling ancestor (overflow-y auto/scroll with real
    // overflow), not just the nearest <main> — the app shell's <main> is
    // the real scroll container, but that's incidental to it being a
    // <main>, and assuming the tag would silently break if that ever
    // changed, or in any other host page that isn't scoped the same way.
    let scrollParent: HTMLElement | null = navRef.current?.parentElement ?? null;
    while (scrollParent instanceof HTMLElement) {
      const style = getComputedStyle(scrollParent);
      const scrollable = (style.overflowY === "auto" || style.overflowY === "scroll") && scrollParent.scrollHeight > scrollParent.clientHeight;
      if (scrollable) break;
      scrollParent = scrollParent.parentElement;
    }
    if (!(scrollParent instanceof HTMLElement)) scrollParent = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Among sections currently intersecting the "active band" near the
        // top, pick the one closest to it — mirrors reading position, not
        // just "first mounted" or "last seen".
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setActiveId(top.target.id);
      },
      {
        root: scrollParent ?? null,
        // A band starting just below the sticky nav itself, so a section
        // only counts "active" once it's actually the one in reading view.
        rootMargin: "-96px 0px -70% 0px",
        threshold: 0,
      }
    );
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      ref={navRef}
      aria-label="Settings sections"
      className="sticky top-0 z-10 -mx-4 mb-8 flex flex-wrap gap-2 border-b border-border bg-card px-4 py-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:-mx-6 sm:px-6"
    >
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          aria-current={activeId === s.id ? "true" : undefined}
          className={`${pillBase} ${activeId === s.id ? pillActive : pillInactive}`}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
