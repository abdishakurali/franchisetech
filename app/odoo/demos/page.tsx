import type { Metadata } from "next";
import Link from "next/link";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { ODOO_VERSIONS, odooStoreUrl } from "@/lib/marketing/odoo-apps";
import { ODOO_DEMOS } from "@/lib/marketing/odoo-demos";

export const metadata: Metadata = {
  title: "Odoo app demos | SALUT TECH SRL",
  description:
    "Watch nine of our Odoo apps working in Odoo 19 with demo data: the Romanian fiscal printer for POS, shelf labels, Zebra ZPL labels, POS network printers, S3 storage, MCP for Claude, Power BI feeds, field access rights and credit hold.",
  alternates: { canonical: "/odoo/demos" },
};

const versions = ODOO_VERSIONS.map((v) => v.replace(".0", ""));
const versionRange = `${versions[0]} to ${versions[versions.length - 1]}`;

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function OdooDemosPage() {
  const h2 = "font-[family-name:var(--font-display)] text-2xl font-semibold text-[#0D0F0E] sm:text-3xl";

  return (
    <ClaudeMarketingShellAuth>
      <div lang="en" className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#165DFC]">Odoo apps · SALUT TECH SRL</p>
            <Link href="/odoo" className="shrink-0 text-sm font-medium text-[#0D0F0E] underline underline-offset-2">
              Odoo services
            </Link>
          </div>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold text-[#0D0F0E] sm:text-5xl">
            Odoo app demos
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5B5D57]">Watch each app working in Odoo 19 with demo data.</p>

          <div className="mt-6 max-w-3xl rounded-lg border border-[#0D0F0E]/10 bg-white p-5 text-sm leading-6 text-[#5B5D57]">
            <p>
              Each video is a real session in the Odoo web client: real clicks and typing on a throwaway Odoo 19 Community database with
              demo data and no personal data. Waiting time while the server loaded was cut, and the title cards and captions were added.
              Under each video we say what was simulated and what is not shown.
            </p>
            <p className="mt-2">
              <strong className="text-[#0D0F0E]">Only Odoo 19 was recorded.</strong> The apps support Odoo {versionRange}; each Apps Store page has a
              version selector.
            </p>
          </div>

          <nav aria-label="Apps on this page" className="mt-8">
            <ul className="flex flex-wrap gap-2">
              {ODOO_DEMOS.map((demo) => (
                <li key={demo.tech}>
                  <a
                    href={`#${demo.tech}`}
                    className="inline-flex min-h-10 items-center rounded-md border border-[#0D0F0E]/15 bg-white px-3 text-sm font-medium text-[#0D0F0E] hover:border-[#165DFC]"
                  >
                    {demo.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-16">
            {ODOO_DEMOS.map((demo) => (
              <section key={demo.tech} id={demo.tech} className="scroll-mt-24" aria-labelledby={`${demo.tech}-title`}>
                <div className="overflow-hidden rounded-lg border border-[#0D0F0E]/10 bg-[#0D0F0E]">
                  <video
                    controls
                    preload="none"
                    playsInline
                    width={1280}
                    height={720}
                    poster={`/odoo/demos/${demo.tech}/poster.jpg`}
                    className="block aspect-video h-auto w-full"
                    aria-label={`${demo.name} demo video, ${duration(demo.seconds)}`}
                  >
                    <source src={`/odoo/demos/${demo.tech}/demo.mp4`} type="video/mp4" />
                    Your browser cannot play this video.{" "}
                    <a href={`/odoo/demos/${demo.tech}/demo.mp4`}>Download the MP4</a>.
                  </video>
                </div>
                <div className="mt-5 grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
                  <div>
                    <h2 id={`${demo.tech}-title`} className={h2}>
                      {demo.name}
                    </h2>
                    <p className="mt-3 text-base leading-7 text-[#5B5D57]">{demo.summary}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <a
                        href={odooStoreUrl(demo.tech)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center rounded-md bg-[#0D0F0E] px-5 text-sm font-semibold text-white"
                      >
                        Get it on the Odoo Apps Store
                      </a>
                      <span className="text-sm text-[#5B5D57]">
                        €{demo.priceEur} · video {duration(demo.seconds)}
                      </span>
                    </div>
                  </div>
                  <p className="rounded-lg border border-[#0D0F0E]/10 bg-[#0D0F0E]/[0.03] p-4 text-sm leading-6 text-[#5B5D57]">
                    <strong className="text-[#0D0F0E]">What to know: </strong>
                    {demo.note} Recorded on Odoo 19 only; the app supports Odoo {versionRange}.
                  </p>
                </div>
              </section>
            ))}
          </div>

          <section className="mt-16 rounded-lg border border-[#0D0F0E]/10 bg-white p-6">
            <h2 className={h2}>Need one of these set up for you?</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[#5B5D57]">
              We install and configure our apps, connect Odoo to your other systems and quote a fixed price before we start. Prices above
              are the Apps Store licence prices in EUR, checked on 8 and 11 November 2026.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/odoo#contact" className="inline-flex min-h-12 items-center rounded-md bg-[#0D0F0E] px-5 text-sm font-semibold text-white">
                Get a free fixed-price quote
              </Link>
              <Link href="/odoo" className="inline-flex min-h-12 items-center rounded-md border border-[#0D0F0E]/20 bg-white px-5 text-sm font-semibold text-[#0D0F0E]">
                Odoo services and prices
              </Link>
            </div>
          </section>
        </div>
      </div>
    </ClaudeMarketingShellAuth>
  );
}
