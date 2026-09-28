import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { getMarketingLocale } from "@/lib/marketing/locale-server";

export const metadata: Metadata = {
  title: "Contact franchisetech",
  description: "Trimite o întrebare echipei franchisetech despre configurare, compatibilitate sau contul tău.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const isRo = (await getMarketingLocale()) === "ro";
  return (
    <ClaudeMarketingShellAuth>
      <main className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">Contact</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0D0F0E] sm:text-5xl">{isRo ? "Ai o întrebare despre franchisetech?" : "Have a question about franchisetech?"}</h1>
            <p className="mt-5 text-lg leading-8 text-[#5B5D57]">{isRo ? "Scrie-ne despre configurare, compatibilitate sau contul tău. Revenim în maximum o zi lucrătoare." : "Ask about setup, compatibility, or your account. We reply within one business day."}</p>
            <p className="mt-5 text-sm text-[#8F8F86]">info@franchisetech.ro</p>
          </div>
          <ContactForm />
        </div>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
