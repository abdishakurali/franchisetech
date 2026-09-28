"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { sendAccountantPartnerWelcomeEmail } from "@/lib/email/accountant-partner-welcome";

function stringValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function generateLinkWithRetry(
  admin: Awaited<ReturnType<typeof createServiceClient>>,
  args: Parameters<Awaited<ReturnType<typeof createServiceClient>>["auth"]["admin"]["generateLink"]>[0],
) {
  // generateLink looks the user up by email internally — called immediately
  // after inviteUserByEmail/admin insert, it can race that write and report
  // "Email doesn't exist" even though the account was just created.
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await admin.auth.admin.generateLink(args);
    if (!result.error) return result;
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
  }
  return admin.auth.admin.generateLink(args);
}

function appUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return process.env.NODE_ENV === "production" ? "https://www.franchisetech.ro" : configured;
}

export type SignUpAccountantPartnerResult = { ok: true } | { ok: false; error: string };

/**
 * Public accountant-partner signup. Creates a real auth.users account (via
 * the service role's admin API — the same mechanism app/api/team/route.ts
 * uses for owner-invited accountants, just self-serve here, no owner
 * involved) and an accountant_partners row, then emails the referral link.
 *
 * Idempotent by email: resubmitting an already-registered email returns an
 * error rather than creating a duplicate partner or auth account.
 */
export async function signUpAccountantPartner(formData: FormData): Promise<SignUpAccountantPartnerResult> {
  const name = stringValue(formData, "name");
  const firmName = stringValue(formData, "firm_name") || null;
  const email = stringValue(formData, "email").toLowerCase();

  if (!name || !email) {
    return { ok: false, error: "Numele și emailul sunt obligatorii." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Introduceți o adresă de email validă." };
  }

  const admin = await createServiceClient();

  const { data: existingPartner } = await admin
    .from("accountant_partners")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existingPartner) {
    return { ok: false, error: "Există deja un cont de partener pentru acest email. Contactați-ne dacă aveți nevoie de ajutor la autentificare." };
  }

  const base = appUrl().replace(/\/$/, "");
  const redirectTo = `${base}/partner-dashboard/activate`;

  const { data: existingList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existingAuthUser = existingList?.users?.find((u) => u.email?.toLowerCase() === email);

  let userId: string;
  let activationLink: string | null = null;

  if (existingAuthUser) {
    userId = existingAuthUser.id;
    const { data: linkData } = await generateLinkWithRetry(admin, { type: "magiclink", email, options: { redirectTo } });
    activationLink = linkData?.properties?.action_link ?? null;
  } else {
    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: { full_name: name },
    });
    if (inviteError || !invited?.user) {
      return { ok: false, error: inviteError?.message ?? "Nu am putut crea contul." };
    }
    userId = invited.user.id;
    const { data: linkData } = await generateLinkWithRetry(admin, { type: "invite", email, options: { redirectTo } });
    activationLink = linkData?.properties?.action_link ?? null;
  }

  await admin.from("profiles").upsert({ id: userId, email, full_name: name }, { onConflict: "id" });

  const { data: partner, error: insertError } = await admin
    .from("accountant_partners")
    .insert({ user_id: userId, email, name, firm_name: firmName })
    .select("referral_code")
    .single();

  if (insertError || !partner) {
    return { ok: false, error: insertError?.message ?? "Nu am putut crea contul de partener." };
  }

  const referralLink = `${base}/signup?ref=${encodeURIComponent(partner.referral_code)}`;
  await sendAccountantPartnerWelcomeEmail({ to: email, name, referralLink, activationUrl: activationLink }).catch(() => null);

  return { ok: true };
}
