"use server";

// Founder-only actions for SALUT TECH's own e-Factura (/app/admin/efactura).

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isLeadAdmin } from "@/lib/leads/admin";
import { checkTokenForCif } from "@/lib/anaf/client";
import { parseImportedToken } from "@/lib/anaf/token-import";
import { PLATFORM_SELLER } from "@/lib/legal/controller";

export type ImportTokenResult = { ok: true; expiresOn: string } | { ok: false; error: string };

/**
 * Saves an access token the accountant obtained with her certificate. It is
 * checked live against ANAF for SALUT TECH's CUI before it replaces anything.
 * The refresh token is left empty on purpose: it belongs to her software's
 * ANAF app, so ours can't use it — see getOrgAccessToken.
 */
export async function importAccountantAnafToken(_prev: ImportTokenResult | null, formData: FormData): Promise<ImportTokenResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isLeadAdmin(user)) return { ok: false, error: "Nu aveți acces." };

  const orgId = process.env.PLATFORM_BILLING_ORG_ID?.trim();
  if (!orgId) return { ok: false, error: "PLATFORM_BILLING_ORG_ID lipsește." };

  const parsed = parseImportedToken(String(formData.get("token") ?? ""));
  if ("error" in parsed) return { ok: false, error: parsed.error };

  let check: Awaited<ReturnType<typeof checkTokenForCif>>;
  try {
    check = await checkTokenForCif(parsed.accessToken, PLATFORM_SELLER.cui);
  } catch (e) {
    return { ok: false, error: `ANAF nu a răspuns: ${e instanceof Error ? e.message : "eroare"}. Nu s-a salvat nimic.` };
  }
  if (!check.ok) {
    return { ok: false, error: `ANAF nu acceptă tokenul pentru CUI ${PLATFORM_SELLER.cui} (HTTP ${check.status}): ${check.detail}. Nu s-a salvat nimic.` };
  }

  const service = await createServiceClient();
  const { error } = await service.from("anaf_oauth_tokens").upsert(
    {
      organisation_id: orgId,
      cif: PLATFORM_SELLER.cui,
      access_token: parsed.accessToken,
      refresh_token: "",
      expires_at: parsed.expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organisation_id" },
  );
  if (error) return { ok: false, error: `Tokenul e valid, dar nu s-a putut salva: ${error.message}` };

  revalidatePath("/app/admin/efactura");
  return { ok: true, expiresOn: parsed.expiresAt.toISOString().slice(0, 10) };
}
