import { describe, expect, it } from "vitest";
import { fiscalNetSettingsUpdate } from "./settings-update";

const ok = () => {};
const form = (fields: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
};

describe("FiscalNet settings save writes only what was sent", () => {
  it("the settings card's 5 fields never touch the CUI, VAT groups, payment codes or paths", () => {
    const r = fiscalNetSettingsUpdate(form({
      fiscalnet_enabled: "true", fiscalnet_mock_mode: "false", fiscalnet_connection_mode: "api",
      fiscalnet_api_host: "http://localhost:65400/", fiscalnet_operator_code: "1",
    }), ok);
    expect(r).toEqual({ update: {
      fiscalnet_enabled: true, fiscalnet_mock_mode: false, fiscalnet_connection_mode: "api",
      fiscalnet_api_host: "http://localhost:65400", fiscalnet_operator_code: "1",
    } });
    const keys = Object.keys((r as { update: object }).update);
    for (const untouched of ["fiscalnet_cif", "fiscalnet_vat_groups", "fiscalnet_payment_type_map", "fiscalnet_bonuri_path", "fiscalnet_timeout_ms", "fiscalnet_manual_only"]) {
      expect(keys).not.toContain(untouched);
    }
  });

  it("an empty form changes nothing", () => {
    expect(fiscalNetSettingsUpdate(form({}), ok)).toEqual({ update: {} });
  });

  it("still writes the CUI, maps and paths when they are sent", () => {
    const r = fiscalNetSettingsUpdate(form({
      fiscalnet_cif: " 49702253 ", fiscalnet_vat_groups: '[{"rate":21,"group":1}]',
      fiscalnet_payment_type_map: '{"cash":1,"card":2}', fiscalnet_timeout_ms: "999999", fiscalnet_bonuri_path: "C:/FiscalNet/Bonuri",
    }), ok);
    expect(r).toEqual({ update: {
      fiscalnet_cif: "49702253", fiscalnet_vat_groups: [{ rate: 21, group: 1 }],
      fiscalnet_payment_type_map: { cash: 1, card: 2 }, fiscalnet_timeout_ms: 120000, fiscalnet_bonuri_path: "C:/FiscalNet/Bonuri",
    } });
  });

  it("refuses malformed maps and unsafe paths instead of silently resetting them", () => {
    expect(fiscalNetSettingsUpdate(form({ fiscalnet_vat_groups: "nope" }), ok)).toEqual({ error: expect.stringMatching(/TVA/) });
    expect(fiscalNetSettingsUpdate(form({ fiscalnet_payment_type_map: "[1]" }), ok)).toEqual({ error: expect.stringMatching(/plată/) });
    expect(fiscalNetSettingsUpdate(form({ fiscalnet_raspuns_path: "../../etc" }), () => { throw new Error("bad"); })).toEqual({ error: "Invalid Raspuns path." });
  });
});
