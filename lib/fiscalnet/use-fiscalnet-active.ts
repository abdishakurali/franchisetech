"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { BrowserFiscalConfig } from "@/lib/fiscalnet/browser";
import { isFiscalNetClientActive } from "@/lib/fiscalnet/eligibility";
import {
  FISCALNET_CHANGE_EVENT,
  readFiscalNetEnabledPreference,
  writeFiscalNetEnabledPreference,
} from "@/lib/fiscalnet/client-preference";

function subscribeFiscalNetPreference(onStoreChange: () => void): () => void {
  const sync = () => onStoreChange();
  window.addEventListener(FISCALNET_CHANGE_EVENT, sync);
  return () => window.removeEventListener(FISCALNET_CHANGE_EVENT, sync);
}

/** Romania + FiscalNet enabled in Settings (server props + client preference after save). */
export function useFiscalNetActive(
  isRO: boolean,
  fiscalNet: BrowserFiscalConfig | null | undefined,
): boolean {
  const serverEnabled = Boolean(fiscalNet?.enabled);

  useEffect(() => {
    writeFiscalNetEnabledPreference(serverEnabled);
  }, [serverEnabled]);

  const preferenceEnabled = useSyncExternalStore(
    subscribeFiscalNetPreference,
    () => readFiscalNetEnabledPreference(serverEnabled),
    () => serverEnabled,
  );

  return (
    isFiscalNetClientActive(isRO, fiscalNet) &&
    preferenceEnabled &&
    Boolean(fiscalNet?.enabled)
  );
}
