// Who may change another person's login (email, password, reset link) from
// the team screens.
//
// A Supabase login is global: the same account can belong to several
// organisations. An org owner or manager may manage their own people, but must
// never be able to set the password of someone who also belongs to another
// organisation (that would let any new signup add a stranger's email to their
// org and take over the stranger's account). 2026-11-12 audit.
import type { SupabaseClient } from "@supabase/supabase-js";

export type CredentialGuardResult = { ok: true } | { ok: false; status: number; error: string };

export async function canChangeMemberCredentials(
  admin: SupabaseClient,
  {
    orgId,
    actorRole,
    actorUserId,
    targetUserId,
    targetRole,
  }: { orgId: string; actorRole: string; actorUserId: string; targetUserId: string; targetRole: string },
): Promise<CredentialGuardResult> {
  if (targetUserId === actorUserId) {
    return { ok: false, status: 400, error: "Pentru contul dumneavoastră folosiți Profil → Schimbă parola." };
  }
  if (targetRole === "owner" && actorRole !== "owner") {
    return { ok: false, status: 403, error: "Doar proprietarul poate schimba datele de autentificare ale unui proprietar." };
  }
  const { data, error } = await admin
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", targetUserId);
  if (error) return { ok: false, status: 500, error: "Nu am putut verifica utilizatorul. Încercați din nou." };
  const otherOrgs = (data ?? []).filter((row) => row.organisation_id !== orgId);
  if (otherOrgs.length > 0) {
    return {
      ok: false,
      status: 403,
      error:
        "Acest cont aparține și altei organizații, deci emailul și parola lui nu se pot schimba de aici. " +
        "Persoana își poate reseta singură parola din pagina de autentificare.",
    };
  }
  return { ok: true };
}
