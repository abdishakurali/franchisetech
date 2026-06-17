/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== "run-012-pos-ops") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth required" }, { status: 401 });

  const sqlPath = path.join(process.cwd(), "supabase/migrations/012_pos_ops.sql");
  let sql = "";
  try { sql = fs.readFileSync(sqlPath, "utf8"); } catch { sql = ""; }

  // Try to detect if migration has already run
  const { data: cols } = await supabase
    .from("products")
    .select("id")
    .limit(0);

  return NextResponse.json({
    status: "migration_pending",
    note: "Run the SQL below in your Supabase SQL Editor: https://supabase.com/dashboard/project/ycqzxlahhfqwuteistvf/sql",
    sql_preview: sql.slice(0, 500) + "...",
    sql_file: "/var/www/fridgeproof/supabase/migrations/012_pos_ops.sql",
    products_reachable: !!cols,
  });
}
