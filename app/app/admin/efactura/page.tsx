import { notFound, redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isLeadAdmin } from "@/lib/leads/admin";
import { getAuthorizationUrl } from "@/lib/anaf/auth";
import { authLinkSecret, signAuthState } from "@/lib/anaf/auth-link";

export const metadata = { title: "e-Factura SALUT TECH", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  needs_data: "Date lipsă",
  draft: "Ciornă",
  ready: "Gata de trimis",
  uploading: "Se trimite",
  uploaded: "Trimisă, așteaptă ANAF",
  accepted: "Acceptată de ANAF",
  rejected: "Respinsă de ANAF",
  invalid: "Nu trece validarea",
  upload_unknown: "De verificat în SPV",
};

/**
 * SALUT TECH's own e-Factura (franchisetech subscriptions). Founder only:
 * hidden (404) for everyone who isn't a lead admin, like /app/leads. Shows the
 * ANAF connection, a signed link for the accountant, and every invoice with
 * ANAF's own error text.
 */
export default async function PlatformEfacturaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isLeadAdmin(user)) notFound();

  const orgId = process.env.PLATFORM_BILLING_ORG_ID?.trim();
  const clientId = process.env.ANAF_CLIENT_ID?.trim();
  const secret = authLinkSecret();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://franchisetech.ro";
  const service = await createServiceClient();

  const token = orgId
    ? (await service.from("anaf_oauth_tokens").select("expires_at,updated_at").eq("organisation_id", orgId).maybeSingle()).data
    : null;
  const invoices = orgId
    ? (await service.from("efactura_invoices")
        .select("id,invoice_number,issue_date,buyer_name,total_incl_vat,currency,upload_status,processing_status,error_message,storno_of")
        .eq("organisation_id", orgId).order("created_at", { ascending: false }).limit(50)).data ?? []
    : [];
  const authLink = orgId && clientId && secret
    ? getAuthorizationUrl(clientId, `${siteUrl}/api/anaf/auth/callback`, signAuthState(orgId, secret))
    : null;

  return (
    <div lang="ro" className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">e-Factura SALUT TECH</h1>
        <p className="mt-1 text-sm text-muted-foreground">Facturile pentru abonamentele franchisetech, trimise în SPV.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 text-sm">
        <h2 className="font-semibold text-foreground">Conexiunea cu ANAF</h2>
        <ul className="mt-3 space-y-1 text-muted-foreground">
          <li>Organizație: {orgId ? "configurată" : "lipsește PLATFORM_BILLING_ORG_ID"}</li>
          <li>Aplicație ANAF (OAuth): {clientId ? "înregistrată" : "neînregistrată (ANAF_CLIENT_ID lipsește)"}</li>
          <li>Autorizare: {token ? `activă, token reînnoit la ${new Date(token.updated_at).toLocaleDateString("ro-RO")}` : "lipsă"}</li>
          <li>Facturi la plată: {process.env.PLATFORM_INVOICING === "1" ? "se creează automat" : "oprite (PLATFORM_INVOICING, după ce contabilul alege seria)"}</li>
          <li>Trimitere: {process.env.PLATFORM_EFACTURA_UPLOAD === "1" ? "automată" : "oprită (doar validare)"}</li>
        </ul>
        {authLink ? (
          <div className="mt-4">
            <p className="font-medium text-foreground">Link de autorizare (valabil 7 zile)</p>
            <p className="mt-1 text-muted-foreground">
              Deschideți-l cu certificatul introdus, sau trimiteți-l contabilului: semnează pe site-ul ANAF cu un certificat care are drepturi SPV pentru CUI 49702253.
            </p>
            <textarea readOnly value={authLink} className="mt-2 h-24 w-full rounded-md border border-border bg-background p-2 font-mono text-xs" />
          </div>
        ) : null}
      </section>

      <section>
        <h2 className="font-semibold text-foreground">Facturi</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nicio factură încă.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground">
                <tr><th className="p-2">Număr</th><th className="p-2">Data</th><th className="p-2">Client</th><th className="p-2">Total</th><th className="p-2">Status</th><th className="p-2">Detalii</th></tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-border align-top">
                    <td className="p-2 font-mono">{i.invoice_number}{i.storno_of ? " (storno)" : ""}</td>
                    <td className="p-2">{i.issue_date}</td>
                    <td className="p-2">{i.buyer_name}</td>
                    <td className="p-2 tabular-nums">{Number(i.total_incl_vat).toFixed(2)} {i.currency}</td>
                    <td className="p-2">{STATUS_LABELS[i.upload_status] ?? i.upload_status}</td>
                    <td className="p-2 text-xs text-muted-foreground">{i.error_message ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
