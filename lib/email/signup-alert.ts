import { Resend } from "resend";
import { salesInbox } from "@/lib/email/demo-lead";

// Every outside signup in Aug–Oct 2026 logged in once and never came back;
// the one café the founder set up by hand stayed. So a new account alerts the
// founder right away, to call within 24h and connect the cash register.

export type SignupAlert = {
  orgName: string;
  businessType: string | null;
  contactName: string | null;
  email: string;
  countryCode: string;
  locationBand: string;
  utm: Array<string | undefined>;
  /** ISO time the workspace was created. Shown in Bucharest time. */
  signupAt?: string;
};

/** "11.11.2026, 14:05" in Europe/Bucharest; "—" when missing or invalid. */
export function formatBucharestTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(d);
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildSignupAlertEmail(alert: SignupAlert): { subject: string; html: string } {
  const dash = (value: string | null | undefined) => (value && value.trim() ? value : "—");
  const rows: Array<[string, string]> = [
    ["Afacere", alert.orgName],
    ["Tip afacere", dash(alert.businessType)],
    ["Persoană de contact", dash(alert.contactName)],
    ["Email", alert.email],
    ["Ora înscrierii", formatBucharestTime(alert.signupAt)],
    ["Țară", alert.countryCode],
    ["Locații", alert.locationBand],
    ["UTM", alert.utm.filter(Boolean).join(" / ") || "—"],
  ];
  const html = `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5"><h2>Cont nou creat</h2>${rows
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join("")}<p><strong>Următorul pas:</strong> sunați sau scrieți în 24 de ore și conectați casa de marcat împreună cu clientul.</p><p style="color:#666;font-size:12px">Trimis automat la crearea contului. Răspundeți direct la acest email.</p></body></html>`;
  return { subject: `Cont nou — ${alert.orgName} (${dash(alert.businessType)})`, html };
}

export async function sendSignupAlertEmail(alert: SignupAlert): Promise<{ success: true } | { success: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" };
  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";
  const { subject, html } = buildSignupAlertEmail(alert);
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to: [salesInbox()], replyTo: alert.email, subject, html });
    return error ? { success: false, error: error.message } : { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
