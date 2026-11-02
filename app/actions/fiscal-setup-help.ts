"use server";

import { getActiveOrg } from "@/lib/kitchenops/data";
import { createServiceClient } from "@/lib/supabase/server";
import { sendDemoLeadEmail, salesInbox } from "@/lib/email/demo-lead";
import { captureServerEventAsync } from "@/lib/posthog-server";
import { isTestLead } from "@/lib/leads/demo-lead";
import { buildFiscalSetupLead, FISCAL_SETUP_CTA_ID, parseHelpPhone } from "@/lib/leads/fiscal-setup-help";
import type { LocationBand } from "@/lib/business-profile";

export type FiscalSetupHelpResult = { ok: true; duplicate?: boolean } | { ok: false; error: string };

const DUPLICATE_WINDOW_MS = 24 * 60 * 60_000;

/**
 * A signed-in owner asks us to connect their cash register for them.
 * Stored as a demo_leads row (cta_id = fiscal_setup_help) and emailed to the
 * sales inbox. Repeated clicks within 24h return the first request instead of
 * creating another. Success is only reported once the request is stored or
 * the email went out.
 */
export async function requestFiscalSetupHelp(input: {
  phone: string;
  deviceBrand: string | null;
  lastProbeMessage: string | null;
}): Promise<FiscalSetupHelpResult> {
  const { supabase, user, profile, orgId } = await getActiveOrg();
  if (!user.email) return { ok: false, error: "Contul nu are o adresă de email." };

  const phone = parseHelpPhone(input.phone);
  if (!phone.ok) return { ok: false, error: phone.error };

  const { data: org } = await supabase
    .from("organisations")
    .select("name, business_type, location_band")
    .eq("id", orgId)
    .maybeSingle();

  const lead = buildFiscalSetupLead({
    orgName: (org?.name as string) ?? "",
    contactName: ((profile?.full_name as string | null) ?? (user.user_metadata?.full_name as string | undefined) ?? "").trim(),
    email: user.email,
    phone: phone.phone,
    businessType: (org?.business_type as string | null) ?? null,
    locationBand: (org?.location_band as LocationBand | null) ?? null,
    deviceBrand: input.deviceBrand,
    lastProbeMessage: input.lastProbeMessage,
  });

  const service = await createServiceClient();
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();
  const { data: existing } = await service
    .from("demo_leads")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("cta_id", FISCAL_SETUP_CTA_ID)
    .gte("created_at", since)
    .limit(1);
  if (existing?.length) return { ok: true, duplicate: true };

  const test = isTestLead(lead);
  const { data: inserted, error: insertError } = await service
    .from("demo_leads")
    .insert({
      business_name: lead.businessName,
      contact_name: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      business_type: lead.businessType,
      locations: lead.locations,
      message: lead.message,
      source_page: lead.sourcePage,
      cta_id: lead.ctaId,
      consent_at: new Date().toISOString(),
      organisation_id: orgId,
      is_test: test,
      status: test ? "test" : "new",
    })
    .select("id")
    .single();
  if (insertError) console.error("[fiscal-setup-help] insert failed", insertError.code, insertError.message);
  const leadId = (inserted?.id as string | undefined) ?? null;

  const sent = await sendDemoLeadEmail(lead, leadId, "fiscal_setup");
  if (leadId) {
    await service
      .from("demo_leads")
      .update(sent.success
        ? { email_status: "sent", notified_at: new Date().toISOString(), email_error: null }
        : { email_status: "failed", email_error: sent.error.slice(0, 300) })
      .eq("id", leadId);
  }
  if (!sent.success) console.error("[fiscal-setup-help] notification email failed", sent.error);

  if (!leadId && !sent.success) {
    return { ok: false, error: `Cererea nu a putut fi trimisă acum. Scrieți-ne la ${salesInbox()} sau încercați din nou.` };
  }

  await captureServerEventAsync(user.id, "fiscal_setup_help_requested", {
    organisation_id: orgId,
    device_brand: input.deviceBrand,
    stored: Boolean(leadId),
    notified: sent.success,
    is_test: test,
  });
  return { ok: true };
}
