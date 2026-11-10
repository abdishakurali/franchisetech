import { describe, expect, it } from "vitest";
import { unitKind, unitMismatch } from "./unit-kind";

describe("unitKind", () => {
  it("classifies the standard and Romanian labels", () => {
    for (const u of ["kg", "g", "Gr", "kilogram", "grame"]) expect(unitKind(u), u).toBe("mass");
    for (const u of ["litre", "L", "ml", "litru", "Litri"]) expect(unitKind(u), u).toBe("volume");
    for (const u of ["each", "Buc", "buc.", "bucată", "bottle", "sticlă", "pack", "pachet", "bax", "box", "portion", "porție", "cup"]) {
      expect(unitKind(u), u).toBe("count");
    }
  });

  it("unknown or empty units are unknown", () => {
    for (const u of ["", null, undefined, "tavă mare", "xyz"]) expect(unitKind(u as string)).toBe("unknown");
  });
});

describe("unitMismatch", () => {
  it("equivalent count labels never warn (Buc, each, bottle, pack)", () => {
    const counts = ["Buc", "each", "bottle", "pack", "bucată", "pachet", "sticlă"];
    for (const a of counts) for (const b of counts) expect(unitMismatch(a, b), `${a}/${b}`).toBeNull();
  });

  it("same unit or same-size synonym never warns", () => {
    expect(unitMismatch("kg", "kg")).toBeNull();
    expect(unitMismatch("kilogram", "kg")).toBeNull();
    expect(unitMismatch("litru", "litre")).toBeNull();
    expect(unitMismatch("L", "litre")).toBeNull();
  });

  it("different kind warns: the live cases (each on g, ml on g, each on kg, kg on each, litre on each, Buc on litre)", () => {
    expect(unitMismatch("each", "g")).toEqual({ type: "kind", lineKind: "count", productKind: "mass" });
    expect(unitMismatch("ml", "g")).toEqual({ type: "kind", lineKind: "volume", productKind: "mass" });
    expect(unitMismatch("each", "kg")?.type).toBe("kind");
    expect(unitMismatch("each", "litre")?.type).toBe("kind");
    expect(unitMismatch("kg", "each")?.type).toBe("kind");
    expect(unitMismatch("litre", "each")?.type).toBe("kind");
    expect(unitMismatch("Buc", "litre")?.type).toBe("kind");
  });

  it("same kind, different size warns as scale (250 g on a kg product would add 250 kg)", () => {
    expect(unitMismatch("g", "kg")).toEqual({ type: "scale", lineKind: "mass", productKind: "mass" });
    expect(unitMismatch("ml", "litre")?.type).toBe("scale");
  });

  it("unknown units never warn", () => {
    expect(unitMismatch("tavă", "kg")).toBeNull();
    expect(unitMismatch("kg", "")).toBeNull();
    expect(unitMismatch(null, "kg")).toBeNull();
  });
});
