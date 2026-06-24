export type AnafCompanyLookup = {
  cui: string;
  name: string;
  address: string;
  vatRegistered: boolean;
  registrationCode: string;
};

// v9 endpoint — path changed from /PlatitorTvaRest/api/v8/ws/tva
const ANAF_TVA_LOOKUP_URL = "https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva";

function cleanCui(cui: string): string {
  return cui.replace(/^RO/i, "").replace(/\D/g, "").trim();
}

function str(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export async function lookupRomanianCompanyByCui(cui: string): Promise<AnafCompanyLookup | null> {
  const clean = cleanCui(cui);
  if (!clean) return null;

  const today = new Date().toISOString().slice(0, 10);

  let res: Response;
  try {
    res = await fetch(ANAF_TVA_LOOKUP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{ cui: Number(clean), data: today }]),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    console.error("[anaf-lookup] fetch failed:", err);
    return null;
  }

  if (!res.ok) {
    console.error("[anaf-lookup] HTTP", res.status);
    return null;
  }

  const json = await res.json().catch(() => null);
  // v9 returns { found: [...], notFound: [...] }
  const found = json?.found?.[0];
  if (!found) return null;

  const general = found.date_generale ?? found;
  const tva = found.inregistrare_scop_Tva ?? {};

  // v9: adresa is already a flat string; v8 had address components
  const address = str(general.adresa);

  return {
    cui: clean,
    name: str(general.denumire),
    address,
    vatRegistered: Boolean(tva.scpTVA ?? false),
    registrationCode: str(general.nrRegCom),
  };
}
