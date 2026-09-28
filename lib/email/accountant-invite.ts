import { Resend } from "resend";

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type AccountantInvite = { companyName: string; legalName?: string | null; taxId?: string | null; activationUrl: string };

export function buildAccountantInviteEmail({ companyName, legalName, taxId, activationUrl }: AccountantInvite) {
  const company = esc(companyName);
  const legalIdentity = legalName?.trim() || companyName;
  const legalDetails = `<p style="line-height:1.6;color:#526057"><strong>Firma:</strong> ${esc(legalIdentity)}${taxId ? `<br><strong>CUI:</strong> ${esc(taxId)}` : ""}</p>`;
  const url = esc(activationUrl);
  return {
    subject: `${companyName} te-a invitat în portalul contabil franchisetech`,
    html: `<!doctype html><html lang="ro"><body style="margin:0;background:#f4f1ea;font-family:Arial,sans-serif;color:#17211b"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table width="560" style="max-width:560px;width:100%;background:#fff;border:1px solid #ded8cc;border-radius:14px"><tr><td style="padding:28px"><p style="font-size:13px;font-weight:700;color:#9a6a20">FRANCHISETECH</p><h1 style="font-size:24px;margin:12px 0">Acces contabil pentru ${company}</h1><p style="line-height:1.6;color:#526057">Ai primit acces gratuit, doar pentru citire, la datele contabile puse la dispoziție de client.</p>${legalDetails}<a href="${url}" style="display:inline-block;margin:14px 0;background:#c6923b;color:#17211b;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:9px">Activează accesul securizat</a><p style="line-height:1.6;color:#526057">După activare, firma apare automat în secțiunea <strong>Clienții mei</strong>. Linkul conține codul unic de autorizare și nu trebuie transmis altcuiva.</p><p style="font-size:12px;color:#7d857f;word-break:break-all">Dacă butonul nu funcționează: ${url}</p></td></tr></table></td></tr></table></body></html>`,
  };
}

export async function sendAccountantInviteEmail(params: AccountantInvite & { to: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "Serviciul de email nu este configurat." };
  const resend = new Resend(apiKey);
  const message = buildAccountantInviteEmail(params);
  try {
    const { data, error } = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>", to: [params.to], ...message });
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
