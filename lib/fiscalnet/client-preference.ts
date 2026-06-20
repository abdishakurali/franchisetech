export const FISCALNET_ENABLED_KEY = "franchisetech:fiscalnetEnabled";
export const FISCALNET_CHANGE_EVENT = "franchisetech:fiscalnetChange";

/** Client override — Settings save writes immediately; POS may still have stale server props until refresh. */
export function readFiscalNetEnabledPreference(serverEnabled: boolean): boolean {
  if (typeof window === "undefined") return serverEnabled;
  try {
    const raw = localStorage.getItem(FISCALNET_ENABLED_KEY);
    if (raw === "0") return false;
    if (raw === "1") return true;
  } catch {
    /* ignore */
  }
  return serverEnabled;
}

export function writeFiscalNetEnabledPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FISCALNET_ENABLED_KEY, enabled ? "1" : "0");
    window.dispatchEvent(new Event(FISCALNET_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}
