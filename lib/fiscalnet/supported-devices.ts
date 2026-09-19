// Single source of truth for "which FiscalNet hardware does franchisetech
// support" — previously duplicated between app/help/romania-fiscalnet and
// lib/marketing/homepage-content.ts with no shared source (see
// docs/onboarding-redesign-audit-2026-09-19.md, Section J). This is a
// display/selection aid only; it does not affect fiscal transport logic
// (lib/fiscalnet/browser.ts, lib/fiscalnet/service.ts), which only ever
// needs an API host/connection mode, not a device identity.

export type FiscalNetSupportedBrand = {
  brand: string;
  models: string;
};

export const FISCALNET_SUPPORTED_DEVICES: FiscalNetSupportedBrand[] = [
  { brand: "Datecs", models: "DP25, DP150, WP500, WP50, DP05 (case de marcat); FP800, FP700, FP650 (imprimante fiscale)" },
  { brand: "Daisy", models: "eXpert SX, Compact M, Perfect M, Compact S" },
  { brand: "Custom", models: "KSmart, BigPlus (case); Q3xF, K3F (imprimante)" },
  { brand: "Orgtech", models: "Teo, Nova" },
  { brand: "Partner", models: "Partner 200, Partner 300, Partner 600" },
  { brand: "Posiflex", models: "AURA 8900 (imprimantă fiscală)" },
  { brand: "Sam4S", models: "NR-240, NR-300, NR-440" },
  { brand: "Tremol", models: "Activa Galaxy Plus, Adpos M, Tremol M20, Excel Master și altele" },
  { brand: "Incotex", models: "SuccesM7" },
];
