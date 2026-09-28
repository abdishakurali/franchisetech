import { describe, expect, it } from "vitest";
import { ACCOUNTING_ONLY_DOCUMENTS, visibleAccountantDocuments } from "./workspace";

describe("accountant workspace language", () => {
  it("shows only permitted operational documents", () => {
    expect(visibleAccountantDocuments(["cash"]).map((item) => item.title)).toEqual(["Registru de casă", "Închideri POS și raport Z"]);
  });

  it("keeps statutory accounting registers outside POS exports", () => {
    expect(ACCOUNTING_ONLY_DOCUMENTS).toContain("Registrul-jurnal");
    expect(ACCOUNTING_ONLY_DOCUMENTS).toContain("Balanța de verificare");
  });
});
