export const ANAF_UNIT_CODES = [
  { code: "C62", label: "bucată (buc)" },
  { code: "KGM", label: "kilogram (kg)" },
  { code: "LTR", label: "litru (l)" },
  { code: "GRM", label: "gram (g)" },
  { code: "MTR", label: "metru (m)" },
  { code: "HUR", label: "oră (h)" },
  { code: "DAY", label: "zi" },
] as const;

export const ANAF_UNIT_OPTIONS = ANAF_UNIT_CODES.map((unit) => ({
  value: unit.code,
  label: unit.label,
}));

export function mapUnitOfMeasureToAnafCode(unit?: string | null): string {
  const normalized = (unit ?? "").trim().toLowerCase();
  if (["kg", "kilogram", "kilograms", "kilogram(e)"].includes(normalized)) return "KGM";
  if (["g", "gr", "gram", "grams", "grame"].includes(normalized)) return "GRM";
  if (["l", "litre", "liter", "litru", "litri", "litre"].includes(normalized)) return "LTR";
  if (["m", "metru", "metri", "meter", "metre"].includes(normalized)) return "MTR";
  if (["h", "ora", "oră", "ore", "hour", "hours"].includes(normalized)) return "HUR";
  if (["day", "zi", "zile"].includes(normalized)) return "DAY";
  return "C62";
}
