import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { jsonLd, SITE_URL } from "@/lib/marketing/seo";
import { createClient } from "@/lib/supabase/server";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { BrowserFrame } from "@/components/marketing/DeviceFrames";
import { marketingCard, marketingEyebrow, marketingSectionY } from "@/lib/marketing/tokens";

export const featureLinks = [
  ["/features/pos", "POS register"],
  ["/features/kitchen-display", "Kitchen display"],
  ["/features/stock-management", "Stock management"],
  ["/features/recipe-costing", "Recipe costing"],
  ["/features/z-report", "Z-report"],
  ["/features/purchases-suppliers", "Purchases & suppliers"],
] as const;

export const industryLinks = [
  ["/industries/cafes", "Cafes"],
  ["/industries/restaurants", "Restaurants"],
  ["/industries/takeaways", "Takeaways"],
  ["/industries/food-trucks", "Food trucks"],
  ["/industries/health-bars", "Health bars"],
] as const;

export const resourceLinks = [
  ["/resources/pos-system-for-small-cafes", "Small cafe POS guide"],
  ["/resources/recipe-costing-for-cafes", "Recipe costing guide"],
  ["/resources/z-report-explained", "Z-report explained"],
  ["/resources/food-business-stock-control", "Stock control guide"],
  ["/resources/cash-up-at-end-of-day", "Cash-up guide"],
] as const;

export async function MarketingNav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return <MarketingHeader user={null} />;
  }
  const displayName = user.user_metadata?.full_name || user.email || "User";
  const initials = displayName
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return <MarketingHeader user={{ displayName, initials }} />;
}

export const socialLinks = [
  ["https://www.youtube.com/@Franchisetech", "YouTube", YoutubeIcon],
  ["https://www.linkedin.com/company/franchisetec/", "LinkedIn", LinkedinIcon],
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-slate-950 px-4 py-12 text-slate-400 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="" className="h-9 w-9 shrink-0 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight">franchisetech</span>
          </Link>
        </div>
          <p className="max-w-sm text-sm">Cloud POS and business control for cafes, restaurants, and food businesses.</p>
          <p className="mt-4 max-w-sm text-xs">Sell, track stock, close the till, and see real numbers — without POS lock-in or per-seat fees.</p>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(([href, label, Icon]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`franchisetech on ${label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600 text-slate-300 transition-colors hover:border-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FooterColumn title="Features" links={featureLinks} />
        <FooterColumn title="Industries" links={industryLinks} />
        <FooterColumn title="Company" links={[["/partners", "Partners"], ["/pricing", "Pricing"], ["/resources", "Resources"], ["/help", "Help centre"], ["/privacy", "Privacy"], ["/terms", "Terms"]]} />
      </div>
    </footer>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="mb-3 font-semibold text-white">{title}</p>
      <div className="space-y-2 text-sm">
        {links.map(([href, label]) => <Link key={href} href={href} className="block hover:text-white">{label}</Link>)}
      </div>
    </div>
  );
}

export function Hero({ eyebrow, title, description, image = true }: { eyebrow?: string; title: string; description: string; image?: boolean }) {
  return (
    <section className={`overflow-hidden bg-gradient-to-b from-slate-50/80 to-white px-4 pb-16 pt-20 sm:px-6 lg:px-8 ${marketingSectionY}`}>
      <div className={`mx-auto grid max-w-6xl items-center gap-12 ${image ? "lg:grid-cols-2" : ""}`}>
        <div>
          {eyebrow && <p className={`mb-4 ${marketingEyebrow}`}>{eyebrow}</p>}
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-500">{description}</p>
          <CtaRow />
        </div>
        {image && <HeroScreenshots />}
      </div>
    </section>
  );
}

export function HeroScreenshots() {
  return (
    <BrowserFrame
      src="/showcase/pos-cart.png"
      alt="franchisetech POS register with product grid and checkout"
      path="/app/pos"
      priority
      className="shadow-2xl"
    />
  );
}

export function CtaRow({ secondaryHref = "/pricing", secondaryLabel = "See pricing" }: { secondaryHref?: string; secondaryLabel?: string }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700">
        Start 15-day trial <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href={secondaryHref} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
        {secondaryLabel}
      </Link>
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={marketingEyebrow}>{children}</p>;
}

export function Section({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "slate" | "blue" }) {
  const bg =
    tone === "slate"
      ? "bg-slate-50/70"
      : tone === "blue"
        ? "bg-blue-600/[0.04]"
        : "bg-white";
  return (
    <section className={`${bg} px-4 ${marketingSectionY} sm:px-6 lg:px-8`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function CardGrid({ items }: { items: Array<{ title: string; text: string; href?: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const body = (
          <div className={`h-full p-6 ${marketingCard}`}>
            <CheckCircle2 className="mb-3 h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
          </div>
        );
        return item.href ? <Link key={item.title} href={item.href} className="block">{body}</Link> : <div key={item.title}>{body}</div>;
      })}
    </div>
  );
}

export function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <div className="divide-y divide-slate-200/80 rounded-2xl border border-slate-200/70 bg-white">
      {items.map((item) => (
        <div key={item.question} className="px-6 py-5 sm:px-8 sm:py-6">
          <h3 className="font-medium text-slate-900">{item.question}</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function FinalCta({ title = "Start with a 15-day assisted trial." }: { title?: string }) {
  return (
    <Section tone="slate">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-3 text-slate-500">Setup help for products, staff, payment methods, and your first sale.</p>
        <CtaRow />
      </div>
    </Section>
  );
}

export function CTASection({ title }: { title?: string }) {
  return <FinalCta title={title} />;
}

export function PageShell({ children, schema }: { children: ReactNode; schema?: Record<string, unknown>[] }) {
  return (
    <div className="min-h-screen bg-white">
      {schema?.map((item, index) => <div key={index}>{jsonLd(item)}</div>)}
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return <PageShell schema={[organizationSchema]}>{children}</PageShell>;
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "franchisetech",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  sameAs: socialLinks.map(([href]) => href),
};
