/** Client-synced till state so AppShell can show/hide the POS sidebar. */

export const POS_TILL_COOKIE = "pos_till_open";

type Listener = (open: boolean) => void;

let tillOpen = false;
const listeners = new Set<Listener>();

export function readPosTillOpenCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim() === `${POS_TILL_COOKIE}=1`);
}

export function writePosTillOpenCookie(open: boolean) {
  if (typeof document === "undefined") return;
  if (open) {
    document.cookie = `${POS_TILL_COOKIE}=1; path=/app; max-age=86400; SameSite=Lax`;
  } else {
    document.cookie = `${POS_TILL_COOKIE}=; path=/app; max-age=0; SameSite=Lax`;
  }
}

export function setPosTillOpen(open: boolean) {
  tillOpen = open;
  writePosTillOpenCookie(open);
  listeners.forEach((fn) => fn(open));
}

export function getPosTillOpen() {
  return tillOpen;
}

export function subscribePosTillOpen(fn: Listener) {
  listeners.add(fn);
  fn(tillOpen);
  return () => {
    listeners.delete(fn);
  };
}

export function resetPosTillOpen() {
  setPosTillOpen(false);
}
