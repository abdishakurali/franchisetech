export type AnafCompanyLookup = {
  cui: string;
  name: string;
  address: string;
  vatRegistered: boolean;
  registrationCode: string;
};

const ANAF_TVA_LOOKUP_URL = "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva";

function cleanCui(cui: string): string {
  return cui.replace(/^RO/i, "").replace(/\D/g, "").trim();
}

function stringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function lookupRomanianCompanyByCui(cui: string, date = new Date()): Promise<AnafCompanyLookup | null> {
  const clean = cleanCui(cui);
  if (!clean) return null;

  const res = await fetch(ANAF_TVA_LOOKUP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ cui: Number(clean), data: date.toISOString().slice(0, 10) }]),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  const found = json?.found?.[0];
  if (!found) return null;

  const general = found.date_generale ?? found;
  const tva = found.inregistrare_scop_Tva ?? found;
  const address = stringFrom(
    general.adresa,
    [general.ddenumire_Strada, general.dnumar_Strada, general.dlocalitate, general.djudet].filter(Boolean).join(", "),
  );

  return {
    cui: clean,
    name: stringFrom(general.denumire, found.denumire),
    address,
    vatRegistered: Boolean(tva.scpTVA ?? found.scpTva ?? found.scpTVA),
    registrationCode: stringFrom(general.nrRegCom, found.cod_inmatriculare),
  };
}
