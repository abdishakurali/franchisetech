/**
 * `?save_error=` for plain `<form action>` server actions whose return value
 * the page never sees (settings location, country, currency, SAGA codes,
 * e-Factura seller details, suppliers, inventory, customers...).
 *
 * Before 2026-11-12 these actions ignored the Supabase `error` and the page
 * re-rendered as if the save had worked. Now a failed write redirects back
 * with `?save_error=<code>` and SaveErrorToast shows the message.
 */
export const SAVE_ERROR_PARAM = "save_error";

export type SaveErrorCode = "failed" | "vat_not_registered" | "duplicate";

const MESSAGES: Record<SaveErrorCode, string> = {
  failed: "Modificarea nu s-a salvat. Încercați din nou; dacă se repetă, scrieți-ne pe WhatsApp.",
  vat_not_registered:
    "Cotele standard nu s-au adăugat: firma nu apare la ANAF ca plătitoare de TVA, deci o cotă implicită peste 0% nu este permisă. Verificați CUI-ul în Date fiscale.",
  duplicate: "Există deja un element cu acest nume. Alegeți alt nume.",
};

/** `path` plus `save_error=<code>`, keeping any query string already there. */
export function withSaveError(path: string, code: SaveErrorCode = "failed"): string {
  const [base, hash] = path.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}${SAVE_ERROR_PARAM}=${code}${hash ? `#${hash}` : ""}`;
}

/** Romanian message for a `save_error` value; null when there is none. An
 * unknown value still shows the generic message: never hide a failure. */
export function saveErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return MESSAGES[code as SaveErrorCode] ?? MESSAGES.failed;
}

/** Log a refused write the same way everywhere, so it shows in Vercel logs. */
export function logWriteError(where: string, error: { code?: string; message?: string } | null | undefined): void {
  if (error) console.error(`[write] ${where} failed`, error.code, error.message);
}
