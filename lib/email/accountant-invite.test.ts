import { describe, expect, it } from "vitest";
import { buildAccountantInviteEmail } from "./accountant-invite";

describe("accountant invitation email", () => {
  it("links directly to the secure activation and explains the portal", () => {
    const email = buildAccountantInviteEmail({ companyName: "Dolce & Nera", activationUrl: "https://example.test/activate?token=abc" });
    expect(email.subject).toContain("Dolce & Nera");
    expect(email.html).toContain("https://example.test/activate?token=abc");
    expect(email.html).toContain("Dolce &amp; Nera");
    expect(email.html).toContain("Clienții mei");
  });
});
