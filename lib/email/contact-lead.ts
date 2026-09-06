"use server";

import { Resend } from "resend";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type ContactLead = {
  name: string;
  contact: string;
  businessType: string;
  locations: string;
  message: string;
  source: string;
  utmSource?: string;
  utmCampaign?: string;
  utmContent?: string;
};

export async function sendContactLeadEmail(lead: ContactLead) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "Serviciul de email nu este configurat." };
  const to = process.env.SUPPORT_EMAIL ?? "info@franchisetech.ro";
  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.contact);
  // Everything except `contact` is now optional on the form, so fall back to a
  // dash rather than rendering blank rows or an empty subject line.
  const dash = (value: string) => (value.trim() ? value : "—");
  const rows = [
    ["Nume", dash(lead.name)], ["Contact", lead.contact], ["Tip afacere", dash(lead.businessType)],
    ["Locații", dash(lead.locations)], ["Sursă", lead.source], ["UTM source", lead.utmSource ?? "—"],
    ["UTM campaign", lead.utmCampaign ?? "—"], ["UTM content", lead.utmContent ?? "—"],
  ];
  const messageHtml = lead.message.trim()
    ? `<p><strong>Mesaj:</strong></p><p>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>`
    : `<p><strong>Mesaj:</strong> — (cerere de apel telefonic)</p>`;
  const html = `<!doctype html><html><body style="font-family:sans-serif;line-height:1.5"><h2>Mesaj nou de pe site</h2>${rows.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("")}${messageHtml}</body></html>`;
  // Subject leads with the phone number so the owner can call straight from the inbox.
  const subjectDetail = [lead.businessType, lead.name].filter((part) => part.trim()).join(" — ");
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: isEmail ? lead.contact : undefined,
    subject: subjectDetail ? `Cerere apel — ${lead.contact} — ${subjectDetail}` : `Cerere apel — ${lead.contact}`,
    html,
  });
  return error ? { success: false, error: error.message } : { success: true };
}
