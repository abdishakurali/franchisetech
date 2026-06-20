/**
 * FiscalNet is Romania-only and opt-in.
 *
 * It must only run when BOTH are true:
 * - organisation country_code is "RO"
 * - fiscalnet_enabled is true in Settings
 *
 * Ireland, UK, Italy, and other markets never use FiscalNet in POS or billing copy.
 */

export function isFiscalNetActive(
  countryCode: string | null | undefined,
  fiscalnetEnabled: boolean | null | undefined,
): boolean {
  return (countryCode ?? "").toUpperCase() === "RO" && Boolean(fiscalnetEnabled);
}

/** Client-side: fiscalNet config is only built when server already verified eligibility. */
export function isFiscalNetClientActive(
  isRO: boolean,
  fiscalNet: { enabled: boolean } | null | undefined,
): boolean {
  return isRO && Boolean(fiscalNet?.enabled);
}
