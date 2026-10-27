import { describe, expect, it } from "vitest";
import { MIN_FILL_MS, clean, isHorecaFit, isRateLimited, leadAnalyticsProps, parseDemoLead } from "./demo-lead";

const NOW = 1_800_000_000_000;
const valid = {
  business_name: "Cafeneaua Test",
  contact_name: "Ana Pop",
  email: "Ana@Example.ro",
  phone: "+40 721 123 456",
  business_type: "Cafenea",
  locations: "1",
  message: "Vrem să vedem stocul.",
  consent: true,
  started_at: NOW - 20_000,
  source_page: "/demo",
  source_article: "e-obligatoriu-qr-code-pe-bonul-fiscal",
  cta_id: "blog_mid",
  utm_source: "google",
  utm_medium: "organic",
};

describe("parseDemoLead", () => {
  it("accepts a complete enquiry and normalises the email", () => {
    const r = parseDemoLead(valid, NOW);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.lead.email).toBe("ana@example.ro");
      expect(r.lead.sourceArticle).toBe("e-obligatoriu-qr-code-pe-bonul-fiscal");
    }
  });

  it("phone and message are optional", () => {
    const r = parseDemoLead({ ...valid, phone: "", message: "" }, NOW);
    expect(r.ok && r.lead.phone === null && r.lead.message === null).toBe(true);
  });

  it("reports every missing required field", () => {
    const r = parseDemoLead({ started_at: NOW - 20_000 }, NOW);
    expect(r.ok).toBe(false);
    if (!r.ok && !r.spam) {
      expect(Object.keys(r.errors).sort()).toEqual(["businessName", "businessType", "consent", "contactName", "email", "locations"]);
    }
  });

  it.each(["ana", "ana@", "ana@example", "a b@example.ro", "<ana>@x.ro"])("rejects invalid email %s", (email) => {
    const r = parseDemoLead({ ...valid, email }, NOW);
    expect(!r.ok && !r.spam && r.errors.email).toBeTruthy();
  });

  it("rejects a malformed phone but not a formatted one", () => {
    const bad = parseDemoLead({ ...valid, phone: "call me" }, NOW);
    expect(!bad.ok && !bad.spam && bad.errors.phone).toBeTruthy();
    expect(parseDemoLead({ ...valid, phone: "0721.123.456" }, NOW).ok).toBe(true);
  });

  it("only accepts listed business types and location bands", () => {
    const r = parseDemoLead({ ...valid, business_type: "Bank", locations: "999" }, NOW);
    expect(!r.ok && !r.spam && r.errors.businessType && r.errors.locations).toBeTruthy();
  });

  it("requires consent", () => {
    const r = parseDemoLead({ ...valid, consent: false }, NOW);
    expect(!r.ok && !r.spam && r.errors.consent).toBeTruthy();
  });

  it("treats the honeypot and link-stuffed messages as spam (silent)", () => {
    expect(parseDemoLead({ ...valid, website: "http://x" }, NOW)).toEqual({ ok: false, spam: true });
    expect(parseDemoLead({ ...valid, message: "http://a http://b www.c.ro" }, NOW)).toEqual({ ok: false, spam: true });
  });

  it("never fakes success for a too-fast or untimed submit: asks to send again", () => {
    for (const started_at of [NOW - MIN_FILL_MS + 1, 0, undefined]) {
      const r = parseDemoLead({ ...valid, started_at }, NOW);
      expect(!r.ok && !r.spam && r.errors.form).toBeTruthy();
    }
  });

  it("an empty form sent instantly gets field errors, not a fake success", () => {
    const r = parseDemoLead({ started_at: NOW - 10 }, NOW);
    expect(!r.ok && !r.spam && r.errors.email).toBeTruthy();
  });

  it("drops an attribution slug that isn't a slug", () => {
    const r = parseDemoLead({ ...valid, source_article: "<script>" }, NOW);
    expect(r.ok && r.lead.sourceArticle).toBe(null);
  });
});

describe("clean", () => {
  it("strips control characters and angle brackets, collapses whitespace, caps length", () => {
    expect(clean("  a\u0000b  <c>   d ", 100)).toBe("ab c d");
    expect(clean("x".repeat(500), 10)).toHaveLength(10);
    expect(clean("line1\n\n\n\nline2", 100, { multiline: true })).toBe("line1\n\nline2");
  });
});

describe("fit, rate limit and analytics", () => {
  it("tags HoReCa fit without rejecting other businesses", () => {
    expect(isHorecaFit("Cafenea")).toBe(true);
    expect(isHorecaFit("Altă afacere")).toBe(false);
  });

  it("rate-limits at 3 recent requests per IP", () => {
    expect(isRateLimited(2)).toBe(false);
    expect(isRateLimited(3)).toBe(true);
  });

  it("analytics properties never contain personal data", () => {
    const r = parseDemoLead(valid, NOW);
    if (!r.ok) throw new Error("expected valid");
    const props = JSON.stringify(leadAnalyticsProps(r.lead));
    for (const pii of ["Ana", "ana@example.ro", "721", "Cafeneaua Test", "stocul"]) {
      expect(props).not.toContain(pii);
    }
  });
});
