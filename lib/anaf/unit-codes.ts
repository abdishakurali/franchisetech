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
