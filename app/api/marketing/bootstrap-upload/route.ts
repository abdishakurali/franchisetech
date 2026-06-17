import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFile } from "fs/promises";
import path from "path";

// One-time bootstrap: upload local PNG files → Supabase Storage bucket,
// then update image_url in marketing_screenshots to the public Storage URL.
// POST /api/marketing/bootstrap-upload
// Header: x-upload-token: <MARKETING_UPLOAD_TOKEN>

const BUCKET = "marketing";

const SCREENSHOTS = [
  { key: "pos-hero.png",            mime: "image/png" },
  { key: "dashboard-hero.png",      mime: "image/png" },
  { key: "recipe-costing-hero.png", mime: "image/png" },
];

export async function POST(req: Request) {
  const token = req.headers.get("x-upload-token");
  const expectedToken = process.env.MARKETING_UPLOAD_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  const supabase   = createClient(supabaseUrl, serviceKey);
  const publicDir  = path.join(process.cwd(), "public", "marketing");
  const results: { key: string; status: string; url?: string; error?: string }[] = [];

  for (const { key, mime } of SCREENSHOTS) {
    try {
      const buffer = await readFile(path.join(publicDir, key));

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(key, buffer, { contentType: mime, upsert: true });

      if (uploadErr) {
        results.push({ key, status: "upload_error", error: uploadErr.message });
        continue;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(key);
      const publicUrl = urlData.publicUrl;

      // Update all rows with this storage_key to use the Supabase Storage URL
      const { error: dbErr } = await supabase
        .from("marketing_screenshots")
        .update({ image_url: publicUrl })
        .eq("storage_key", key);

      if (dbErr) {
        results.push({ key, status: "db_update_error", url: publicUrl, error: dbErr.message });
      } else {
        results.push({ key, status: "uploaded", url: publicUrl });
      }
    } catch (err) {
      results.push({ key, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ results });
}
