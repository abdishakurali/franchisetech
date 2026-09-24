import { describe, expect, it } from "vitest";
import { ACCOUNTANT_PERMISSIONS, normalizeAccountantPermissions, packageSections } from "./permissions";

describe("accountant permissions", () => {
  it("keeps only supported unique permissions", () => {
    expect(normalizeAccountantPermissions(["sales", "cash", "sales", "staff", 2])).toEqual(["sales", "cash"]);
  });

  it("uses every read-only category only when permissions are omitted", () => {
    expect(normalizeAccountantPermissions(undefined)).toEqual([...ACCOUNTANT_PERMISSIONS]);
    expect(normalizeAccountantPermissions([])).toEqual([]);
  });

  it("maps permissions to the monthly package sections", () => {
    expect(packageSections(["sales", "purchases"])).toEqual(["sales", "payments", "purchases"]);
    expect(packageSections(["cash", "stock", "documents"])).toEqual(["cash", "stock", "documents"]);
  });
});
