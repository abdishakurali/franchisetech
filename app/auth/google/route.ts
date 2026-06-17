import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const origin = `${protocol}://${host}`;
  if (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "true") {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    cache: "no-store",
  }).catch(() => null);
  const settings = settingsResponse?.ok ? await settingsResponse.json().catch(() => null) : null;
  if (settings?.external?.google === false) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  let data: { url: string | null } | null = null;
  let error: { message?: string } | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    data = result.data;
    error = result.error;
  } catch {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=google_not_configured`);
  }

  return NextResponse.redirect(data.url);
}
