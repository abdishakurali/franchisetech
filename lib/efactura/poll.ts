// Polls ANAF /stareMesaj for uploaded invoices and stores the result.
// Shared by POST /api/efactura/poll and the daily /api/cron/efactura.

import type { SupabaseClient } from "@supabase/supabase-js";
import { checkStatus, downloadReceipt } from "@/lib/anaf/client";
import { getOrgAccessToken } from "@/lib/anaf/auth";

export type PollResult = { id: string; organisationId: string; stare: string; error?: string };

export async function pollUploadedInvoices(supabase: SupabaseClient, organisationId?: string): Promise<PollResult[]> {
  const now = new Date().toISOString();
  let query = supabase
    .from("efactura_invoices")
    .select("id,organisation_id,index_incarcare,retry_count,next_retry_at")
    .eq("upload_status", "uploaded")
    .or("processing_status.is.null,processing_status.eq.in prelucrare")
    .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
    .limit(50);
  if (organisationId) query = query.eq("organisation_id", organisationId);
  const { data: pending, error } = await query;
  if (error) throw new Error(error.message);

  const results: PollResult[] = [];
  for (const inv of pending ?? []) {
    if (!inv.index_incarcare) continue;
    try {
      const accessToken = await getOrgAccessToken(inv.organisation_id);
      const status = await checkStatus(inv.index_incarcare, accessToken);
      const update: Record<string, unknown> = {
        processing_status: status.stare,
        updated_at: new Date().toISOString(),
        next_retry_at: new Date(Date.now() + 60_000).toISOString(),
        retry_count: (inv.retry_count ?? 0) + 1,
      };
      if (status.stare === "ok") {
        // Accepted even if the receipt download fails; the zip can be fetched later.
        update.upload_status = "accepted";
        if (status.idDescarcare) {
          update.id_descarcare = status.idDescarcare;
          try { update.zip_content = await downloadReceipt(status.idDescarcare, accessToken); } catch (dlErr) {
            console.error("[efactura/poll] download failed:", dlErr);
          }
        }
      } else if (status.stare === "nok") {
        update.upload_status = "rejected";
        update.error_message = status.eroare ?? "ANAF a respins factura (nok)";
        if (status.idDescarcare) {
          update.id_descarcare = status.idDescarcare;
          try { update.zip_content = await downloadReceipt(status.idDescarcare, accessToken); } catch { /* non-fatal */ }
        }
      } else if (status.stare === "XML cu erori nepreluat de sistem") {
        update.upload_status = "rejected";
        update.error_message = "XML cu erori nepreluat de sistem";
      }
      await supabase.from("efactura_invoices").update(update).eq("id", inv.id);
      results.push({ id: inv.id, organisationId: inv.organisation_id, stare: status.stare });
    } catch (err) {
      const backoffMs = Math.min(Math.pow(2, (inv.retry_count ?? 0) + 1) * 60_000, 3_600_000);
      await supabase.from("efactura_invoices").update({
        retry_count: (inv.retry_count ?? 0) + 1,
        next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", inv.id);
      results.push({ id: inv.id, organisationId: inv.organisation_id, stare: "error", error: String(err) });
    }
  }
  return results;
}
