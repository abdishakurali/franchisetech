// GET/POST /api/efactura/run — one run of SALUT TECH's e-Factura pipeline
// (lib/efactura/platform-run.ts). Requires Authorization: Bearer <CRON_SECRET>.
// Meant to run daily; the schedule is added separately (vercel.json).

import { NextRequest, NextResponse } from "next/server";
import { runPlatformEfactura } from "@/lib/efactura/platform-run";

export const dynamic = "force-dynamic";

async function handle(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json(await runPlatformEfactura());
  } catch (e) {
    console.error("[efactura/run]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
