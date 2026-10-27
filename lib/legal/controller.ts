// Legal facts used by the privacy notice for demo enquiries (/privacy#cereri-demo)
// and the notice under the /demo form. Every value here is either verified or
// explicitly marked as pending an owner decision; nothing is inferred.

export const DATA_CONTROLLER = {
  /**
   * PENDING (owner): legal name of the controller as registered (company + CUI + registered
   * address, or the individual / PFA operating franchisetech.ro). Stripe lists the account as
   * an individual in Romania with no company name, so this cannot be filled from the code.
   * While null, the notice names the brand and the contact address only.
   */
  legalName: null as string | null,
  registeredAddress: null as string | null,
  registrationNumber: null as string | null,
  brand: "franchisetech",
  website: "franchisetech.ro",
  contactEmail: "info@franchisetech.ro",
} as const;

/**
 * PENDING (owner): how long enquiries from people who do not become customers are kept.
 * 24 months is the value shown on /demo since 2026-10-27; confirm or change it.
 */
export const DEMO_LEAD_RETENTION_MONTHS = 24;

/** Processors for demo enquiries, with locations verified on 2026-10-27. */
export const DEMO_LEAD_PROCESSORS = [
  { name: "Vercel", role: "găzduirea site-ului și a formularului", location: "funcții rulate în regiunea Paris (cdg1), UE" },
  { name: "Supabase", role: "baza de date în care se păstrează cererea", location: "regiunea eu-west-3 (Paris), UE" },
  { name: "Resend", role: "trimiterea notificării prin email către echipa franchisetech", location: "furnizor din SUA (regiunea de trimitere nu este confirmată)" },
  { name: "Zoho Mail", role: "căsuța info@franchisetech.ro în care primim notificarea", location: "centru de date UE (zoho.eu)" },
  { name: "PostHog", role: "statistici despre pagini și formular, fără nume, email sau telefon", location: "instanța UE (eu.posthog.com)" },
] as const;
