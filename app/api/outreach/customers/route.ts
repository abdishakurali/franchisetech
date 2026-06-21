import { NextRequest, NextResponse } from "next/server";
import { authorizeCron, loadPendingCustomers } from "@/lib/outreach/csv";

export const dynamic = "force-dynamic";

/** GET /api/outreach/customers?limit=10 — pending rows for n8n daily planner (CRON_SECRET). */
export async function GET(req: NextRequest) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitRaw = req.nextUrl.searchParams.get("limit") ?? "10";
  const limit = Math.min(50, Math.max(1, Number.parseInt(limitRaw, 10) || 10));

  try {
    const rows = loadPendingCustomers(limit);
    return NextResponse.json({ rows, count: rows.length, limit });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read customer CSV";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
