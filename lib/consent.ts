// Cookie consent (Legea 506/2004 art. 4 alin. (5), ePrivacy art. 5(3)).
// "all": analytics may store data in the browser (PostHog cookie/localStorage,
// DataFast, GA/Meta/LinkedIn if configured, the attribution cookie).
// "necessary": only strictly necessary storage. No choice yet = "necessary".

export const CONSENT_COOKIE = "franchisetech_consent";
export const CONSENT_EVENT = "franchisetech:consent";
export const CONSENT_OPEN_EVENT = "franchisetech:consent-open";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

export type Consent = "all" | "necessary";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=(all|necessary)`));
  return match ? (match[1] as Consent) : null;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "all";
}

export function writeConsent(consent: Consent): void {
  document.cookie = `${CONSENT_COOKIE}=${consent};path=/;max-age=${MAX_AGE_SECONDS};samesite=lax`;
  if (consent === "necessary") clearAnalyticsStorage();
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}

/** Removes what analytics stored before the visitor withdrew consent. */
export function clearAnalyticsStorage(): void {
  const expire = (name: string) => {
    document.cookie = `${name}=;path=/;max-age=0`;
    document.cookie = `${name}=;path=/;max-age=0;domain=.${location.hostname.replace(/^www\./, "")}`;
  };
  for (const part of document.cookie.split(";")) {
    const name = part.trim().split("=")[0];
    if (/^ph_.*_posthog$/.test(name) || name === "franchisetech_acquisition" || name.startsWith("_ga") || name === "_fbp") expire(name);
  }
  for (const store of [localStorage, sessionStorage]) {
    try {
      for (const key of Object.keys(store)) if (key.startsWith("ph_") || key.startsWith("datafast_")) store.removeItem(key);
    } catch {
      // storage blocked: nothing to clear
    }
  }
}
