/**
 * lib/compat/browser.ts
 *
 * Client-safe compatibility helpers targeting Chrome/WebView 86+.
 * Use these instead of calling unsupported APIs directly in client code.
 * All functions are safe to call during SSR (they detect the environment).
 */

// ── Random ID ──────────────────────────────────────────────────────────────
// crypto.randomUUID is available in secure contexts on Chrome 92+.
// On Chrome 86 it may not be available. Math.random fallback covers all cases.
export function safeRandomId(prefix = "id"): string {
  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as Crypto & { randomUUID?: () => string }).randomUUID === "function"
  ) {
    return `${prefix}_${(crypto as Crypto & { randomUUID: () => string }).randomUUID().replace(/-/g, "").slice(0, 12)}`;
  }
  // Fallback: Math.random-based hex string, good enough for non-cryptographic IDs
  const hex = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return `${prefix}_${hex}`;
}

// ── Fetch with timeout ─────────────────────────────────────────────────────
// AbortSignal.timeout() is Chrome 103+. Use a manual AbortController instead.
export function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 8000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal }).then(
    (res) => { clearTimeout(timer); return res; },
    (err) => { clearTimeout(timer); throw err; }
  );
}

// ── Safe structured clone ──────────────────────────────────────────────────
// structuredClone is Chrome 98+. JSON round-trip covers Chrome 86.
export function safeClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

// ── Viewport height ────────────────────────────────────────────────────────
// Returns the true visible viewport height in pixels.
// Prefers visualViewport (Chrome 61+), falls back to window.innerHeight.
export function getViewportHeight(): number {
  if (typeof window === "undefined") return 0;
  if (window.visualViewport) return window.visualViewport.height;
  return window.innerHeight;
}

// Sets --app-vh on :root so CSS can use calc(var(--app-vh, 1vh) * 100).
// This is the most reliable height strategy for Chrome 86 + address-bar collapse.
export function setAppVhVariable(): void {
  if (typeof document === "undefined") return;
  const vh = getViewportHeight() * 0.01;
  document.documentElement.style.setProperty("--app-vh", `${vh}px`);
}

// ── CSS feature detection ──────────────────────────────────────────────────
// Safely test if a CSS property+value pair is supported.
// CSS.supports is Chrome 61+; provides false for older browsers (safe fallback).
export function supportsCssFeature(property: string, value: string): boolean {
  if (typeof CSS === "undefined" || typeof CSS.supports !== "function") {
    return false;
  }
  return CSS.supports(property, value);
}

// Common feature gates used by the debug/device page and feature flags
export const cssSupport = {
  oklch: () => supportsCssFeature("color", "oklch(0% 0 0)"),
  colorMix: () => supportsCssFeature("color", "color-mix(in srgb, red, blue)"),
  dvh: () => supportsCssFeature("height", "1dvh"),
  containerQueries: () => supportsCssFeature("container-type", "inline-size"),
  hasSelector: () => {
    try {
      document.querySelector(":has(*)");
      return true;
    } catch {
      return false;
    }
  },
} as const;
