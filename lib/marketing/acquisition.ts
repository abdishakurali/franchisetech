import type { MarketingLocale } from "@/lib/marketing/locale";

export const ACQUISITION_COOKIE = "franchisetech_acquisition";

export type AcquisitionParams = {
  utm_source?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  ref?: string;
  lang?: MarketingLocale;
};

const MAX_LEN = 120;

function trim(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  if (!v || v.length > MAX_LEN) return v ? v.slice(0, MAX_LEN) : undefined;
  return v;
}

export function parseAcquisitionFromSearchParams(
  params: URLSearchParams | { get: (key: string) => string | null }
): AcquisitionParams {
  const lang = params.get("lang");
  return {
    utm_source: trim(params.get("utm_source")),
    utm_campaign: trim(params.get("utm_campaign")),
    utm_content: trim(params.get("utm_content")),
    utm_medium: trim(params.get("utm_medium")),
    ref: trim(params.get("ref")),
    lang: lang === "ro" || lang === "it" || lang === "en" ? lang : undefined,
  };
}

export function hasAcquisitionData(params: AcquisitionParams): boolean {
  return Boolean(
    params.utm_source ||
      params.utm_campaign ||
      params.utm_content ||
      params.utm_medium ||
      params.ref
  );
}

export function writeAcquisitionClient(params: AcquisitionParams): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(params);
  document.cookie = `${ACQUISITION_COOKIE}=${encodeURIComponent(payload)};path=/;max-age=2592000;samesite=lax`;
}

export function readAcquisitionClient(): AcquisitionParams | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp(`${ACQUISITION_COOKIE}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as AcquisitionParams;
  } catch {
    return null;
  }
}

export async function getAcquisitionFromCookie(): Promise<AcquisitionParams | null> {
  const { cookies } = await import("next/headers");
  const raw = (await cookies()).get(ACQUISITION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as AcquisitionParams;
  } catch {
    return null;
  }
}
