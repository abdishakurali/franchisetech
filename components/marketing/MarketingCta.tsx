"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMarketingMessages } from "@/lib/marketing/use-marketing-locale";
import { marketingCtaPrimary, marketingCtaSecondary } from "@/lib/marketing/tokens";
import { Section } from "@/components/marketing/MarketingShell.primitives";

const demoUrl = process.env.NEXT_PUBLIC_DEMO_BOOKING_URL || null;

export function CtaRow({
  secondaryHref = "/pricing",
  secondaryLabel,
  plan,
  showDemo = false,
  className = "",
}: {
  secondaryHref?: string;
  secondaryLabel?: string;
  plan?: "starter" | "pro" | "scale" | "multi_location";
  showDemo?: boolean;
  className?: string;
}) {
  const t = useMarketingMessages();
  const secondary = secondaryLabel ?? t.cta.seePricing;
  const signupHref = plan ? `/signup?plan=${plan}` : "/signup?plan=starter";

  return (
    <div className={`flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap ${className}`}>
      <Link
        href={signupHref}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition sm:w-auto sm:py-3 ${marketingCtaPrimary}`}
      >
        {t.cta.getStarted} <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href={secondaryHref}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition sm:w-auto sm:py-3 ${marketingCtaSecondary}`}
      >
        {secondary}
      </Link>
      {showDemo && demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium transition sm:w-auto sm:py-3 ${marketingCtaSecondary}`}
        >
          {t.cta.bookDemo}
        </a>
      )}
    </div>
  );
}

export function FinalCta({ title }: { title?: string }) {
  const t = useMarketingMessages();

  return (
    <Section tone="slate">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{title ?? t.cta.finalTitle}</h2>
        <p className="mt-3 text-slate-500">{t.cta.setupHelp}</p>
        <div className="mt-8">
          <CtaRow showDemo className="justify-center" />
        </div>
      </div>
    </Section>
  );
}

export function CTASection({ title }: { title?: string }) {
  return <FinalCta title={title} />;
}
