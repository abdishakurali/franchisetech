// Server-side only — never import in client components
import { Resend } from "resend";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://franchisetech.ro";

const ACTION_URLS: Record<string, string> = {
  temperature_check: `${BASE_URL}/app/checks/new`,
  hot_holding_check: `${BASE_URL}/app/checks/new?category=hot_holding`,
  cleaning_check: `${BASE_URL}/app/cleaning`,
  manager_review: `${BASE_URL}/app/manager-review`,
};

export interface SendReminderEmailParams {
  to: string[];
  subject: string;
  businessName: string;
  reminderLabel: string;
  reminderType: string;
  dueTime: string;
  actionUrl?: string;
  assetName?: string | null;
}

// Escape user-supplied strings before interpolating into HTML.
// Prevents broken layout or markup injection from business names / labels.
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(params: SendReminderEmailParams): string {
  const url = params.actionUrl ?? ACTION_URLS[params.reminderType] ?? `${BASE_URL}/app`;
  const assetLine = params.assetName
    ? `<p style="color:#475569;margin:0 0 8px;">Unit: <strong>${esc(params.assetName)}</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#1d4ed8;padding:20px 24px;">
          <p style="margin:0;color:#ffffff;font-size:18px;font-weight:700;">🌡️ franchisetech</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 24px;">
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">${esc(params.reminderLabel)}</h1>
          <p style="color:#64748b;font-size:14px;margin:0 0 20px;">This is a scheduled reminder for <strong>${esc(params.businessName)}</strong>.</p>
          ${assetLine}
          <p style="color:#475569;margin:0 0 4px;">Due time: <strong>${params.dueTime}</strong></p>
          <p style="color:#475569;margin:0 0 24px;font-size:14px;">Please complete this check and record it in franchisetech.</p>
          <a href="${url}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:8px;">Open franchisetech →</a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
            franchisetech supports food-safety records. Food business operators remain responsible for following official guidance.<br>
            You are receiving this because your email is listed as a reminder recipient. To update reminders, visit
            <a href="${BASE_URL}/app/reminders" style="color:#3b82f6;">Settings → Reminders</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendReminderEmail(params: SendReminderEmailParams): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: buildHtml(params),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export function buildReminderSubject(label: string): string {
  return `franchisetech reminder: ${label}`;
}
