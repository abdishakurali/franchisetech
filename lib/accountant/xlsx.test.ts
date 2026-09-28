import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { createXlsx } from "./xlsx";

describe("createXlsx", () => {
  it("creates a valid minimal workbook with escaped values", async () => {
    const bytes = await createXlsx(["Produs", "Total"], [["Cafea & ceai", 12.5]]);
    const zip = await JSZip.loadAsync(bytes);
    expect(Object.keys(zip.files)).toContain("xl/worksheets/sheet1.xml");
    const sheet = await zip.file("xl/worksheets/sheet1.xml")!.async("text");
    expect(sheet).toContain("Cafea &amp; ceai");
    expect(sheet).toContain("<v>12.5</v>");
  });
});
