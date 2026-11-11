import { describe, expect, it } from "vitest";
import { saveErrorMessage, withSaveError } from "./save-error";

describe("withSaveError", () => {
  it("adds the param to a bare path", () => {
    expect(withSaveError("/app/customers")).toBe("/app/customers?save_error=failed");
  });
  it("keeps an existing query and a hash", () => {
    expect(withSaveError("/app/settings?tab=business#vat", "vat_not_registered")).toBe(
      "/app/settings?tab=business&save_error=vat_not_registered#vat",
    );
  });
});

describe("saveErrorMessage", () => {
  it("is null without a code", () => {
    expect(saveErrorMessage(undefined)).toBeNull();
    expect(saveErrorMessage("")).toBeNull();
  });
  it("uses formal Romanian", () => {
    expect(saveErrorMessage("failed")).toContain("Încercați din nou");
    expect(saveErrorMessage("vat_not_registered")).toContain("plătitoare de TVA");
  });
  it("an unknown code still shows the generic failure, never nothing", () => {
    expect(saveErrorMessage("something_new")).toBe(saveErrorMessage("failed"));
  });
});
