import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("components/marketing/ClaudeMarketing.tsx", "utf8");

describe("Romanian homepage positioning", () => {
  it("leads with daily operational truth", () => {
    expect(source).toContain("La finalul fiecărei zile, știi exact ce ai vândut");
    expect(source).toContain("câți bani trebuie să ai");
    expect(source).toContain("ce profit ai făcut");
  });

  it("presents the free accountant handoff as a primary workflow", () => {
    expect(source).toContain("Conectează contabilul gratuit");
    expect(source).toContain("fără rapoarte trimise lunar pe WhatsApp");
    expect(source).toContain("Portal gratuit pentru contabil");
  });
});
