import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(new URL("../../app/app/layout.tsx", import.meta.url), "utf8");
const contextSource = readFileSync(new URL("../kitchenops/data.ts", import.meta.url), "utf8");
const posSource = readFileSync(new URL("../../app/app/pos/page.tsx", import.meta.url), "utf8");

describe("app request context performance contract", () => {
  it("shares one cached organisation/profile lookup between the layout and page", () => {
    expect(layoutSource).toContain('import { getActiveOrg } from "@/lib/kitchenops/data"');
    expect(layoutSource).toContain("getActiveOrg(),");
    expect(layoutSource).not.toContain('from("organisation_members")');
    expect(layoutSource).not.toContain('from("profiles")');
  });

  it("returns the full profile from the cached request context", () => {
    expect(contextSource).toContain('.from("profiles")\n    .select("*")');
    expect(contextSource).toContain("profile: profileRow");
  });

  it("does not block the closed-till screen on register-only data", () => {
    const closedTillBranch = posSource.indexOf("if (!openSession)");
    expect(closedTillBranch).toBeGreaterThan(0);
    expect(posSource.indexOf("const catalogQueries", closedTillBranch)).toBeGreaterThan(closedTillBranch);
    expect(posSource.indexOf("const registerQueries", closedTillBranch)).toBeGreaterThan(closedTillBranch);
    expect(posSource).not.toContain("seedExistenceQueries");
  });
});
