export const dynamic = "force-dynamic";

// POST /api/efactura/poll
// Polls ANAF /stareMesaj for all "uploaded" invoices and downloads receipts.
// Requires: Authorization: Bearer <CRON_SECRET>. The daily /api/cron/efactura
// runs the same poll; this route stays for manual/authenticated runs.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { pollUploadedInvoices } from "@/lib/efactura/poll";

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase env not configured" }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const results = await pollUploadedInvoices(supabase);
    return NextResponse.json({ polled: results.length, results });
  } catch (err) {
    console.error("[efactura/poll] error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
