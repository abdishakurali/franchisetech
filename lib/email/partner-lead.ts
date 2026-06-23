"use server";

import { Resend } from "resend";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type PartnerLeadPayload = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  country: string;
  partnerType: string;
  horecaClientCount?: string;
  message: string;
  waitlist?: boolean;
};

export async function sendPartnerLeadEmail(payload: PartnerLeadPayload): Promise<{
  success: boolean;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "Email service not configured" };
  }

  const to =
    process.env.PARTNER_LEADS_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    "hello@franchisetech.ro";

  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";

  const kind = payload.waitlist ? "Partner waitlist" : "Partner application";

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;line-height:1.5">
<h2>${kind}</h2>
<p><strong>Name:</strong> ${esc(payload.name)}</p>
<p><strong>Company:</strong> ${esc(payload.company)}</p>
<p><strong>Email:</strong> ${esc(payload.email)}</p>
<p><strong>Phone:</strong> ${esc(payload.phone ?? "—")}</p>
<p><strong>Country:</strong> ${esc(payload.country)}</p>
<p><strong>Partner type:</strong> ${esc(payload.partnerType)}</p>
<p><strong>HORECA clients:</strong> ${esc(payload.horecaClientCount ?? "—")}</p>
<p><strong>Message:</strong></p>
<p>${esc(payload.message).replace(/\n/g, "<br>")}</p>
</body></html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: payload.email,
    subject: `${kind} — ${payload.company}`,
    html,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
