import { NextResponse } from "next/server";
import { sendPartnerLeadEmail } from "@/lib/email/partner-lead";

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
      return NextResponse.json({ error: "Please wait before submitting again." }, { status: 429 });
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
    const message = String(body.message ?? "").trim();

    if (!name || !company || !email || !country || !partnerType || !message) {
      return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const result = await sendPartnerLeadEmail({
      name,
      company,
      email,
      phone: phone || undefined,
      country,
      partnerType,
      message,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Could not send application." }, { status: 500 });
    }

    rateLimit.set(ip, now);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
