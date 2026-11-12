import { describe, expect, it } from "vitest";
import { resolveOrgCui } from "./org-cui";

describe("resolveOrgCui", () => {
  it("prefers fiscalnet_cif when set", () => {
    expect(resolveOrgCui({ fiscalnet_cif: "RO111", anaf_cif: "222" })).toBe("RO111");
  });
  it("falls back to anaf_cif when fiscalnet_cif is null, empty or blank", () => {
    expect(resolveOrgCui({ fiscalnet_cif: null, anaf_cif: "222" })).toBe("222");
    expect(resolveOrgCui({ fiscalnet_cif: "", anaf_cif: "222" })).toBe("222");
    expect(resolveOrgCui({ fiscalnet_cif: "  ", anaf_cif: " 222 " })).toBe("222");
    expect(resolveOrgCui({ anaf_cif: "222" })).toBe("222");
  });
  it("returns null when neither is set", () => {
    expect(resolveOrgCui({ fiscalnet_cif: "", anaf_cif: "" })).toBeNull();
    expect(resolveOrgCui(null)).toBeNull();
    expect(resolveOrgCui(undefined)).toBeNull();
  });
});
