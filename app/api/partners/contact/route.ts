import { NextResponse } from "next/server";
import { sendPartnerLeadEmail } from "@/lib/email/partner-lead";
import { insertPartnerWaitlist } from "@/lib/partner-waitlist";

const rateLimit = new Map<string, number>();
const RATE_MS = 60_000;

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const last = rateLimit.get(ip) ?? 0;
    if (now - last < RATE_MS) {
      return NextResponse.json({ error: "Așteptați înainte de a trimite din nou." }, { status: 429 });
    }

    const body = await request.json();
    const website = String(body.website ?? "").trim();
    if (website) {
      return NextResponse.json({ ok: true });
    }

    const name = String(body.name ?? "").trim();
    const company = String(body.company ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const country = String(body.country ?? "").trim();
    const partnerType = String(body.partnerType ?? "").trim();
    const horecaClientCount = String(body.horecaClientCount ?? "").trim();
    const message = String(body.message ?? "").trim();
    const waitlist = body.waitlist !== false;
    const utmSource = String(body.utm_source ?? "").trim() || undefined;
    const utmCampaign = String(body.utm_campaign ?? "").trim() || undefined;
    const utmContent = String(body.utm_content ?? "").trim() || undefined;

    if (!name || !company || !email || !country || !partnerType || !message) {
      return NextResponse.json({ error: "Completați toate câmpurile obligatorii." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Introduceți o adresă de email validă." }, { status: 400 });
    }

    const dbResult = await insertPartnerWaitlist({
      name,
      company,
      email,
      phone: phone || undefined,
      country,
      partnerType,
      horecaClientCount: horecaClientCount || undefined,
      message,
      utmSource,
      utmCampaign,
      utmContent,
    });

    if (!dbResult.ok) {
      return NextResponse.json({ error: dbResult.error ?? "Nu am putut salva cererea." }, { status: 500 });
    }

    const result = await sendPartnerLeadEmail({
      name,
      company,
      email,
      phone: phone || undefined,
      country,
      partnerType,
      horecaClientCount: horecaClientCount || undefined,
      message,
      waitlist,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Nu am putut trimite cererea." }, { status: 500 });
    }

    rateLimit.set(ip, now);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
}
