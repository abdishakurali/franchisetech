"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PosLocale } from "@/lib/pos-i18n";

export async function updateUserLocale(locale: PosLocale): Promise<{ ok: boolean; error?: string }> {
  if (locale !== "en" && locale !== "ro") {
    return { ok: false, error: "invalid_locale" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("profiles").update({ locale }).eq("id", user.id);
  if (error) {
    console.error("updateUserLocale failed", error);
    return { ok: false, error: error.message };
  }

  revalidatePath("/app", "layout");
  revalidatePath("/app/settings");

  return { ok: true };
}
