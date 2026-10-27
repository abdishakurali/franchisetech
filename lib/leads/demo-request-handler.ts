import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendDemoLeadEmail, salesInbox } from "@/lib/email/demo-lead";
import { captureServerEventAsync } from "@/lib/posthog-server";
import {
  RATE_LIMIT_WINDOW_MS,
  isHorecaFit,
  isRateLimited,
  leadAnalyticsProps,
  parseDemoLead,
  type DemoLead,
} from "@/lib/leads/demo-lead";

const MAX_BODY_BYTES = 10_000;
const DISTINCT_ID_RE = /^[A-Za-z0-9_$.-]{6,100}$/;

// Fallback only for when the demo_leads table is unavailable (e.g. before the
// migration is applied): per-instance, so weaker than the DB-backed limit.
const memoryHits = new Map<string, number[]>();

function hashIp(ip: string): string {
  const salt = process.env.LEAD_HASH_SALT ?? "franchisetech-demo-leads";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

function memoryRateLimited(ipHash: string, now: number): boolean {
  const hits = (memoryHits.get(ipHash) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  memoryHits.set(ipHash, hits);
  return isRateLimited(hits.length);
}

export type Store = {
  recentFromIp(ipHash: string, sinceIso: string): Promise<number | null>;
  recentDuplicate(email: string, sinceIso: string): Promise<boolean | null>;
  insert(lead: DemoLead, ipHash: string, consentAt: string): Promise<string | null>;
  markEmail(id: string, ok: boolean, error: string | null): Promise<void>;
};

async function supabaseStore(): Promise<Store> {
  const db = await createServiceClient();
  return {
    async recentFromIp(ipHash, sinceIso) {
      const { count, error } = await db.from("demo_leads").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", sinceIso);
      return error ? null : count ?? 0;
    },
    async recentDuplicate(email, sinceIso) {
      const { data, error } = await db.from("demo_leads").select("id").ilike("email", email).gte("created_at", sinceIso).limit(1);
      return error ? null : (data?.length ?? 0) > 0;
    },
    async insert(lead, ipHash, consentAt) {
      const { data, error } = await db
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
          source_article: lead.sourceArticle,
          cta_id: lead.ctaId,
          utm_source: lead.utmSource,
          utm_medium: lead.utmMedium,
          utm_campaign: lead.utmCampaign,
          ip_hash: ipHash,
          consent_at: consentAt,
        })
        .select("id")
        .single();
      if (error) {
        console.error("[demo-request] lead insert failed", error.code, error.message);
        return null;
      }
      return data.id as string;
    },
    async markEmail(id, ok, error) {
      const { error: updateError } = await db
        .from("demo_leads")
        .update(ok ? { email_status: "sent", notified_at: new Date().toISOString(), email_error: null } : { email_status: "failed", email_error: error?.slice(0, 300) ?? null })
        .eq("id", id);
      if (updateError) console.error("[demo-request] email status update failed", updateError.message);
    },
  };
}

export async function handleDemoRequest(request: Request, deps: { store: () => Promise<Store>; send: typeof sendDemoLeadEmail; capture: typeof captureServerEventAsync }) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: "Cererea este prea mare." }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }

  const now = Date.now();
  const result = parseDemoLead(body, now);
  // Spam gets the same response as success so bots learn nothing; nothing is stored or sent.
  if (!result.ok && result.spam) return NextResponse.json({ ok: true });
  if (!result.ok) return NextResponse.json({ error: "Verificați câmpurile marcate.", errors: result.errors }, { status: 400 });
  const lead = result.lead;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);
  const sinceIso = new Date(now - RATE_LIMIT_WINDOW_MS).toISOString();

  let store: Store | null = null;
  try {
    store = await deps.store();
  } catch (e) {
    console.error("[demo-request] store unavailable", e instanceof Error ? e.message : e);
  }

  const recent = store ? await store.recentFromIp(ipHash, sinceIso) : null;
  if (recent === null ? memoryRateLimited(ipHash, now) : isRateLimited(recent)) {
    return NextResponse.json({ error: "Ați trimis deja câteva cereri. Încercați din nou în câteva minute." }, { status: 429 });
  }

  // Double clicks / resubmits: the first request already reached the team.
  if (store && (await store.recentDuplicate(lead.email, sinceIso))) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const leadId = store ? await store.insert(lead, ipHash, new Date(now).toISOString()) : null;
  if (leadId === null) memoryHits.set(ipHash, [...(memoryHits.get(ipHash) ?? []), now]);

  const sent = await deps.send(lead, leadId);
  if (leadId && store) await store.markEmail(leadId, sent.success, sent.success ? null : sent.error);
  if (!sent.success) console.error("[demo-request] notification email failed", sent.error, leadId ? `(lead ${leadId} stored)` : "(lead NOT stored)");

  // Never claim success unless the lead is safe somewhere.
  if (!leadId && !sent.success) {
    return NextResponse.json(
      { error: `Cererea nu a putut fi trimisă acum. Scrieți-ne direct la ${salesInbox()} sau încercați din nou.` },
      { status: 503 },
    );
  }

  const distinctId = typeof body.ph_distinct_id === "string" && DISTINCT_ID_RE.test(body.ph_distinct_id)
    ? body.ph_distinct_id
    : `lead_${createHash("sha256").update(`${ipHash}:${now}`).digest("hex").slice(0, 20)}`;
  const props = { ...leadAnalyticsProps(lead), stored: Boolean(leadId), notified: sent.success };
  await deps.capture(distinctId, "demo_form_submitted", props);
  if (isHorecaFit(lead.businessType)) await deps.capture(distinctId, "qualified_lead", props);

  return NextResponse.json({ ok: true });
}

export function postDemoRequest(request: Request) {
  return handleDemoRequest(request, { store: supabaseStore, send: sendDemoLeadEmail, capture: captureServerEventAsync });
}
