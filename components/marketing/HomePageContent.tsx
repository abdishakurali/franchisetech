"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/marketing/MarketingShell.primitives";
import { YouTubeFacade } from "@/components/marketing/YouTubeFacade";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { pricingPlans } from "@/lib/billing/plans";
import { getHomepageContent } from "@/lib/marketing/homepage-content";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";

const heading =
  "font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-[#0D0F0E] sm:text-4xl";
const label = "text-xs font-semibold uppercase text-[#165DFC]";
const primary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#165DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#0B47CC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#165DFC]";

export function HomePageContentTop() {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);

  useEffect(() => {
    captureClientEvent("landing_page_view", {
      locale,
      page: "homepage_single_truth",
    });
  }, [locale]);

  return (
    <section className="relative isolate overflow-hidden bg-[#151917] px-4 py-16 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
      <Image
        src="/marketing/hero-cafe-pos.png"
        alt=""
        fill
        sizes="100vw"
        preload
        className="-z-20 object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 -z-10 bg-black/70 lg:bg-gradient-to-r lg:from-black/80 lg:via-black/60 lg:to-black/25" />
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-white/85">{c.eyebrow}</p>
          <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.06] sm:text-5xl lg:text-6xl">
            {c.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            {c.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup?plan=starter"
              className={primary}
              onClick={() =>
                captureClientEvent("cta_clicked", {
                  location: "homepage_hero",
                  destination: "/signup?plan=starter",
                })
              }
            >
              {c.trial}
              <ArrowRight size={18} aria-hidden />
            </Link>
            <a
              href="#product-proof"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/70 bg-black/20 px-6 text-sm font-semibold text-white transition hover:bg-black/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {c.watch}
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-white/85">
            <Check size={16} aria-hidden />
            {c.trialNote}
          </p>
        </div>
      </div>
    </section>
  );
}

function ProductProof() {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const screen = c.screens[selected];

  return (
    <Section id="product-proof">
      <div className="max-w-3xl">
        <p className={label}>{c.galleryLabel}</p>
        <h2 className={`mt-3 ${heading}`}>{c.galleryTitle}</h2>
        <p className="mt-4 text-base leading-7 text-[#526158]">
          {c.galleryIntro}
        </p>
      </div>
      <div
        role="tablist"
        aria-label={c.galleryLabel}
        className="mt-8 flex snap-x gap-1 overflow-x-auto border-b border-[#DDE2E0] sm:grid sm:grid-cols-4"
      >
        {c.screens.map((item, index) => (
          <button
            key={item.src}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`screen-tab-${index}`}
            aria-selected={selected === index}
            aria-controls="product-screen"
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={(event) => {
              let next = index;
              if (event.key === "ArrowRight") next = (index + 1) % c.screens.length;
              else if (event.key === "ArrowLeft")
                next = (index - 1 + c.screens.length) % c.screens.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = c.screens.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              tabRefs.current[next]?.focus();
            }}
            className={`min-h-12 min-w-32 snap-start border-b-2 px-4 py-3 text-sm font-semibold transition sm:min-w-0 ${selected === index ? "border-[#165DFC] text-[#165DFC]" : "border-transparent text-[#526158] hover:bg-[#F4F7F5]"}`}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div
        id="product-screen"
        role="tabpanel"
        aria-labelledby={`screen-tab-${selected}`}
        tabIndex={0}
        className="pt-5"
      >
        <p className="mb-4 text-sm leading-6 text-[#526158]">{screen.text}</p>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-[#DDE2E0] bg-[#F5F7F6] shadow-sm sm:aspect-[16/9]">
          {screen.video ? (
            <video
              controls
              playsInline
              preload="none"
              poster={screen.src}
              aria-label={`${screen.title} — franchisetech`}
              className="absolute inset-0 h-full w-full object-contain"
            >
              <source src={screen.video} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={screen.src}
              alt={`${screen.title} — franchisetech`}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-contain"
            />
          )}
        </div>
      </div>
    </Section>
  );
}

export function HomePageContentBottom() {
  const { locale, t } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);

  return (
    <>
      <ProductProof />
      <section
        id="benefits"
        className="scroll-mt-24 border-y border-[#E2E6E3] bg-[#F5F3EE] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className={label}>{c.benefitsLabel}</p>
          <h2 className={`mt-3 max-w-3xl ${heading}`}>{c.benefitsTitle}</h2>
          <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {c.benefits.map((benefit, index) => (
              <li key={benefit.title} className="border-t border-[#C9CEC9] pt-5">
                <span className="font-mono text-xs text-[#165DFC]">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-semibold text-[#0D0F0E]">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#526158]">
                  {benefit.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Section id="customer-proof">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className={label}>{c.customerProof.label}</p>
            <h2 className={`mt-3 ${heading}`}>{c.customerProof.title}</h2>
            <p className="mt-5 text-base leading-7 text-[#526158]">
              {c.customerProof.caption}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-[#DDE2E0] pt-6">
              {c.customerProof.stats.map((stat) => (
                <div key={stat.label}>
                  <dd className="text-2xl font-semibold text-[#0D0F0E]">
                    {stat.value}
                  </dd>
                  <dt className="mt-1 text-sm text-[#526158]">{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-[#151917]">
            <YouTubeFacade
              youtubeId={t.home.videoTestimonial.youtubeId}
              title={c.customerProof.title}
            />
          </div>
        </div>
      </Section>
      <section
        id="pricing"
        className="scroll-mt-24 bg-[#151917] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase text-[#8DB6FF]">
            {c.pricingLabel}
          </p>
          <div className="mt-3 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight sm:text-4xl">
                {c.pricingTitle}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                {c.pricingNote}
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#AFC9FF]"
            >
              {c.pricingLink}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {(["starter", "pro"] as const).map((id, index) => {
              const plan = pricingPlans.find((item) => item.id === id)!;
              return (
                <article
                  key={id}
                  className="rounded-xl bg-white p-6 text-[#0D0F0E] sm:p-8"
                >
                  <h3 className="text-xl font-semibold">
                    {id === "starter" ? "Starter" : "Pro"}
                  </h3>
                  <p className="mt-4 text-4xl font-semibold">
                    {Math.round(plan.amountCents / 100)} €
                    <span className="text-sm font-normal text-[#526158]">
                      {" "}/ {c.month}
                    </span>
                  </p>
                  <p className="mt-4 text-sm leading-6 text-[#526158]">
                    {c.pricing.planText[index]}
                  </p>
                  <Link href={`/signup?plan=${id}`} className={`mt-6 ${primary}`}>
                    {c.trial}
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/20 pt-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">
                {c.finalTitle}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                {c.finalText}
              </p>
            </div>
            <Link href="/signup?plan=starter" className={`shrink-0 ${primary}`}>
              {c.trial}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
