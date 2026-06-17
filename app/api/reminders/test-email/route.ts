import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendReminderEmail, buildReminderSubject } from "@/lib/email/resend";

// POST /api/reminders/test-email
// Owner/manager only. Sends a test reminder to the current user's email.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("role, organisations(name)")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership || !["owner", "manager"].includes(membership.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const toEmail: string = body.email ?? user.email ?? "";
  if (!toEmail) {
    return NextResponse.json({ error: "No recipient email" }, { status: 400 });
  }

  const orgs = membership.organisations as unknown as { name: string }[] | { name: string } | null;
  const orgName = (Array.isArray(orgs) ? orgs[0]?.name : orgs?.name) ?? "Your business";
  const label = "Test: Morning fridge/freezer check";
  const subject = buildReminderSubject(label);

  const result = await sendReminderEmail({
    to: [toEmail],
    subject,
    businessName: orgName,
    reminderLabel: label,
    reminderType: "temperature_check",
    dueTime: "09:00",
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Send failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, messageId: result.messageId });
}
