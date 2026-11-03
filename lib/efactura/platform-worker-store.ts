// Supabase store and ANAF adapter for the platform upload worker.

import type { SupabaseClient } from "@supabase/supabase-js";
import { AnafApiError, uploadDocument, validateXml } from "@/lib/anaf/client";
import { AnafRefusal, type AnafPort, type WorkerInvoice, type WorkerStore } from "@/lib/efactura/platform-worker";

const OPEN_STATUSES = ["ready", "uploading", "uploaded", "upload_unknown"];

export function supabaseWorkerStore(db: SupabaseClient, orgId: string): WorkerStore {
  return {
    async listOpen() {
      const { data, error } = await db.from("efactura_invoices")
        .select("id,invoice_number,issue_date,upload_status,xml_content,storno_of,updated_at,error_message")
        .eq("organisation_id", orgId).in("upload_status", OPEN_STATUSES).order("issue_date").limit(200);
      if (error) throw new Error(`worker list failed: ${error.message}`);
      return (data ?? []).map((r): WorkerInvoice => ({
        id: r.id, invoiceNumber: r.invoice_number, issueDate: r.issue_date, uploadStatus: r.upload_status,
        xml: r.xml_content, stornoOf: r.storno_of, updatedAt: r.updated_at, errorMessage: r.error_message,
      }));
    },
    async claim(id) {
      const { data, error } = await db.from("efactura_invoices")
        .update({ upload_status: "uploading", updated_at: new Date().toISOString() })
        .eq("organisation_id", orgId).eq("id", id).eq("upload_status", "ready").select("id");
      if (error) throw new Error(`worker claim failed: ${error.message}`);
      return (data ?? []).length === 1;
    },
    async markUploaded(id, indexIncarcare) {
      const { error } = await db.from("efactura_invoices")
        .update({ upload_status: "uploaded", index_incarcare: indexIncarcare, processing_status: null, error_message: null, updated_at: new Date().toISOString() })
        .eq("organisation_id", orgId).eq("id", id);
      if (error) throw new Error(`worker save failed after upload ${indexIncarcare}: ${error.message}`);
    },
    async markBack(id, status, message) {
      const { error } = await db.from("efactura_invoices")
        .update({ upload_status: status, error_message: message, updated_at: new Date().toISOString() })
        .eq("organisation_id", orgId).eq("id", id);
      if (error) throw new Error(`worker update failed: ${error.message}`);
    },
    async statusOf(id) {
      const { data } = await db.from("efactura_invoices").select("upload_status").eq("organisation_id", orgId).eq("id", id).maybeSingle();
      return (data?.upload_status as string | undefined) ?? null;
    },
  };
}

/**
 * Only an HTTP error status from ANAF is a refusal (nothing was accepted).
 * A network failure, or a 200 without an upload index, is an unknown outcome.
 */
export const anafPort: AnafPort = {
  validate: (xml) => validateXml(xml),
  async upload(xml, cif, accessToken) {
    try {
      return await uploadDocument(xml, cif, accessToken, "prod");
    } catch (e) {
      if (e instanceof AnafApiError && e.statusCode >= 400) throw new AnafRefusal(e.responseBody.slice(0, 300) || e.message, e.statusCode);
      throw e;
    }
  },
};
