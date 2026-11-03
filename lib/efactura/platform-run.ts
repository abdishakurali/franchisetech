// One run of SALUT TECH's e-Factura pipeline: validate and upload the queue,
// poll ANAF for results, then send one digest email with anything that needs
// a human. Nothing happens unless PLATFORM_BILLING_ORG_ID is set; uploads
// happen only when PLATFORM_EFACTURA_UPLOAD=1 (otherwise: validate + report).

import { createServiceClient } from "@/lib/supabase/server";
import { getOrgAccessToken } from "@/lib/anaf/auth";
import { runPlatformUpload, type WorkerReport } from "@/lib/efactura/platform-worker";
import { anafPort, supabaseWorkerStore } from "@/lib/efactura/platform-worker-store";
import { pollUploadedInvoices } from "@/lib/efactura/poll";
import { sendPlainAlert } from "@/lib/email/plain-alert";
import { PLATFORM_SELLER } from "@/lib/legal/controller";

export type PlatformRunResult =
  | { skipped: string }
  | (WorkerReport & { rejected: string[]; held: number; pollError: string | null; uploadEnabled: boolean; digestSent: boolean });

export async function runPlatformEfactura(): Promise<PlatformRunResult> {
  const orgId = process.env.PLATFORM_BILLING_ORG_ID?.trim();
  if (!orgId) return { skipped: "PLATFORM_BILLING_ORG_ID not set" };

  const db = await createServiceClient();
  const uploadEnabled = process.env.PLATFORM_EFACTURA_UPLOAD === "1";
  const report = await runPlatformUpload({
    store: supabaseWorkerStore(db, orgId),
    anaf: anafPort,
    cif: PLATFORM_SELLER.cui,
    accessToken: () => getOrgAccessToken(orgId),
    uploadEnabled,
  });

  let pollError: string | null = null;
  const rejected: string[] = [];
  try {
    const polled = await pollUploadedInvoices(db, orgId);
    const refused = polled.filter((p) => p.stare === "nok" || p.stare === "XML cu erori nepreluat de sistem");
    if (refused.length > 0) {
      const { data } = await db.from("efactura_invoices").select("invoice_number,error_message")
        .eq("organisation_id", orgId).in("id", refused.map((p) => p.id));
      for (const r of data ?? []) rejected.push(`Factura ${r.invoice_number} a fost respinsă de ANAF: ${r.error_message ?? "fără detalii"}`);
    }
  } catch (e) {
    pollError = e instanceof Error ? e.message : String(e);
  }

  const { data: held } = await db.from("efactura_invoices").select("invoice_number,error_message")
    .eq("organisation_id", orgId).eq("upload_status", "needs_data").limit(20);
  const lines = [
    ...report.alerts,
    ...rejected,
    ...(held ?? []).map((h) => `Factură oprită (date lipsă): ${h.error_message ?? h.invoice_number}`),
    ...(pollError ? [`Verificarea statusului la ANAF a eșuat: ${pollError}`] : []),
  ];
  let digestSent = false;
  if (lines.length > 0) {
    digestSent = await sendPlainAlert(
      `e-Factura franchisetech: ${lines.length} de verificat`,
      `${lines.map((l) => `• ${l}`).join("\n")}\n\nMod: ${uploadEnabled ? "trimitere automată" : "doar validare (nu se trimite nimic la ANAF)"}.`,
    );
    if (!digestSent) console.error("efactura_digest_failed", lines);
  }
  return { ...report, rejected, held: held?.length ?? 0, pollError, uploadEnabled, digestSent };
}
