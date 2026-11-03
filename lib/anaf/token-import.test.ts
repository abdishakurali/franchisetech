import { describe, expect, it } from "vitest";
import { daysUntil, jwtExpiry, parseImportedToken } from "./token-import";

const jwt = (payload: object) =>
  `${Buffer.from('{"alg":"RS256"}').toString("base64url")}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.c2lnbmF0dXJl`;

const now = new Date("2026-11-03T12:00:00Z");
const in90 = Math.floor(now.getTime() / 1000) + 90 * 86400;

describe("imported ANAF token", () => {
  it("reads the expiry from the token", () => {
    expect(jwtExpiry(jwt({ exp: in90 }))?.toISOString().slice(0, 10)).toBe("2027-02-01");
  });

  it("accepts a valid token, with or without a 'Bearer ' prefix and surrounding spaces", () => {
    const t = jwt({ exp: in90 });
    expect(parseImportedToken(`  Bearer ${t}\n`, now)).toMatchObject({ accessToken: t });
  });

  it("refuses expired, undated and non-JWT values", () => {
    expect(parseImportedToken(jwt({ exp: in90 - 100 * 86400 }), now)).toMatchObject({ error: expect.stringMatching(/expirat/) });
    expect(parseImportedToken(jwt({ sub: "x" }), now)).toMatchObject({ error: expect.stringMatching(/exp/) });
    expect(parseImportedToken("not-a-token", now)).toMatchObject({ error: expect.stringMatching(/JWT/) });
    expect(parseImportedToken("a.b", now)).toMatchObject({ error: expect.any(String) });
  });

  it("counts whole days left", () => {
    expect(daysUntil(new Date("2026-11-17T12:00:00Z"), now)).toBe(14);
  });
});
