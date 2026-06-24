import { createClient } from "@supabase/supabase-js";

export type PartnerWaitlistInsert = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  partnerType: string;
  horecaClientCount?: string;
  message: string;
  utmSource?: string;
  utmCampaign?: string;
  utmContent?: string;
};

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function insertPartnerWaitlist(
  payload: PartnerWaitlistInsert,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = serviceClient();
  if (!supabase) {
    return { ok: false, error: "Database not configured" };
  }

  const { error } = await supabase.from("partner_waitlist").insert({
    name: payload.name,
    company: payload.company,
    email: payload.email,
    phone: payload.phone ?? null,
    country: payload.country,
    partner_type: payload.partnerType,
    horeca_client_count: payload.horecaClientCount ?? null,
    message: payload.message,
    utm_source: payload.utmSource ?? null,
    utm_campaign: payload.utmCampaign ?? null,
    utm_content: payload.utmContent ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
