import { describe, expect, it } from "vitest";
import { AUTH_LINK_TTL_MS, signAuthState, verifyAuthState } from "./auth-link";

const org = "7a03edd5-965d-4e5d-b5cd-cad5831d0b07";
const secret = "test-secret";

describe("signed ANAF authorisation state", () => {
  it("round-trips the organisation id", () => {
    expect(verifyAuthState(signAuthState(org, secret), secret)).toBe(org);
  });

  it("expires after 7 days", () => {
    const issued = Date.parse("2026-11-03T10:00:00Z");
    const state = signAuthState(org, secret, issued);
    expect(verifyAuthState(state, secret, issued + AUTH_LINK_TTL_MS - 1000)).toBe(org);
    expect(verifyAuthState(state, secret, issued + AUTH_LINK_TTL_MS + 1000)).toBeNull();
  });

  it("rejects a tampered organisation, a wrong secret, a bare org id and junk", () => {
    const state = signAuthState(org, secret);
    const [, sig] = state.split(".");
    const otherOrg = Buffer.from(`00000000-0000-0000-0000-000000000000.${Date.now() + 1e9}`).toString("base64url");
    expect(verifyAuthState(`${otherOrg}.${sig}`, secret)).toBeNull();
    expect(verifyAuthState(state, "other-secret")).toBeNull();
    expect(verifyAuthState(org, secret)).toBeNull();
    expect(verifyAuthState("", secret)).toBeNull();
    expect(verifyAuthState("a.b.c", secret)).toBeNull();
    expect(verifyAuthState(state, "")).toBeNull();
  });
});
