import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, name, email, message } = body;

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json({ error: "Message too short" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Best-effort insert — table may not exist yet
    await supabase.from("support_messages").insert({
      type: type ?? "question",
      name: name ?? null,
      email: email ?? user?.email ?? null,
      message: message.trim(),
      user_id: user?.id ?? null,
      created_at: new Date().toISOString(),
    }).then(() => null, () => null);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always 200 to user
  }
}
