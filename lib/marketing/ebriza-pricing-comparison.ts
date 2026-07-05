/** Ebriza vs franchisetech pricing table — single source for /pricing comparison rows. */

export type EbrizaPricingCell =
  | "included"
  | "excluded"
  | { addon: string }
  | { total: string };

export type EbrizaPricingRow = {
  readonly featureKey: keyof typeof EBPRIZA_ROW_LABEL_KEYS;
  readonly franchisetech: EbrizaPricingCell;
  readonly ebrizaPro: EbrizaPricingCell;
  readonly ebrizaPremium: EbrizaPricingCell;
  readonly emphasize?: boolean;
  readonly isTotal?: boolean;
};

export const EBPRIZA_ROW_LABEL_KEYS = {
  posSales: "posSales",
  zReport: "zReport",
  vatReport: "vatReport",
  stockNir: "stockNir",
  recipeCosting: "recipeCosting",
  kitchenDisplay: "kitchenDisplay",
  sagaExport: "sagaExport",
  roAccountingReports: "roAccountingReports",
  unlimitedStaff: "unlimitedStaff",
  browserBased: "browserBased",
  realMonthlyCost: "realMonthlyCost",
} as const;

export const ebrizaPricingComparisonRows: readonly EbrizaPricingRow[] = [
  {
    featureKey: "posSales",
    franchisetech: "included",
    ebrizaPro: "included",
    ebrizaPremium: "included",
  },
  {
    featureKey: "zReport",
    franchisetech: "included",
    ebrizaPro: "included",
    ebrizaPremium: "included",
  },
  {
    featureKey: "vatReport",
    franchisetech: "included",
    ebrizaPro: "included",
    ebrizaPremium: "included",
  },
  {
    featureKey: "stockNir",
    franchisetech: "included",
    ebrizaPro: "excluded",
    ebrizaPremium: "included",
    emphasize: true,
  },
  {
    featureKey: "recipeCosting",
    franchisetech: "included",
    ebrizaPro: "excluded",
    ebrizaPremium: "included",
    emphasize: true,
  },
  {
    featureKey: "kitchenDisplay",
    franchisetech: { addon: "+€19/lună" },
    ebrizaPro: { addon: "+€19/lună" },
    ebrizaPremium: { addon: "+€19/lună" },
    emphasize: true,
  },
  {
    featureKey: "sagaExport",
    franchisetech: "included",
    ebrizaPro: { addon: "+€39/lună" },
    ebrizaPremium: { addon: "+€39/lună" },
    emphasize: true,
  },
  {
    featureKey: "roAccountingReports",
    franchisetech: "included",
    ebrizaPro: "excluded",
    ebrizaPremium: "excluded",
    emphasize: true,
  },
  {
    featureKey: "unlimitedStaff",
    franchisetech: "included",
    ebrizaPro: "included",
    ebrizaPremium: "included",
  },
  {
    featureKey: "browserBased",
    franchisetech: "included",
    ebrizaPro: "excluded",
    ebrizaPremium: "excluded",
  },
  {
    featureKey: "realMonthlyCost",
    franchisetech: { total: "€118" },
    ebrizaPro: { total: "€107+" },
    ebrizaPremium: { total: "€157+" },
    isTotal: true,
  },
] as const;
