import posthog from "posthog-js";
import { CONSENT_EVENT, clearAnalyticsStorage, hasAnalyticsConsent, readConsent, type Consent } from "@/lib/consent";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

// A script loaded before consent was withdrawn can write once more on its way
// out; clear again on every load while the choice is "necessary".
if (typeof window !== "undefined" && readConsent() === "necessary") clearAnalyticsStorage();

// Local development shares the production project token; capturing there put test
// clicks and form starts into production funnels (seen 2026-10-27). Skip local hosts.
const isLocalHost =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost|.+\.test)$/.test(window.location.hostname);

if (token && !isLocalHost) {
  // Without cookie consent PostHog keeps its identifiers in memory only: no
  // cookie, localStorage or sessionStorage, and no session recording. Accepting
  // in the banner turns persistence on for this and later visits.
  const consented = hasAnalyticsConsent();
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    disable_persistence: !consented,
    disable_session_recording: !consented,
    debug: process.env.NODE_ENV === "development",
  });

  window.addEventListener(CONSENT_EVENT, (event) => {
    const allowed = (event as CustomEvent<Consent>).detail === "all";
    posthog.set_config({ disable_persistence: !allowed, disable_session_recording: !allowed });
  });
}
