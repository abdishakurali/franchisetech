import { Resend } from "resend";
import { salesInbox } from "@/lib/email/demo-lead";

/** Plain-text operational alert to the sales inbox. Returns false instead of throwing. */
export async function sendPlainAlert(subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? "franchisetech <onboarding@resend.dev>";
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to: [salesInbox()], subject, text: body });
    return !error;
  } catch {
    return false;
  }
}
