import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

let buildId: string | null = null;
try {
  buildId = readFileSync(join(process.cwd(), ".next/BUILD_ID"), "utf-8").trim();
} catch {
  buildId = null;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "franchisetech",
      timestamp: new Date().toISOString(),
      version: buildId ?? "unknown",
    },
    { status: 200 }
  );
}
