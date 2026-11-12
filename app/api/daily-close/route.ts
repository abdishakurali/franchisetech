/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertEntitlement, entitlementDeniedResponse } from "@/lib/billing/entitlement-resolver";

const SAVE_FAILED_MESSAGE = "Numărarea casei nu a fost salvată. Încercați din nou.";
const DENIED_MESSAGE = "Planul curent nu permite salvarea închiderii de casă.";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { closeDate, expectedCash, countedCash, cashDifference, notes } = body;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { data: membership } = await supabase
      .from("organisation_members")
      .select("organisation_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (!membership) return NextResponse.json({ error: "No organisation" }, { status: 403 });
    const effectiveOrgId = membership.organisation_id as string;
    try {
      await assertEntitlement(effectiveOrgId, "reports.till_close", { write: false });
    } catch (error) {
      const response = entitlementDeniedResponse(error);
      if (response) {
        const body = await response.json().catch(() => ({}));
        return NextResponse.json(
          { ...body, ok: false, message: DENIED_MESSAGE },
          { status: response.status },
        );
      }
      throw error;
    }
    const { error } = await supabase.from("pos_daily_close").insert({
      organisation_id: effectiveOrgId,
      close_date: closeDate,
      expected_cash: expectedCash,
      counted_cash: countedCash,
      cash_difference: cashDifference,
      notes: notes ?? null,
      closed_by: user.id,
    });
    if (error) {
      // Never report "saved" when the cash count was not stored.
      console.error("pos_daily_close insert failed:", error.message);
      return NextResponse.json({ ok: false, error: "save_failed", message: SAVE_FAILED_MESSAGE }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, message: SAVE_FAILED_MESSAGE }, { status: 500 });
  }
}
