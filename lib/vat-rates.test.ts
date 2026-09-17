// Gate A proof: a Romanian business that is not VAT-registered (ANAF) must
// never end up with a non-zero VAT rate on a product, through either write
// path — manual entry (validateVatRateForOrg) or CSV import
// (resolveCsvVatRate). This is the "hand-insert a violating row / import a
// CSV with a blank VAT column" proof from the Gate A spec, run against the
// actual functions the app calls rather than described in prose.
//
// Deliberately includes the pre-fix catalog shape (21% active AND
// is_default, alongside 0%) as a case, not just the corrected one — that
// was the actual root cause (the catalog was configured independently of
// anaf_vat_registered), so the registration gate has to hold even when the
// catalog itself is still wrong. Defense in depth, proven as such.

import { describe, expect, it } from "vitest";
import {
  isRoUnregisteredOrg,
  purchaseVatRateOptions,
  resolveCsvVatRate,
  validatePurchaseVatRate,
  validateVatRateForOrg,
  type OrgVatRate,
} from "./vat-rates";

const BUGGY_RO_CATALOG: OrgVatRate[] = [
  { id: "1", name: "TVA 21%", rate: 21, active: true, is_default: true, sort_order: 1 },
  { id: "2", name: "TVA 11%", rate: 11, active: true, is_default: false, sort_order: 2 },
  { id: "3", name: "TVA 0%", rate: 0, active: true, is_default: false, sort_order: 3 },
];

const FIXED_RO_CATALOG: OrgVatRate[] = [
  { id: "1", name: "TVA 21%", rate: 21, active: false, is_default: false, sort_order: 1 },
  { id: "2", name: "TVA 11%", rate: 11, active: false, is_default: false, sort_order: 2 },
  { id: "3", name: "TVA 0%", rate: 0, active: true, is_default: true, sort_order: 3 },
];

const REGISTERED_RO_CATALOG: OrgVatRate[] = BUGGY_RO_CATALOG; // same shape, but the org IS registered

const UNREGISTERED = { countryCode: "RO", vatRegistered: false };
const REGISTERED = { countryCode: "RO", vatRegistered: true };
const IE_ORG = { countryCode: "IE", vatRegistered: false }; // anaf_vat_registered is meaningless outside RO

describe("isRoUnregisteredOrg", () => {
  it("is true only for RO + not registered", () => {
    expect(isRoUnregisteredOrg(UNREGISTERED)).toBe(true);
    expect(isRoUnregisteredOrg(REGISTERED)).toBe(false);
    expect(isRoUnregisteredOrg(IE_ORG)).toBe(false);
    expect(isRoUnregisteredOrg({ countryCode: null, vatRegistered: false })).toBe(false);
    expect(isRoUnregisteredOrg({ countryCode: "ro", vatRegistered: false })).toBe(true); // case-insensitive
  });
});

describe("resolveCsvVatRate — CSV import path", () => {
  it("a blank VAT column lands at 0% for an unregistered org, even against the pre-fix buggy catalog", () => {
    expect(resolveCsvVatRate(null, BUGGY_RO_CATALOG, UNREGISTERED)).toBe(0);
  });

  it("a blank VAT column lands at 0% for an unregistered org against the fixed catalog", () => {
    expect(resolveCsvVatRate(null, FIXED_RO_CATALOG, UNREGISTERED)).toBe(0);
  });

  it("an explicit non-zero VAT value in the file is still forced to 0% for an unregistered org", () => {
    expect(resolveCsvVatRate(21, BUGGY_RO_CATALOG, UNREGISTERED)).toBe(0);
    expect(resolveCsvVatRate(11, BUGGY_RO_CATALOG, UNREGISTERED)).toBe(0);
    expect(resolveCsvVatRate(21, FIXED_RO_CATALOG, UNREGISTERED)).toBe(0);
  });

  it("a blank VAT column falls back to the org default for a registered org (unchanged behaviour)", () => {
    expect(resolveCsvVatRate(null, REGISTERED_RO_CATALOG, REGISTERED)).toBe(21);
  });

  it("an explicit VAT value snaps to the nearest active catalog rate for a registered org (unchanged behaviour)", () => {
    expect(resolveCsvVatRate(12, REGISTERED_RO_CATALOG, REGISTERED)).toBe(11);
  });

  it("non-RO orgs are never gated by anaf_vat_registered", () => {
    const ieCatalog: OrgVatRate[] = [
      { id: "1", name: "Standard 23%", rate: 23, active: true, is_default: true, sort_order: 1 },
    ];
    expect(resolveCsvVatRate(23, ieCatalog, IE_ORG)).toBe(23);
    expect(resolveCsvVatRate(null, ieCatalog, IE_ORG)).toBe(23);
  });
});

describe("validateVatRateForOrg — manual entry path (addProduct, approveProductVat, ...)", () => {
  it("rejects a non-zero submitted rate for an unregistered org, even if that rate is in the (buggy) catalog", () => {
    const result = validateVatRateForOrg(BUGGY_RO_CATALOG, 21, UNREGISTERED);
    expect(result.ok).toBe(false);
  });

  it("accepts a 0% submission for an unregistered org", () => {
    expect(validateVatRateForOrg(BUGGY_RO_CATALOG, 0, UNREGISTERED).ok).toBe(true);
  });

  it("accepts a catalog-matching non-zero rate for a registered org (unchanged behaviour)", () => {
    expect(validateVatRateForOrg(REGISTERED_RO_CATALOG, 21, REGISTERED).ok).toBe(true);
  });

  it("still rejects a rate that simply isn't in the catalog at all, for a registered org", () => {
    expect(validateVatRateForOrg(REGISTERED_RO_CATALOG, 19, REGISTERED).ok).toBe(false);
  });

  it("non-RO orgs are validated against their own catalog only, never the registration gate", () => {
    const ieCatalog: OrgVatRate[] = [
      { id: "1", name: "Standard 23%", rate: 23, active: true, is_default: true, sort_order: 1 },
    ];
    expect(validateVatRateForOrg(ieCatalog, 23, IE_ORG).ok).toBe(true);
  });
});

describe("purchase VAT — supplier invoice path", () => {
  it("offers Romanian supplier rates even when a non-registered buyer sells only at 0%", () => {
    const options = purchaseVatRateOptions(FIXED_RO_CATALOG, "RO");
    expect(options.map((rate) => rate.rate)).toEqual([0, 11, 21]);
    expect(validatePurchaseVatRate(FIXED_RO_CATALOG, 21, "RO").ok).toBe(true);
  });

  it("does not allow a malformed supplier VAT rate", () => {
    expect(validatePurchaseVatRate(FIXED_RO_CATALOG, 0.2, "RO").ok).toBe(false);
  });
});
