import { Resend } from "resend";

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

type PartnerWelcome = { name: string; referralLink: string; activationUrl: string | null };

export function buildAccountantPartnerWelcomeEmail({ name, referralLink, activationUrl }: PartnerWelcome) {
  const firstName = esc(name.trim().split(/\s+/)[0] || name);
  const link = esc(referralLink);
  const activationBlock = activationUrl
    ? `<a href="${esc(activationUrl)}" style="display:inline-block;margin:14px 0;background:#c6923b;color:#17211b;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:9px">Activează-ți contul de partener</a>`
    : "";
  return {
    subject: "Bine ai venit în programul de parteneri franchisetech",
    html: `<!doctype html><html lang="ro"><body style="margin:0;background:#f4f1ea;font-family:Arial,sans-serif;color:#17211b"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table width="560" style="max-width:560px;width:100%;background:#fff;border:1px solid #ded8cc;border-radius:14px"><tr><td style="padding:28px"><p style="font-size:13px;font-weight:700;color:#9a6a20">FRANCHISETECH</p><h1 style="font-size:24px;margin:12px 0">Bine ai venit, ${firstName}!</h1><p style="line-height:1.6;color:#526057">Portalul contabil e gratuit pentru toți clienții HoReCa pe care îi trimiți, iar tu primești 15€/lună pentru fiecare client care devine abonat plătitor.</p>${activationBlock}<p style="line-height:1.6;color:#526057">Link-ul tău de recomandare:</p><p style="word-break:break-all;background:#f4f1ea;padding:10px 14px;border-radius:8px;font-size:14px">${link}</p><p style="line-height:1.6;color:#526057">Trimite-l clienților tăi — când unul devine abonat plătitor, primești automat acces la contul lui în portal și comisionul începe să se acumuleze.</p><p style="font-size:12px;color:#7d857f">Poți vedea oricând clienții recomandați și comisioanele în <a href="https://www.franchisetech.ro/partner-dashboard" style="color:#9a6a20">panoul de partener</a>.</p></td></tr></table></td></tr></table></body></html>`,
  };
}

export async function sendAccountantPartnerWelcomeEmail(params: PartnerWelcome & { to: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "Serviciul de email nu este configurat." };
  const resend = new Resend(apiKey);
  const message = buildAccountantPartnerWelcomeEmail(params);
  try {
    const { data, error } = await resend.emails.send({ from: process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>", to: [params.to], ...message });
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
