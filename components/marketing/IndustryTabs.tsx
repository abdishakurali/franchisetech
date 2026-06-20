"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { MarketingMessages } from "@/lib/marketing/i18n/en";
import { marketingCard, marketingHeading } from "@/lib/marketing/tokens";
import { SectionLabel } from "@/components/marketing/MarketingShell.primitives";

type IndustryItem = MarketingMessages["home"]["industries"]["items"][number];

function tabItems(items: readonly IndustryItem[]) {
  const cafe = items.find((i) => i.href.includes("cafes"));
  const restaurant = items.find((i) => i.href.includes("restaurants"));
  const multi = {
    title: "Multi-site",
    text: "Central reporting and one workspace per location.",
    href: "/pricing",
    image: items.find((i) => i.href.includes("restaurants"))?.image ?? "/marketing/industry-restaurant.png",
  };
  return [cafe, restaurant, multi].filter(Boolean) as IndustryItem[];
}

export function IndustryTabs({
  label,
  title,
  items,
  getStarted,
  learnMore,
}: {
  label: string;
  title: string;
  items: readonly IndustryItem[];
  getStarted: string;
  learnMore: string;
}) {
  const tabs = tabItems(items);
  const [active, setActive] = useState(0);
  const current = tabs[active] ?? tabs[0];

  if (!current) return null;

  return (
    <div>
      <div className="max-w-2xl">
        <SectionLabel>{label}</SectionLabel>
        <h2 className={`mt-3 ${marketingHeading}`}>{title}</h2>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab.href}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              i === active
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      <div className={`mt-8 overflow-hidden ${marketingCard}`}>
        <div className="grid lg:grid-cols-2">
          <div className="aspect-[16/10] overflow-hidden lg:aspect-auto">
            <Image
              src={current.image}
              alt={current.title}
              width={640}
              height={400}
              className={`h-full w-full ${"imageType" in current && current.imageType === "screenshot" ? "object-contain object-top bg-slate-100" : "object-cover"}`}
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center p-8">
            <h3 className="text-xl font-semibold text-slate-900">{current.title}</h3>
            <p className="mt-2 text-slate-500">{current.text}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                {getStarted} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={current.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                {learnMore} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
