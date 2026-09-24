import { describe, expect, it } from "vitest";
import { buildPackageFilePlan } from "./package-files";

describe("accounting package file plan", () => {
  it("includes CSV and XLSX variants only for allowed datasets", () => {
    expect(buildPackageFilePlan(["sales", "cash"])).toEqual([
      "Vanzari.csv", "Vanzari.xlsx", "Vanzari-pe-cote-TVA.csv", "Vanzari-pe-cote-TVA.xlsx",
      "Incasari-pe-metode-plata.csv", "Incasari-pe-metode-plata.xlsx",
      "Inchideri-casa.csv", "Inchideri-casa.xlsx",
    ]);
  });

  it("does not leak disabled datasets", () => {
    expect(buildPackageFilePlan(["purchases"])).toEqual(["Achizitii.csv", "Achizitii.xlsx"]);
  });
});
