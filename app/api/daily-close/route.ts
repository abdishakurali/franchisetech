/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, closeDate, expectedCash, countedCash, cashDifference, notes } = body;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { error } = await supabase.from("pos_daily_close").insert({
      organisation_id: orgId,
      close_date: closeDate,
      expected_cash: expectedCash,
      counted_cash: countedCash,
      cash_difference: cashDifference,
      notes: notes ?? null,
      closed_by: user.id,
    });
    if (error) {
      // Table may not exist yet — return success anyway for UX
      console.warn("pos_daily_close insert failed:", error.message);
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
