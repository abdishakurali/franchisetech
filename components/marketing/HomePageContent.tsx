"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CloudUpload,
  Languages,
  Monitor,
  Play,
  ReceiptText,
  WifiOff,
  X,
  ZoomIn,
} from "lucide-react";
import { Faq, Section } from "@/components/marketing/MarketingShell.primitives";
import { YouTubeFacade } from "@/components/marketing/YouTubeFacade";
import { captureClientEvent } from "@/lib/analytics/client-events";
import { useMarketingLocaleContext } from "@/lib/marketing/marketing-locale-context";
import { writeMarketingLocaleClient } from "@/lib/marketing/locale-client";
import {
  fiscalHardware,
  getHomepageContent,
} from "@/lib/marketing/homepage-content";
import { pricingPlans } from "@/lib/billing/plans";

const heading =
  "font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-normal text-[#0D0F0E] sm:text-4xl";
const label = "text-xs font-semibold uppercase tracking-normal text-[#165DFC]";
const primary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#165DFC] px-6 text-sm font-semibold text-white transition hover:bg-[#0B47CC] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#165DFC]";
const anchors = ["produse", "offline", "hardware", "client-video"];

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
    <>
      <section className="relative isolate bg-[#151917] px-4 py-14 text-white sm:px-6 sm:py-20 lg:px-8">
        <Image
          src="/marketing/hero-cafe-pos.png"
          alt=""
          fill
          sizes="100vw"
          preload
          className="-z-20 object-cover object-[62%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-black/65 lg:bg-black/55" />
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-medium text-white/90">
            franchisetech <span className="mx-2 text-white/50">/</span>{" "}
            {c.eyebrow}
          </p>
          <h1 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.08] tracking-normal sm:text-5xl lg:text-6xl">
            {c.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/90 sm:text-lg">
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
              href="#client-video"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/70 bg-black/20 px-5 text-sm font-semibold hover:bg-black/40"
            >
              <Play size={17} aria-hidden />
              {c.watch}
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-white/90">
            <Check size={16} aria-hidden />
            {c.trialNote}
          </p>
        </div>
      </section>
      <nav
        aria-label={locale === "ro" ? "Pe această pagină" : "On this page"}
        className="border-b border-[#DDE2E0] bg-white px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 sm:grid-cols-4">
          {anchors.map((anchor, i) => (
            <a
              key={anchor}
              href={`#${anchor}`}
              className="flex min-h-16 items-center justify-between gap-2 border-b border-[#EDF0EE] py-4 pr-4 text-sm font-medium text-[#333C37] hover:text-[#165DFC] sm:border-b-0 sm:pr-6"
            >
              {c.quickLinks[i]}
              <ArrowUpRight size={16} className="shrink-0" aria-hidden />
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}

function ProductGallery() {
  const { locale } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const screen = c.screens[selected];
  return (
    <Section id="produse">
      <p className={label}>{c.galleryLabel}</p>
      <h2 className={`mt-3 max-w-3xl ${heading}`}>{c.galleryTitle}</h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-[#526158]">
        {c.galleryIntro}
      </p>
      <div
        role="tablist"
        aria-label={c.galleryLabel}
        className="mt-8 grid grid-cols-2 border-b border-[#DDE2E0] sm:grid-cols-4"
      >
        {c.screens.map((item, i) => (
          <button
            key={item.src}
            ref={(node) => {
              tabRefs.current[i] = node;
            }}
            type="button"
            role="tab"
            id={`screen-tab-${i}`}
            aria-selected={selected === i}
            aria-controls="product-screen"
            tabIndex={selected === i ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(event) => {
              let next = i;
              if (event.key === "ArrowRight") next = (i + 1) % c.screens.length;
              else if (event.key === "ArrowLeft")
                next = (i - 1 + c.screens.length) % c.screens.length;
              else if (event.key === "Home") next = 0;
              else if (event.key === "End") next = c.screens.length - 1;
              else return;
              event.preventDefault();
              setSelected(next);
              tabRefs.current[next]?.focus();
            }}
            className={`min-h-14 border-b-2 px-3 py-3 text-sm font-semibold transition ${selected === i ? "border-[#165DFC] text-[#165DFC]" : "border-transparent text-[#526158] hover:bg-[#F4F7F5]"}`}
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-[#526158]">{screen.text}</p>
          {!screen.video && (
            <button
              type="button"
              onClick={() => dialog.current?.showModal()}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#165DFC]"
            >
              <ZoomIn size={18} aria-hidden />
              {c.enlarge}
            </button>
          )}
        </div>
        {screen.video ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-[#DDE2E0] bg-[#F5F7F6] sm:aspect-[16/9]">
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
          </div>
        ) : (
          <button
            type="button"
            aria-label={`${c.enlarge}: ${screen.title}`}
            onClick={() => dialog.current?.showModal()}
            className="relative block aspect-[16/10] w-full cursor-zoom-in overflow-hidden rounded-lg border border-[#DDE2E0] bg-[#F5F7F6] sm:aspect-[16/9]"
          >
            <Image
              src={screen.src}
              alt={`${screen.title} — franchisetech`}
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-contain"
            />
          </button>
        )}
        <Link
          href="/features"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#165DFC]"
        >
          {c.more}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      <dialog
        ref={dialog}
        aria-label={screen.title}
        className="fixed inset-0 m-auto h-[90dvh] max-h-[90dvh] w-[96vw] max-w-[1600px] rounded-lg border border-[#DDE2E0] bg-white p-3 backdrop:bg-black/80"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="flex h-12 items-center justify-between gap-4 px-2">
          <span className="font-semibold">{screen.title}</span>
          <button
            type="button"
            autoFocus
            title={c.close}
            aria-label={c.close}
            onClick={() => dialog.current?.close()}
            className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-[#F4F7F5]"
          >
            <X size={22} />
          </button>
        </div>
        <div className="h-[calc(100%-3rem)] overflow-auto">
          <Image
            src={screen.src}
            alt={`${screen.title} — franchisetech`}
            width={1600}
            height={1000}
            sizes="(max-width: 1024px) 1000px, 96vw"
            className="h-auto w-full min-w-[1000px]"
          />
        </div>
      </dialog>
    </Section>
  );
}

export function HomePageContentBottom() {
  const router = useRouter();
  const { locale, t } = useMarketingLocaleContext();
  const c = getHomepageContent(locale);
  const stepIcons = [WifiOff, CloudUpload, ReceiptText];
  function changeLanguage(code: "ro" | "en") {
    writeMarketingLocaleClient(code);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", code);
    router.replace(`${url.pathname}${url.search}${url.hash}`, {
      scroll: false,
    });
    router.refresh();
  }
  return (
    <>
      <ProductGallery />
      <section
        id="offline"
        className="scroll-mt-24 bg-[#EAF5EF] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-[#17633B]">
            <WifiOff size={18} aria-hidden />
            {c.offlineLabel}
          </p>
          <h2 className={`mt-4 max-w-3xl ${heading}`}>{c.offlineTitle}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#3F594B]">
            {c.offlineIntro}
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {c.offlineSteps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <li key={step.title} className="border-t border-[#A9C9B6] pt-5">
                  <div className="flex items-center justify-between">
                    <Icon size={25} className="text-[#17633B]" aria-hidden />
                    <span className="font-mono text-xs text-[#426A53]">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-[#173F29]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#3F594B]">
                    {step.text}
                  </p>
                </li>
              );
            })}
          </ol>
          <p className="mt-9 max-w-4xl border-t border-[#A9C9B6] pt-5 text-sm leading-6 text-[#3F594B]">
            {c.offlineNote}
          </p>
          <Link
            href="/features/offline"
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#17633B]"
          >
            {c.offlineLink}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>
      <Section id="client-video">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className={label}>{t.home.videoTestimonial.label}</p>
            <h2 className={`mt-3 ${heading}`}>
              {t.home.videoTestimonial.heading}
            </h2>
            <p className="mt-5 text-base leading-7 text-[#526158]">
              {t.home.videoTestimonial.caption}
            </p>
            <a
              href="#in-cafe"
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#165DFC]"
            >
              {c.proofLink}
              <ArrowRight size={16} aria-hidden />
            </a>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg bg-[#151917]">
            <YouTubeFacade
              youtubeId={t.home.videoTestimonial.youtubeId}
              title={t.home.videoTestimonial.heading}
            />
          </div>
        </div>
        <details id="in-cafe" className="mt-8 border-y border-[#DDE2E0] py-5">
          <summary className="cursor-pointer text-sm font-semibold text-[#165DFC]">
            {c.proofLink}
          </summary>
          <figure className="mx-auto mt-6 max-w-sm">
            <video
              controls
              playsInline
              preload="none"
              poster="/marketing/product-proof/pos-in-cafe-poster.jpg"
              aria-label={c.proofCaption}
              className="aspect-[9/16] w-full rounded-lg bg-black object-contain"
            >
              <source
                src="/marketing/product-proof/pos-in-cafe.mp4"
                type="video/mp4"
              />
            </video>
            <figcaption className="mt-3 text-sm leading-6 text-[#526158]">
              {c.proofCaption}
            </figcaption>
          </figure>
        </details>
      </Section>
      <section
        id="hardware"
        className="scroll-mt-24 bg-[#F4F6F8] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className={label}>{c.hardwareLabel}</p>
          <h2 className={`mt-3 max-w-3xl ${heading}`}>{c.hardwareTitle}</h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-[#526158]">
            {c.hardwareIntro}
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {fiscalHardware.map((device) => (
              <article
                key={device.name}
                className="overflow-hidden rounded-lg border border-[#DDE2E0] bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={device.image}
                    alt={device.name}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-contain p-5"
                  />
                </div>
                <div className="border-t border-[#EDF0EE] p-5">
                  <p className="text-xs text-[#526158]">{c[device.type]}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#0D0F0E]">
                    {device.name}
                  </h3>
                  <a
                    href={device.source}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#165DFC]"
                  >
                    {c.model}
                    <ArrowUpRight size={16} aria-hidden />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div
            id="conformitate"
            className="mt-8 border-t border-[#CCD4DB] pt-6"
          >
            <p className="max-w-4xl text-sm leading-6 text-[#526158]">
              {c.hardwareNote}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              <Link
                href="/help/romania-fiscalnet"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#165DFC]"
              >
                {c.hardwareGuide}
                <ArrowRight size={16} aria-hidden />
              </Link>
              <a
                href="https://www.datecs.ro/driver-fiscalnet-datecs.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#526158]"
              >
                {c.hardwareSource}
                <ArrowUpRight size={16} aria-hidden />
              </a>
            </div>
          </div>
        </div>
      </section>
      <Section id="adevar-unic">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <Languages size={28} className="text-[#165DFC]" aria-hidden />
            <p className={`mt-5 ${label}`}>{c.languagesLabel}</p>
            <h2 className={`mt-3 ${heading}`}>{c.languagesTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#526158]">
              {c.languagesText}
            </p>
            <div
              role="group"
              aria-label={c.languagesLabel}
              className="mt-6 inline-flex rounded-lg border border-[#CBD3DD] p-1"
            >
              {(["ro", "en"] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  aria-pressed={locale === code}
                  onClick={() => changeLanguage(code)}
                  className={`min-h-11 min-w-28 rounded-md px-4 text-sm font-semibold ${locale === code ? "bg-[#165DFC] text-white" : "text-[#526158] hover:bg-[#F4F6F8]"}`}
                >
                  {code === "ro" ? "Română" : "English"}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-[#DDE2E0] pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <Monitor size={28} className="text-[#165DFC]" aria-hidden />
            <h2 className={`mt-5 ${heading}`}>{c.deviceTitle}</h2>
            <p className="mt-4 text-base leading-7 text-[#526158]">
              {c.deviceText}
            </p>
            <video
              controls
              playsInline
              preload="none"
              poster="/showcase/pos-cart.png"
              aria-label={c.deviceTitle}
              className="mt-6 aspect-[1400/900] w-full rounded-lg border border-[#DDE2E0] bg-[#F5F7F6] object-contain"
            >
              <source src="/showcase/product-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </Section>
      <Section id="preturi">
        <p className={label}>{c.pricingLabel}</p>
        <h2 className={`mt-3 ${heading}`}>{c.pricingTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {(["starter", "pro"] as const).map((id, i) => {
            const plan = pricingPlans.find((p) => p.id === id)!;
            return (
              <article
                key={id}
                className="rounded-lg border border-[#DDE2E0] bg-white p-6 sm:p-8"
              >
                <h3 className="text-xl font-semibold">
                  {id === "starter" ? "Core" : "Operations"}
                </h3>
                <p className="mt-4 text-4xl font-semibold tracking-normal text-[#0D0F0E]">
                  {Math.round(plan.amountCents / 100)} €
                  <span className="text-sm font-normal text-[#526158]">
                    {" "}
                    / {c.month}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-6 text-[#526158]">
                  {c.planText[i]}
                </p>
                <Link href={`/signup?plan=${id}`} className={`mt-6 ${primary}`}>
                  {c.trial}
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>
        <Link
          href="/pricing"
          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#165DFC]"
        >
          {c.pricingLink}
          <ArrowRight size={16} aria-hidden />
        </Link>
        <p className="mt-2 text-sm leading-6 text-[#526158]">{c.pricingNote}</p>
      </Section>
      <Section>
        <p className={label}>{c.faqLabel}</p>
        <h2 className={`mt-3 ${heading}`}>{c.faqTitle}</h2>
        <div className="mt-8">
          <Faq items={c.faq} layout="grid-2" />
        </div>
      </Section>
      <Section id="incepe" tone="navy">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight tracking-normal text-white sm:text-4xl">
              {c.finalTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
              {c.finalText}
            </p>
          </div>
          <Link href="/signup?plan=starter" className={`shrink-0 ${primary}`}>
            {c.trial}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </Section>
    </>
  );
}
