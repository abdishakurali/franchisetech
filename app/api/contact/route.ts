import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { sendContactLeadEmail } from "@/lib/email/contact-lead";
import { captureServerEventAsync } from "@/lib/posthog-server";

const recentRequests = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

function text(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function validContact(value: string) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const phoneDigits = value.replace(/\D/g, "").length;
  return isEmail || phoneDigits >= 7;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    if (now - (recentRequests.get(ip) ?? 0) < RATE_LIMIT_MS) {
      return NextResponse.json({ error: "Așteptați un minut înainte de a trimite din nou." }, { status: 429 });
    }
    const body = await request.json();
    if (text(body.website, 200)) return NextResponse.json({ ok: true });

    const lead = {
      name: text(body.name, 100),
      contact: text(body.contact, 160),
      businessType: text(body.businessType, 100),
      locations: text(body.locations, 20),
      message: text(body.message, 1500),
      source: text(body.source, 80) || "website",
      utmSource: text(body.utm_source, 120) || undefined,
      utmCampaign: text(body.utm_campaign, 120) || undefined,
      utmContent: text(body.utm_content, 120) || undefined,
    };
    // Only the phone/email and the GDPR consent are required. Name, business
    // type and message are optional — a callback request should cost the owner
    // one field, not five.
    if (!validContact(lead.contact)) {
      return NextResponse.json({ error: "Introduceți un număr de telefon valid (sau un email)." }, { status: 400 });
    }
    if (body.consent !== "on") {
      return NextResponse.json({ error: "Bifați acordul de confidențialitate ca să vă putem răspunde." }, { status: 400 });
    }

    const result = await sendContactLeadEmail(lead);
    if (!result.success) return NextResponse.json({ error: "Cererea nu a putut fi trimisă. Scrieți la info@franchisetech.ro." }, { status: 500 });
    recentRequests.set(ip, now);
    const anonymousId = `lead_${createHash("sha256").update(`${ip}:${lead.contact.toLowerCase()}`).digest("hex").slice(0, 20)}`;
    await captureServerEventAsync(anonymousId, "qualified_lead", { source: lead.source, business_type: lead.businessType, locations: lead.locations });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
}
