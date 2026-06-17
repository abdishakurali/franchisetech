import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_callback_failed`);
  }

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return NextResponse.redirect(`${origin}${membership ? "/app" : "/onboarding"}`);
}
