import { describe, expect, it } from "vitest";
import { buildFiscalSetupLead, FISCAL_SETUP_CTA_ID, parseHelpPhone } from "./fiscal-setup-help";

describe("parseHelpPhone", () => {
  it("accepts Romanian mobile formats", () => {
    expect(parseHelpPhone("0722 123 456")).toEqual({ ok: true, phone: "0722 123 456" });
    expect(parseHelpPhone("+40 722 123 456")).toEqual({ ok: true, phone: "+40 722 123 456" });
  });

  it("rejects empty, short and non-numeric input", () => {
    expect(parseHelpPhone("").ok).toBe(false);
    expect(parseHelpPhone("0722").ok).toBe(false);
    expect(parseHelpPhone("call me maybe").ok).toBe(false);
  });
});

describe("buildFiscalSetupLead", () => {
  const base = {
    orgName: "Cafeneaua Test",
    contactName: "Ana Pop",
    email: "Ana@Example.ro",
    phone: "0722123456",
    businessType: "Cafenea",
    locationBand: "one" as const,
    deviceBrand: "Datecs",
    lastProbeMessage: "FiscalNet nu răspunde pe acest calculator.",
  };

  it("tags the lead so it is distinguishable from demo requests", () => {
    const lead = buildFiscalSetupLead(base);
    expect(lead.ctaId).toBe(FISCAL_SETUP_CTA_ID);
    expect(lead.sourcePage).toBe("/onboarding/fiscal");
    expect(lead.email).toBe("ana@example.ro");
    expect(lead.locations).toBe("1");
    expect(lead.message).toContain("Datecs");
    expect(lead.message).toContain("nu răspunde");
  });

  it("falls back safely when optional details are missing", () => {
    const lead = buildFiscalSetupLead({ ...base, contactName: "", businessType: null, locationBand: null, deviceBrand: null, lastProbeMessage: null });
    expect(lead.contactName).toBe("Ana@Example.ro");
    expect(lead.businessType).toBe("Altă afacere HoReCa");
    expect(lead.message).toContain("nespecificată");
  });
});
