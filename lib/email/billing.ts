// Server-side only — never import in client components
import { Resend } from "resend";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";

export interface BillingReminderEmailParams {
  to: string[];
  businessName: string;
  reminderType: "trial_expired" | "past_due_grace" | "past_due_final";
  graceDaysLeft?: number | null;
  billingUrl?: string;
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
  const url = params.billingUrl ?? `${BASE_URL}/app/billing`;
  const biz = esc(params.businessName);

  let subject: string;
  let headline: string;
  let body: string;
  let ctaLabel: string;
  let headerColor: string;

  switch (params.reminderType) {
    case "trial_expired":
      subject = "Your franchisetech trial has ended — choose a plan to continue";
      headline = "Your free trial has ended";
      body = `The free trial for <strong>${biz}</strong> has ended. Choose a plan to keep your data and continue using franchisetech. Your records are safe and waiting.`;
      ctaLabel = "Choose a plan →";
      headerColor = "#d97706"; // amber
      break;

    case "past_due_grace":
      subject = `Payment failed — ${params.graceDaysLeft ?? 3} day${params.graceDaysLeft === 1 ? "" : "s"} to update your card`;
      headline = "Payment failed";
      body = `The most recent payment for <strong>${biz}</strong> did not go through. You have <strong>${params.graceDaysLeft ?? 3} day${params.graceDaysLeft === 1 ? "" : "s"}</strong> to update your payment details before access is restricted.`;
      ctaLabel = "Update payment →";
      headerColor = "#dc2626"; // red
      break;

    case "past_due_final":
      subject = "franchisetech access restricted — payment required";
      headline = "Access restricted — payment required";
      body = `The grace period for <strong>${biz}</strong> has ended. Update your payment details to restore full access immediately.`;
      ctaLabel = "Restore access →";
      headerColor = "#991b1b"; // dark red
      break;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
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
            You are the owner or billing contact for ${biz} on franchisetech.<br>
            To manage your subscription visit <a href="${url}" style="color:#3b82f6;">franchisetech Billing</a>.
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
    const { data, error } = await resend.emails.send({ from, to: params.to, subject, html });
    if (error) return { success: false, error: error.message };
    return { success: true, messageId: data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
