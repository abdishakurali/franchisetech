import type { Metadata } from "next";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";

export const metadata: Metadata = {
  title: "Autorizare e-Factura franchisetech",
  robots: { index: false, follow: false },
};

// Where ANAF sends whoever opened a signed authorisation link — often the
// customer's accountant, who has no franchisetech account.
export default async function AnafAuthorisationResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; msg?: string }>;
}) {
  const { status, msg } = await searchParams;
  const ok = status === "connected";
  return (
    <ClaudeMarketingShellAuth>
      <main lang="ro" className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {ok ? "Autorizarea e-Factura a reușit" : "Autorizarea e-Factura nu a reușit"}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-700">
          {ok
            ? "franchisetech poate acum trimite facturile acestei firme în SPV. Autorizarea este valabilă până la un an și se reînnoiește automat cât timp este folosită. Puteți închide această pagină."
            : msg === "cif_required"
              ? "Firma nu are CUI completat în franchisetech. Completați CUI-ul în Setări și cereți un link nou."
              : msg === "server_config"
                ? "Conexiunea cu ANAF nu este încă configurată la noi. Nu s-a trimis nimic. Vă rugăm să ne scrieți la info@franchisetech.ro."
                : "ANAF nu a confirmat autorizarea. Linkul poate fi expirat (este valabil 7 zile) sau certificatul nu are drepturi SPV pentru această firmă. Cereți un link nou și încercați din nou."}
        </p>
      </main>
    </ClaudeMarketingShellAuth>
  );
}
