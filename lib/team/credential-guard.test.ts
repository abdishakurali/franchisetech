import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { canChangeMemberCredentials } from "./credential-guard";

const ORG = "org-a";
function adminWith(orgIds: string[], error: unknown = null) {
  return {
    from: () => ({
      select: () => ({
        eq: async () => ({ data: error ? null : orgIds.map((organisation_id) => ({ organisation_id })), error }),
      }),
    }),
  } as unknown as SupabaseClient;
}
const base = { orgId: ORG, actorRole: "owner", actorUserId: "me", targetUserId: "them", targetRole: "cashier" };

describe("canChangeMemberCredentials", () => {
  it("allows an owner to manage a staff login that belongs only to this org", async () => {
    expect(await canChangeMemberCredentials(adminWith([ORG]), base)).toEqual({ ok: true });
  });

  it("refuses when the login also belongs to another organisation (account takeover)", async () => {
    const r = await canChangeMemberCredentials(adminWith([ORG, "org-b"]), base);
    expect(r).toMatchObject({ ok: false, status: 403 });
  });

  it("refuses a manager changing an owner's login", async () => {
    const r = await canChangeMemberCredentials(adminWith([ORG]), { ...base, actorRole: "manager", targetRole: "owner" });
    expect(r).toMatchObject({ ok: false, status: 403 });
  });

  it("refuses changing your own login from the team screen", async () => {
    const r = await canChangeMemberCredentials(adminWith([ORG]), { ...base, targetUserId: "me" });
    expect(r).toMatchObject({ ok: false, status: 400 });
  });

  it("fails closed when the membership lookup fails", async () => {
    const r = await canChangeMemberCredentials(adminWith([], { message: "boom" }), base);
    expect(r).toMatchObject({ ok: false, status: 500 });
  });
});
