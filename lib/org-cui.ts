// The company CUI lives in two columns: onboarding saves it to
// organisations.anaf_cif, while Settings > FiscalNet and the older report
// code read fiscalnet_cif (audit 2026-11-12, O6). Read path only: prefer
// fiscalnet_cif and fall back to anaf_cif when it is empty. Nothing here
// writes or migrates data.
//
// Not for the FiscalNet receipt command: lib/fiscalnet/config.ts keeps
// reading fiscalnet_cif alone, so receipts do not change.
export type OrgCuiColumns = {
  fiscalnet_cif?: string | null;
  anaf_cif?: string | null;
};

export function resolveOrgCui(org: OrgCuiColumns | null | undefined): string | null {
  const fiscal = org?.fiscalnet_cif?.trim();
  if (fiscal) return fiscal;
  const anaf = org?.anaf_cif?.trim();
  return anaf || null;
}
