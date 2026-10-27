import posthog from "posthog-js";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

// Local development shares the production project token; capturing there put test
// clicks and form starts into production funnels (seen 2026-10-27). Skip local hosts.
const isLocalHost =
  typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\]|.+\.localhost|.+\.test)$/.test(window.location.hostname);

if (token && !isLocalHost) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
  });
}
