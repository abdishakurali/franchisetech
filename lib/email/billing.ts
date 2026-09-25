// Server-side only — never import in client components
import { Resend } from "resend";

const BASE_URL = process.env.NODE_ENV === "production" ? "https://www.franchisetech.ro" : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

export interface BillingReminderEmailParams {
  to: string[];
  businessName: string;
  reminderType: "trial_expired" | "past_due_grace" | "past_due_final";
  graceDaysLeft?: number | null;
  billingUrl?: string;
  idempotencyKey?: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildBillingHtml(params: BillingReminderEmailParams): { subject: string; html: string } {
  const url = esc(params.billingUrl ?? `${BASE_URL}/app/billing`);
  const biz = esc(params.businessName);

  let subject: string;
  let headline: string;
  let body: string;
  let ctaLabel: string;
  let headerColor: string;

  switch (params.reminderType) {
    case "trial_expired":
      subject = "Perioada de test franchisetech s-a încheiat";
      headline = "Perioada de test s-a încheiat";
      body = `Perioada de test pentru <strong>${biz}</strong> s-a încheiat. Alege un abonament pentru a păstra accesul la date și pentru a continua utilizarea franchisetech. Datele tale sunt în siguranță.`;
      ctaLabel = "Alege abonamentul →";
      headerColor = "#d97706"; // amber
      break;

    case "past_due_grace":
      subject = `Plata nu a reușit — actualizează metoda de plată`;
      headline = "Plata nu a reușit";
      body = `Cea mai recentă plată pentru <strong>${biz}</strong> nu a fost procesată. Mai ai <strong>${params.graceDaysLeft ?? 3} zile</strong> pentru a actualiza metoda de plată înainte de restricționarea accesului.`;
      ctaLabel = "Actualizează plata →";
      headerColor = "#dc2626"; // red
      break;

    case "past_due_final":
      subject = "Acces franchisetech restricționat — plata este necesară";
      headline = "Acces restricționat";
      body = `Perioada de grație pentru <strong>${biz}</strong> s-a încheiat. Actualizează metoda de plată pentru a restabili imediat accesul complet.`;
      ctaLabel = "Restabilește accesul →";
      headerColor = "#991b1b"; // dark red
      break;
  }

  const html = `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:560px;width:100%;">
        <tr><td style="background:${headerColor};padding:20px 24px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">franchisetech</p>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;">${headline}</h1>
          <p style="color:#475569;font-size:14px;margin:0 0 24px;line-height:1.6;">${body}</p>
          <a href="${url}" style="display:inline-block;background:${headerColor};color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:8px;">${ctaLabel}</a>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            Primești acest mesaj deoarece ești proprietarul sau persoana de contact pentru facturarea ${biz}.<br>
            Gestionează abonamentul din <a href="${url}" style="color:#3b82f6;">Facturare franchisetech</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

export async function sendBillingReminderEmail(params: BillingReminderEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" };

  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";
  const { subject, html } = buildBillingHtml(params);
  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send(
      { from, to: params.to, subject, html },
      params.idempotencyKey ? { headers: { "Idempotency-Key": params.idempotencyKey } } : undefined,
    );
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
