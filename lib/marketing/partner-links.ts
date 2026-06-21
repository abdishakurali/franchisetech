/**
 * Named partner UTM sources for growth tracking (plan: 3–5 partner activations).
 * Each partner gets a stable utm_source for signup attribution.
 */
export type PartnerArchetype =
  | "contabil_horeca"
  | "fiscalnet_integrator"
  | "consultant_deschidere"
  | "reseller_pos"
  | "operator_champion";

export type PartnerLinkConfig = {
  id: PartnerArchetype;
  labelRo: string;
  utmSource: string;
  utmCampaign: string;
  description: string;
};

export const PARTNER_LINKS: PartnerLinkConfig[] = [
  {
    id: "contabil_horeca",
    labelRo: "Contabil HORECA (NIR/TVA)",
    utmSource: "partner_contabil_horeca",
    utmCampaign: "ro-partner-q2-r2",
    description: "Contabil cu clienți restaurant/cafenea — NIR și reconciliere casă.",
  },
  {
    id: "fiscalnet_integrator",
    labelRo: "Integrator FiscalNet / casă fiscală",
    utmSource: "partner_fiscalnet_integrator",
    utmCampaign: "ro-partner-q2-r2",
    description: "Instalează case fiscale — recomandă workspace operațional lângă fiscal.",
  },
  {
    id: "consultant_deschidere",
    labelRo: "Consultant deschidere restaurant",
    utmSource: "partner_consultant_deschidere",
    utmCampaign: "ro-partner-q2-r2",
    description: "Onboarding locații noi — POS + checklist setup asistat.",
  },
  {
    id: "reseller_pos",
    labelRo: "Reseller POS local",
    utmSource: "partner_reseller_pos",
    utmCampaign: "ro-partner-q2-r2",
    description: "Vinde hardware/software POS — cloud add-on cu comision recurent.",
  },
  {
    id: "operator_champion",
    labelRo: "Operator 2+ locații (champion)",
    utmSource: "partner_operator_champion",
    utmCampaign: "ro-partner-q2-r2",
    description: "Client multi-locație mulțumit — intro la peer operators, nu revânzare.",
  },
];

const BASE = "https://franchisetech.ro";

export function partnerSignupLink(
  partnerId: PartnerArchetype,
  options?: { plan?: string; content?: string }
): string {
  const cfg = PARTNER_LINKS.find((p) => p.id === partnerId);
  if (!cfg) throw new Error(`Unknown partner id: ${partnerId}`);
  const params = new URLSearchParams({
    lang: "ro",
    plan: options?.plan ?? "pro",
    utm_source: cfg.utmSource,
    utm_campaign: cfg.utmCampaign,
    utm_medium: "partner",
  });
  if (options?.content) params.set("utm_content", options.content);
  return `${BASE}/signup?${params.toString()}`;
}

export function partnerPortalLink(partnerId: PartnerArchetype, content?: string): string {
  const cfg = PARTNER_LINKS.find((p) => p.id === partnerId);
  if (!cfg) throw new Error(`Unknown partner id: ${partnerId}`);
  const params = new URLSearchParams({
    lang: "ro",
    utm_source: cfg.utmSource,
    utm_campaign: cfg.utmCampaign,
    utm_medium: "partner",
  });
  if (content) params.set("utm_content", content);
  return `${BASE}/partners?${params.toString()}`;
}

export function partnerLeaveBehindUrls(): { label: string; href: string }[] {
  return [
    { label: "SmartBill vs franchisetech", href: `${BASE}/compare/smartbill?lang=ro` },
    { label: "Ghid FiscalNet România", href: `${BASE}/help/romania-fiscalnet?lang=ro` },
    { label: "Obiecții frecvente POS", href: `${BASE}/resources/objections-pos-romania?lang=ro` },
    { label: "Program parteneri", href: `${BASE}/partners?lang=ro` },
  ];
}
