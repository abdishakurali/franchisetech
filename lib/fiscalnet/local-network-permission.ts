// Chrome/Edge Local Network Access (LNA): since Chrome 142 a public https page
// that calls http://localhost (the FiscalNet connector on :65400) needs the
// user's permission. Until the user clicks Allow on the browser prompt the
// request is held, not sent — so it looks exactly like a printer that does not
// answer. Verified 2026-11-12 on Chromium 157 from https://www.franchisetech.ro:
// permission "prompt", fetch held until an 8 s timeout, 0 requests reached the
// local listener. Docs: developer.chrome.com/blog/local-network-access.
//
// This module only reads the permission state and words the messages. It
// never changes what is sent to the cash register.

export type LocalNetworkPermission = "granted" | "prompt" | "denied" | "unsupported";

// "loopback-network" is the name for localhost since Chrome 145;
// "local-network-access" is the older name.
const PERMISSION_NAMES = ["loopback-network", "local-network-access"] as const;

export async function localNetworkPermission(
  permissions: Pick<Permissions, "query"> | undefined = typeof navigator !== "undefined" ? navigator.permissions : undefined,
): Promise<LocalNetworkPermission> {
  if (!permissions?.query) return "unsupported";
  for (const name of PERMISSION_NAMES) {
    try {
      const status = await permissions.query({ name } as unknown as PermissionDescriptor);
      if (status.state === "granted" || status.state === "prompt" || status.state === "denied") return status.state;
    } catch {
      // Unknown permission name in this browser: try the next one.
    }
  }
  return "unsupported";
}

/** Shown while the browser prompt may be on screen (state "prompt"). */
export const LNA_PROMPT_MESSAGE =
  "Browserul cere permisiunea de a se conecta la casa fiscală de pe acest calculator. " +
  "Apăsați „Permite” în fereastra mică de lângă bara de adrese, apoi încercați din nou.";

/** Shown when the user (or a policy) blocked it (state "denied"). */
export const LNA_DENIED_MESSAGE =
  "Browserul a blocat conexiunea la casa fiscală. Apăsați iconița din stânga adresei site-ului → " +
  "Setări site → „Loopback network” (rețea locală) → Permite, apoi reîncărcați pagina.";

/** While the prompt is pending nothing has been sent, so waiting longer cannot
 *  print twice; it only gives the owner time to click Allow. */
export const LNA_PROMPT_TIMEOUT_MS = 60_000;
