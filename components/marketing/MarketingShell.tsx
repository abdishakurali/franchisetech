import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { jsonLd, SITE_URL } from "@/lib/marketing/seo";
import { createClient } from "@/lib/supabase/server";

export const featureLinks = [
  ["/features/pos", "POS register"],
  ["/features/stock-management", "Stock management"],
  ["/features/recipe-costing", "Recipe costing"],
  ["/features/z-report", "Z-report"],
  ["/features/food-safety-records", "Food safety records"],
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
  const displayName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = displayName
    .split(/[ @._-]/)
    .filter(Boolean)
    .map((part: string) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto max-w-[180px] object-contain" />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 md:flex">
          <Link href="/features" className="hover:text-slate-950">Features</Link>
          <Link href="/industries/cafes" className="hover:text-slate-950">Industries</Link>
          <Link href="/resources" className="hover:text-slate-950">Resources</Link>
          <Link href="/pricing" className="hover:text-slate-950">Pricing</Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/app" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">Dashboard</Link>
              <Link href="/app/profile" className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{initials || "U"}</span>
                <span className="hidden max-w-32 truncate sm:inline">{displayName}</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-950">Login</Link>
              <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Start 15-day trial</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
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
          <div className="mb-3 flex items-center gap-2 text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/franchise-tech-logo.png" alt="franchisetech" className="h-8 w-auto max-w-[180px] object-contain brightness-0 invert" />
          </div>
          <p className="max-w-sm text-sm">Simple POS and business control for independent shops.</p>
          <p className="mt-4 max-w-sm text-xs">franchisetech helps owners sell products, manage staff, and see daily sales clearly. Hardware and specialist integrations can be reviewed later.</p>
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map(([href, label, Icon]) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`franchisetech on ${label}`}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <FooterColumn title="Features" links={featureLinks} />
        <FooterColumn title="Industries" links={industryLinks} />
        <FooterColumn title="Resources" links={[["/resources", "Resources"], ...resourceLinks.slice(0, 3), ["/pricing", "Pricing"], ["/privacy", "Privacy"], ["/terms", "Terms"]]} />
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
    <section className="overflow-hidden bg-white px-4 pb-14 pt-16 sm:px-6 lg:px-8">
      <div className={`mx-auto grid max-w-6xl items-center gap-10 ${image ? "lg:grid-cols-[0.85fr_1.15fr]" : ""}`}>
        <div>
          {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">{eyebrow}</p>}
          <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-5 text-lg text-slate-600">{description}</p>
          <CtaRow />
        </div>
        {image && <HeroScreenshots />}
      </div>
    </section>
  );
}

export function HeroScreenshots() {
  return (
    <div className="relative min-h-[360px]">
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
        <Image src="/marketing/pos-hero.png" alt="franchisetech POS register with cart and till controls" width={1200} height={750} className="aspect-[16/10] w-full rounded-lg object-cover" priority />
      </div>
      <div className="absolute -bottom-8 right-4 w-2/3 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
        <Image src="/marketing/dashboard-hero.png" alt="franchisetech dashboard showing sales today and expected cash" width={1200} height={750} className="aspect-[16/10] w-full rounded-lg object-cover" />
      </div>
    </div>
  );
}

export function CtaRow() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700">
        Start 15-day trial <ArrowRight className="h-4 w-4" />
      </Link>
      <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50">
        See pricing
      </Link>
    </div>
  );
}

export function Section({ children, tone = "white" }: { children: ReactNode; tone?: "white" | "slate" | "blue" }) {
  const bg = tone === "slate" ? "bg-slate-50" : tone === "blue" ? "bg-blue-50 border-y border-blue-100" : "bg-white";
  return <section className={`${bg} px-4 py-16 sm:px-6 lg:px-8`}><div className="mx-auto max-w-6xl">{children}</div></section>;
}

export function CardGrid({ items }: { items: Array<{ title: string; text: string; href?: string }> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const body = (
          <div className="h-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <CheckCircle2 className="mb-3 h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        );
        return item.href ? <Link key={item.title} href={item.href}>{body}</Link> : <div key={item.title}>{body}</div>;
      })}
    </div>
  );
}

export function Faq({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.question} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="font-semibold text-slate-950">{item.question}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}

export function FinalCta({ title = "Start with a 15-day assisted trial." }: { title?: string }) {
  return (
    <Section tone="blue">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold text-slate-950">{title}</h2>
        <p className="mt-3 text-slate-600">We help set up products, staff, payment methods, a first sale test, and the owner dashboard walkthrough.</p>
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
