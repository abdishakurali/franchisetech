"use server";

import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";

export type SubmitTestimonialResult = { success: boolean; error?: string };

export async function submitTestimonial(formData: FormData): Promise<SubmitTestimonialResult> {
  const { supabase, orgId, user } = await getKitchenOpsContext();

  const quote = String(formData.get("quote") ?? "").trim();
  if (quote.length < 20) {
    return { success: false, error: "Spune-ne puțin mai mult — cel puțin 20 de caractere." };
  }
  if (quote.length > 1000) {
    return { success: false, error: "Mesajul este prea lung (max 1000 de caractere)." };
  }

  const ratingRaw = formData.get("rating");
  let rating: number | null = null;
  if (ratingRaw) {
    const n = Number(ratingRaw);
    if (Number.isInteger(n) && n >= 1 && n <= 5) rating = n;
  }

  const { error } = await supabase.from("testimonials").insert({
    organisation_id: orgId,
    submitted_by: user.id,
    quote,
    rating,
    status: "pending",
  });

  if (error) {
    return { success: false, error: "Nu am putut trimite feedback-ul. Încearcă din nou." };
  }

  return { success: true };
}
