export const dynamic = "force-dynamic";

// POST /api/efactura/poll
// Polls ANAF /stareMesaj for all "uploaded" invoices and downloads receipts.
// Requires: Authorization: Bearer <CRON_SECRET>
// Schedule: run every 60 seconds via n8n workflow or external cron.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkStatus, downloadReceipt } from "@/lib/anaf/client";
import { getOrgAccessToken } from "@/lib/anaf/auth";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date().toISOString();

  const { data: pending, error } = await supabase
    .from("efactura_invoices")
    .select("id,organisation_id,index_incarcare,retry_count,next_retry_at")
    .eq("upload_status", "uploaded")
    .or("processing_status.is.null,processing_status.eq.in prelucrare")
    .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
    .limit(50);

  if (error) {
    console.error("[efactura/poll] query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{ id: string; stare: string; error?: string }> = [];

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

      if (status.stare === "ok" && status.idDescarcare) {
        try {
          const zipBuffer = await downloadReceipt(status.idDescarcare, accessToken);
          update.zip_content = zipBuffer;
          update.id_descarcare = status.idDescarcare;
          update.upload_status = "accepted";
        } catch (dlErr) {
          console.error("[efactura/poll] download failed:", dlErr);
        }
      } else if (status.stare === "nok" && status.idDescarcare) {
        try {
          const zipBuffer = await downloadReceipt(status.idDescarcare, accessToken);
          update.zip_content = zipBuffer;
          update.id_descarcare = status.idDescarcare;
        } catch { /* non-fatal */ }

        update.upload_status = "rejected";
        update.error_message = status.eroare ?? "ANAF a respins factura (nok)";

        void fetch("https://n8n.franchisetech.ro/webhook/efactura-rejected", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceId: inv.id,
            organisationId: inv.organisation_id,
            error: status.eroare,
          }),
        }).catch(() => {});
      } else if (status.stare === "XML cu erori nepreluat de sistem") {
        update.upload_status = "rejected";
        update.error_message = "XML cu erori nepreluat de sistem";
      }

      await supabase
        .from("efactura_invoices")
        .update(update)
        .eq("id", inv.id);

      results.push({ id: inv.id, stare: status.stare });
    } catch (err) {
      const backoffMs = Math.min(Math.pow(2, (inv.retry_count ?? 0) + 1) * 60_000, 3_600_000);
      await supabase
        .from("efactura_invoices")
        .update({
          retry_count: (inv.retry_count ?? 0) + 1,
          next_retry_at: new Date(Date.now() + backoffMs).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", inv.id);
      results.push({ id: inv.id, stare: "error", error: String(err) });
    }
  }

  return NextResponse.json({ polled: results.length, results });
}
