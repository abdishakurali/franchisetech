/** Partner program gate — open recruitment only after Dolce Nera loop is proven. */
export function isPartnerProgramOpen(): boolean {
  return process.env.PARTNER_PROGRAM_OPEN === "true";
}

export const PARTNER_COMMISSION_PCT = 20;
