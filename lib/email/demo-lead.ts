import { Resend } from "resend";
import type { DemoLead } from "@/lib/leads/demo-lead";
import { isHorecaFit } from "@/lib/leads/demo-lead";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Same inbox as website contact requests (app/api/contact), overridable for a dedicated sales address. */
export function salesInbox(): string {
  return process.env.SALES_EMAIL ?? process.env.SUPPORT_EMAIL ?? "info@franchisetech.ro";
}

export async function sendDemoLeadEmail(lead: DemoLead, leadId: string | null): Promise<{ success: true } | { success: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" };
  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";
  const dash = (value: string | null) => (value && value.trim() ? value : "—");
  const rows: Array<[string, string]> = [
    ["Afacere", lead.businessName],
    ["Persoană de contact", lead.contactName],
    ["Email", lead.email],
    ["Telefon", dash(lead.phone)],
    ["Tip afacere", `${lead.businessType}${isHorecaFit(lead.businessType) ? "" : " (în afara HoReCa)"}`],
    ["Locații", lead.locations],
    ["Articol sursă", dash(lead.sourceArticle)],
    ["CTA", dash(lead.ctaId)],
    ["UTM", [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ") || "—"],
    ["ID cerere", dash(leadId)],
  ];
  const messageHtml = lead.message
    ? `<p><strong>Mesaj:</strong></p><p>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>`
    : "<p><strong>Mesaj:</strong> —</p>";
  const html = `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5"><h2>Cerere de demonstrație</h2>${rows
    .map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`)
    .join("")}${messageHtml}<p style="color:#666;font-size:12px">Trimis din formularul de pe /demo. Răspundeți direct la acest email.</p></body></html>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: [salesInbox()],
      replyTo: lead.email,
      subject: `Cerere demo — ${lead.businessName} (${lead.businessType}, ${lead.locations} loc.)`,
      html,
    });
    return error ? { success: false, error: error.message } : { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
