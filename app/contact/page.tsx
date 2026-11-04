import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/ContactForm";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { getMarketingLocale } from "@/lib/marketing/locale-server";
import { DATA_CONTROLLER } from "@/lib/legal/controller";

export const metadata: Metadata = {
  title: "Contact franchisetech",
  description: "Lăsați un număr de telefon și vă sunăm în următoarea zi lucrătoare: configurare, casa de marcat sau contul dumneavoastră.",
  alternates: { canonical: "/contact" },
};

const EMAIL = "info@franchisetech.ro";

export default async function ContactPage() {
  const isRo = (await getMarketingLocale()) === "ro";
  // The marketing shell already renders <main>; this page is a section inside it.
  return (
    <ClaudeMarketingShellAuth>
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">Contact</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0D0F0E] sm:text-5xl">
              {isRo ? "Aveți o întrebare despre franchisetech?" : "Have a question about franchisetech?"}
            </h1>
            <p className="mt-5 text-lg leading-8 text-[#5B5D57]">
              {isRo
                ? "Configurare, casa de marcat sau contul dumneavoastră: lăsați un număr de telefon și vă sunăm în următoarea zi lucrătoare."
                : "Setup, your cash register or your account: leave a phone number and we call you back the next working day."}
            </p>
            <p className="mt-5 text-sm text-[#5B5D57]">
              {isRo ? "Preferați emailul? Scrieți-ne la " : "Prefer email? Write to "}
              <a href={`mailto:${EMAIL}`} className="font-medium text-[#0D0F0E] underline underline-offset-2">{EMAIL}</a>.
            </p>
            {DATA_CONTROLLER.legalName ? (
              <p className="mt-6 text-sm leading-6 text-[#8F8F86]">
                {DATA_CONTROLLER.legalName} · {DATA_CONTROLLER.registrationNumber}
                <br />
                {DATA_CONTROLLER.registeredAddress}
              </p>
            ) : null}
          </div>
          <ContactForm />
        </div>
      </section>
    </ClaudeMarketingShellAuth>
  );
}
