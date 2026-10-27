// Demo-request validation and spam rules. Pure functions only (no I/O) so the
// API route stays thin and every rule here is unit-tested.

export const BUSINESS_TYPES = [
  "Cafenea",
  "Restaurant",
  "Bar",
  "Takeaway / fast-food",
  "Brutărie / patiserie",
  "Altă afacere HoReCa",
  "Altă afacere",
] as const;

export const LOCATION_OPTIONS = ["1", "2-3", "4-10", "10+"] as const;

/** Business types franchisetech is built for; used only to tag a lead's fit, never to reject it. */
const HORECA_TYPES = new Set<string>(BUSINESS_TYPES.filter((type) => type !== "Altă afacere"));

/** A human can't fill seven fields this fast; bots submitting instantly get a silent fake success. */
export const MIN_FILL_MS = 3_000;
export const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
export const RATE_LIMIT_MAX_PER_IP = 3;

export type DemoLead = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  businessType: string;
  locations: string;
  message: string | null;
  sourcePage: string | null;
  sourceArticle: string | null;
  ctaId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

export type DemoLeadField = "businessName" | "contactName" | "email" | "phone" | "businessType" | "locations" | "message" | "consent" | "form";

export type ParseResult =
  | { ok: true; lead: DemoLead }
  | { ok: false; spam: true }
  | { ok: false; spam: false; errors: Partial<Record<DemoLeadField, string>> };

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i;
const URL_RE = /https?:\/\/|www\./gi;
const SLUG_RE = /^[a-z0-9-]{1,120}$/;

/** Trim, drop control characters and angle brackets, collapse runs of whitespace, cap length. */
export function clean(value: unknown, max: number, { multiline = false } = {}): string {
  let s = String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim().slice(0, max);
}

function optional(value: unknown, max: number): string | null {
  const s = clean(value, max);
  return s ? s : null;
}

function slug(value: unknown): string | null {
  // Validate the raw value: cleaning first would turn "<script>" into a valid-looking slug.
  const s = String(value ?? "").trim().toLowerCase();
  return SLUG_RE.test(s) ? s : null;
}

export function isHorecaFit(businessType: string): boolean {
  return HORECA_TYPES.has(businessType);
}

export function parseDemoLead(body: Record<string, unknown>, now: number = Date.now()): ParseResult {
  // Spam: a honeypot field humans never see gets a silent fake success.
  if (clean(body.website, 200)) return { ok: false, spam: true };

  const businessName = clean(body.business_name, 120);
  const contactName = clean(body.contact_name, 100);
  const email = clean(body.email, 160).toLowerCase();
  const phoneRaw = clean(body.phone, 40);
  const businessType = clean(body.business_type, 60);
  const locations = clean(body.locations, 20);
  const message = clean(body.message, 1500, { multiline: true });

  // Messages stuffed with links are almost always spam; real owners rarely paste more than one.
  if ((message.match(URL_RE) ?? []).length > 2) return { ok: false, spam: true };

  const errors: Partial<Record<DemoLeadField, string>> = {};
  if (!businessName) errors.businessName = "Completează numele afacerii.";
  if (!contactName) errors.contactName = "Completează numele tău.";
  if (!email) errors.email = "Completează adresa de email.";
  // Raw check too: sanitising "<ana>@x.ro" would otherwise produce a different, valid address.
  else if (!EMAIL_RE.test(email) || /[<>"]/.test(String(body.email ?? ""))) errors.email = "Adresa de email nu pare validă.";
  if (phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, "").length;
    if (digits < 9 || digits > 15 || /[^\d\s+().-]/.test(phoneRaw)) errors.phone = "Numărul de telefon nu pare valid.";
  }
  if (!(BUSINESS_TYPES as readonly string[]).includes(businessType)) errors.businessType = "Alege tipul afacerii.";
  if (!(LOCATION_OPTIONS as readonly string[]).includes(locations)) errors.locations = "Alege numărul de locații.";
  if (body.consent !== true && body.consent !== "on") errors.consent = "Bifează acordul ca să te putem contacta.";

  if (Object.keys(errors).length > 0) return { ok: false, spam: false, errors };

  // A complete form sent implausibly fast is probably a bot, but could be a person
  // using autofill: never a fake success, just ask them to send it again.
  const startedAt = Number(body.started_at);
  if (!Number.isFinite(startedAt) || startedAt <= 0 || now - startedAt < MIN_FILL_MS) {
    return { ok: false, spam: false, errors: { form: "Te rugăm să verifici datele și să trimiți din nou." } };
  }

  return {
    ok: true,
    lead: {
      businessName,
      contactName,
      email,
      phone: phoneRaw || null,
      businessType,
      locations,
      message: message || null,
      sourcePage: optional(body.source_page, 80),
      sourceArticle: slug(body.source_article),
      ctaId: optional(body.cta_id, 60),
      utmSource: optional(body.utm_source, 120),
      utmMedium: optional(body.utm_medium, 120),
      utmCampaign: optional(body.utm_campaign, 120),
    },
  };
}

/** Rate-limit decision from recent stored leads for the same IP hash. */
export function isRateLimited(recentFromIp: number): boolean {
  return recentFromIp >= RATE_LIMIT_MAX_PER_IP;
}

/**
 * Analytics properties for a lead: attribution and fit only. Never the name,
 * email, phone, business name or message.
 */
export function leadAnalyticsProps(lead: DemoLead): Record<string, string | boolean | null> {
  return {
    source: "demo_page",
    business_type: lead.businessType,
    locations: lead.locations,
    lead_fit: isHorecaFit(lead.businessType) ? "horeca" : "other",
    source_article: lead.sourceArticle,
    cta_id: lead.ctaId,
    landing_page: lead.sourcePage,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    has_phone: Boolean(lead.phone),
  };
}
