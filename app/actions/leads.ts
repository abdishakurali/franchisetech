"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isLeadAdmin } from "@/lib/leads/admin";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/demo-lead";
import { clean } from "@/lib/leads/demo-lead";

export type UpdateLeadResult = { ok: true } | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Update a demo lead's status, next action and notes. Lead admins only. */
export async function updateLead(formData: FormData): Promise<UpdateLeadResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isLeadAdmin(user)) return { ok: false, error: "Nu aveți acces." };

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;
  const nextAction = clean(formData.get("next_action"), 200) || null;
  const dueRaw = String(formData.get("next_action_due") ?? "").trim();
  const notes = clean(formData.get("notes"), 2000, { multiline: true }) || null;

  if (!UUID_RE.test(id)) return { ok: false, error: "Cerere necunoscută." };
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) return { ok: false, error: "Status invalid." };
  if (dueRaw && (!DATE_RE.test(dueRaw) || Number.isNaN(Date.parse(dueRaw)))) return { ok: false, error: "Dată invalidă." };

  const service = await createServiceClient();
  const { data: current, error: readError } = await service.from("demo_leads").select("status").eq("id", id).maybeSingle();
  if (readError || !current) return { ok: false, error: "Cerere necunoscută." };

  const { error } = await service
    .from("demo_leads")
    .update({
      status,
      next_action: nextAction,
      next_action_due: dueRaw || null,
      notes,
      ...(current.status !== status ? { status_changed_at: new Date().toISOString() } : {}),
      ...(status === "test" ? { is_test: true } : {}),
    })
    .eq("id", id);
  if (error) {
    console.error("[leads] update failed", error.code, error.message);
    return { ok: false, error: "Nu s-a putut salva. Încercați din nou." };
  }
  revalidatePath("/app/leads");
  return { ok: true };
}
