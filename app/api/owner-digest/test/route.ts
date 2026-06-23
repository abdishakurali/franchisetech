import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { fetchOwnerDigestData } from "@/lib/owner-digest/fetch";
import { sendOwnerDigestEmail } from "@/lib/email/owner-digest";
import { fetchOrgModuleFlags } from "@/lib/org-module-flags";
import { isModuleEnabled } from "@/lib/business-modules";

const DEFAULT_TEST_EMAIL = "sherif.abdala@gmail.com";

// POST /api/owner-digest/test
// Owner/manager only. Sends a sample digest (weekly window) to test recipient.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("organisation_members")
    .select(
      "role, organisation_id, organisations(id, name, country_code, currency_code, owner_digest_frequency, owner_digest_timezone)"
    )
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const moduleFlags = await fetchOrgModuleFlags(supabase, membership.organisation_id);
  if (!isModuleEnabled(moduleFlags, "inventory")) {
    return NextResponse.json({ error: "Inventory module required" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const toEmail: string = (body as { email?: string }).email ?? DEFAULT_TEST_EMAIL;

  const orgs = membership.organisations as unknown as
    | {
        id: string;
        name: string;
        country_code: string | null;
        currency_code: string | null;
        owner_digest_frequency: string | null;
        owner_digest_timezone: string | null;
      }
    | Array<{
        id: string;
        name: string;
        country_code: string | null;
        currency_code: string | null;
        owner_digest_frequency: string | null;
        owner_digest_timezone: string | null;
      }>
    | null;

  const org = Array.isArray(orgs) ? orgs[0] : orgs;
  const orgId = org?.id ?? membership.organisation_id;
  const orgName = org?.name ?? "Your business";
  const countryCode = org?.country_code ?? null;
  const currency = org?.currency_code ?? "EUR";
  const frequency =
    org?.owner_digest_frequency === "daily" ? "daily" : "weekly";
  const timeZone = org?.owner_digest_timezone ?? "Europe/Bucharest";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const dataClient =
    serviceKey && supabaseUrl
      ? createServiceClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
      : supabase;

  const digestData = await fetchOwnerDigestData(dataClient, {
    orgId,
    orgName,
    countryCode,
    currency,
    frequency,
    timeZone,
  });

  const result = await sendOwnerDigestEmail({ to: [toEmail], data: digestData });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, messageId: result.messageId, to: toEmail });
}
