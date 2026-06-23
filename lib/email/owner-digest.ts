import { Resend } from "resend";
import {
  buildOwnerDigestBodyHtml,
  buildOwnerDigestFooter,
  buildOwnerDigestSubject,
  buildOwnerDigestTitle,
  type OwnerDigestData,
} from "@/lib/owner-digest/build";
import { emailLayout } from "@/lib/email/layout";

export async function sendOwnerDigestEmail(params: {
  to: string[];
  data: OwnerDigestData;
}): Promise<{ success: boolean; messageId?: string; error?: string; subject?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";

  const subject = buildOwnerDigestSubject(params.data);
  const title = buildOwnerDigestTitle(params.data);
  const bodyHtml = buildOwnerDigestBodyHtml(params.data);
  const footerHtml = buildOwnerDigestFooter(params.data);

  const html = emailLayout({
    lang: params.data.locale,
    title,
    bodyHtml,
    footerHtml,
  });

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject,
      html,
    });

    if (error) {
      return { success: false, error: error.message, subject };
    }

    return { success: true, messageId: data?.id, subject };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message, subject };
  }
}
