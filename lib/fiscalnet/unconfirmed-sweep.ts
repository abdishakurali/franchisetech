// Handler for the fiscal "unconfirmed" sweep (route: /api/cron/fiscal-unconfirmed).
// Requires: Authorization: Bearer <CRON_SECRET>, same as the other cron routes.
//
// A receipt still `api_pending` long after the sale never got an answer from
// the browser (page reloaded or closed mid-print; production 2026-11-12). A
// resend still `printing` that long lost its page too. Both become
// `unconfirmed`: NOT `failed`, because the receipt may well have printed; only
// the printer journal can say. Reports, the accountant export, the owner
// dashboard and the till's resend list all show `unconfirmed`.
// The work is one SQL function (sweep_unconfirmed_fiscal_receipts), so the
// change is atomic and idempotent: a second run moves nothing new.

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { UNCONFIRMED_AFTER_MINUTES } from "./resend";

type Deps = { supabase?: SupabaseClient };

export async function runUnconfirmedSweep(req: Request, deps: Deps = {}) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${cronSecret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let supabase = deps.supabase;
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
    if (!supabaseUrl || !serviceKey)
      return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
    supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  }

  const { data, error } = await supabase.rpc("sweep_unconfirmed_fiscal_receipts", {
    p_older_than_minutes: UNCONFIRMED_AFTER_MINUTES,
  });
  if (error) {
    console.error("[fiscal-unconfirmed] sweep failed", error.message);
    return NextResponse.json({ error: "sweep failed" }, { status: 500 });
  }
  const moved = (data ?? {}) as { api_pending?: number; printing?: number; cutoff?: string };
  if ((moved.api_pending ?? 0) + (moved.printing ?? 0) > 0) {
    console.warn("[fiscal-unconfirmed] receipts marked unconfirmed", moved);
  }
  return NextResponse.json({ ok: true, olderThanMinutes: UNCONFIRMED_AFTER_MINUTES, ...moved });
}
