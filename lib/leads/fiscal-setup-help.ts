// Assisted fiscal setup requests: a signed-in owner asks us to connect their
// cash register for them. Stored in demo_leads (cta_id below) so they show up
// in /app/leads next to demo requests. Pure functions only.

import { clean, type DemoLead } from "@/lib/leads/demo-lead";
import type { LocationBand } from "@/lib/business-profile";

export const FISCAL_SETUP_CTA_ID = "fiscal_setup_help";
export const FISCAL_SETUP_SOURCE_PAGE = "/onboarding/fiscal";

const LOCATIONS: Record<LocationBand, string> = { one: "1", few: "2-3", many: "4-10" };

export function parseHelpPhone(raw: unknown): { ok: true; phone: string } | { ok: false; error: string } {
  const phone = clean(raw, 40);
  const digits = phone.replace(/\D/g, "").length;
  if (!phone || digits < 9 || digits > 15 || /[^\d\s+().-]/.test(phone)) {
    return { ok: false, error: "Introduceți un număr de telefon valid, ca să vă putem suna." };
  }
  return { ok: true, phone };
}

export function buildFiscalSetupLead(input: {
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  businessType: string | null;
  locationBand: LocationBand | null;
  deviceBrand: string | null;
  lastProbeMessage: string | null;
}): DemoLead {
  const details = [
    "Cerere de ajutor la conectarea casei de marcat (din pasul FiscalNet al onboarding-ului).",
    `Casă de marcat: ${clean(input.deviceBrand, 80) || "nespecificată"}`,
    input.lastProbeMessage ? `Ultimul test: ${clean(input.lastProbeMessage, 200)}` : null,
  ].filter(Boolean);

  return {
    businessName: clean(input.orgName, 120) || "—",
    contactName: clean(input.contactName, 120) || input.email,
    email: input.email.toLowerCase(),
    phone: input.phone,
    businessType: clean(input.businessType, 60) || "Altă afacere HoReCa",
    locations: input.locationBand ? LOCATIONS[input.locationBand] : "1",
    message: details.join("\n"),
    sourcePage: FISCAL_SETUP_SOURCE_PAGE,
    sourceArticle: null,
    ctaId: FISCAL_SETUP_CTA_ID,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
  };
}
