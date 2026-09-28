// GET/POST /api/cron/accountant-commissions
// Run monthly (1st of month) by Vercel Cron. POST remains available for
// authenticated manual runs.
// Requires: Authorization: Bearer <CRON_SECRET>
//
// For every active partner_referrals row, creates one partner_commissions
// row for the current period_month (YYYY-MM) at the partner's
// commission_rate_eur. Idempotent: partner_commissions has a
// unique(referral_id, period_month) constraint, so a re-run this same month
// (retry, manual trigger, whatever) inserts nothing new for referrals
// already billed this month -- same idempotency idiom as billing-reminders'
// payment_reminders unique-window check.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function runAccountantCommissions(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret)
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });

  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${cronSecret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey)
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const now = new Date();
  const periodMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const { data: activeReferrals, error: referralsError } = await supabase
    .from("partner_referrals")
    .select("id, partner_id, accountant_partners(commission_rate_eur, status)")
    .eq("status", "active");

  if (referralsError) {
    return NextResponse.json({ error: referralsError.message }, { status: 500 });
  }

  type ReferralRow = {
    id: string;
    partner_id: string;
    accountant_partners: { commission_rate_eur: number; status: string } | { commission_rate_eur: number; status: string }[] | null;
  };

  let created = 0, skipped = 0, failed = 0;

  for (const referral of (activeReferrals ?? []) as ReferralRow[]) {
    try {
      const partner = Array.isArray(referral.accountant_partners)
        ? referral.accountant_partners[0]
        : referral.accountant_partners;
      if (!partner || partner.status !== "active") { skipped++; continue; }

      const { error: insertError } = await supabase.from("partner_commissions").insert({
        partner_id: referral.partner_id,
        referral_id: referral.id,
        period_month: periodMonth,
        amount_eur: partner.commission_rate_eur,
        status: "pending",
      });

      if (insertError?.code === "23505") { skipped++; continue; } // already generated this month
      if (insertError) throw insertError;
      created++;
    } catch (err) {
      console.error("[accountant-commissions] error", { referralId: referral.id, err });
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    periodMonth,
    activeReferralCandidates: activeReferrals?.length ?? 0,
    created,
    skipped,
    failed,
  });
}

export async function GET(req: NextRequest) {
  return runAccountantCommissions(req);
}

export async function POST(req: NextRequest) {
  return runAccountantCommissions(req);
}
