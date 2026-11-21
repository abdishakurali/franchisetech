import Link from "next/link";

/**
 * Customer proof numbers under the home video (content audit 2026-11-21, item 3).
 *
 * OFF until the customer gives written consent to publish their name and
 * numbers on the home page. Do not fill in a real customer's name, figures or
 * logo here before that consent is recorded.
 *
 * To turn on:
 *  1. Record the consent (who, date, which numbers) in docs or the lead file.
 *  2. Replace every PLACEHOLDER below with numbers read from the database on a
 *     stated date, and keep the date in the text.
 *  3. Set SHOW_CUSTOMER_PROOF to true.
 */
export const SHOW_CUSTOMER_PROOF = false;

type ProofStat = { value: string; label: string };

const PROOF: { asOf: string; stats: ProofStat[]; caseStudyHref: string; linkLabel: string } = {
  asOf: "PLACEHOLDER: data verificării, ex. „la 1 decembrie 2026”",
  stats: [
    { value: "PLACEHOLDER", label: "vânzări transmise fără eroare către FiscalNet" },
    { value: "PLACEHOLDER", label: "închideri de casă finalizate" },
  ],
  caseStudyHref: "PLACEHOLDER: link către pagina de caz",
  linkLabel: "Citiți povestea completă",
};

export function CustomerProofBlock() {
  if (!SHOW_CUSTOMER_PROOF) return null;
  return (
    <div className="mt-5">
      <dl className="grid grid-cols-2 gap-4">
        {PROOF.stats.map((stat) => (
          <div key={stat.label}>
            <dt className="text-sm text-slate-600">{stat.label}</dt>
            <dd className="text-2xl font-semibold text-slate-900">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate-500">
        Date din aplicație, {PROOF.asOf}.{" "}
        <Link href={PROOF.caseStudyHref} className="underline underline-offset-2">
          {PROOF.linkLabel}
        </Link>
      </p>
    </div>
  );
}
