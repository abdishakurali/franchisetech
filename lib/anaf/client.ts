// ANAF e-Factura REST API client
// Docs: https://api.anaf.ro/prod/FCTEL/rest
// Note: /validare works on PROD only (not test env)

const ANAF_BASE = {
  prod: "https://api.anaf.ro/prod/FCTEL/rest",
  test: "https://api.anaf.ro/test/FCTEL/rest",
} as const;

export type AnafEnv = "prod" | "test";

export type UploadResult = {
  indexIncarcare: number;
  executionStatus: number;
};

export type StatusResult = {
  /** "in prelucrare" | "ok" | "nok" | "XML cu erori nepreluat de sistem" */
  stare: string;
  idDescarcare?: number;
  eroare?: string;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

function base(env: AnafEnv): string {
  return ANAF_BASE[env];
}

/**
 * Upload a UBL XML invoice to ANAF SPV.
 * Requires a valid Bearer access token.
 * Returns the indexIncarcare (upload index) used to poll status.
 */
export async function uploadDocument(
  xml: string,
  cif: string,
  accessToken: string,
  env: AnafEnv = "prod",
): Promise<UploadResult> {
  const url = `${base(env)}/upload?standard=UBL&cif=${encodeURIComponent(cif)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: xml,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AnafApiError(`ANAF upload failed: ${res.status}`, res.status, body);
  }

  // ANAF returns XML like: <header ExecutionStatus="0" index_incarcare="123456"/>
  const text = await res.text();
  const indexMatch = text.match(/index_incarcare="(\d+)"/);
  const statusMatch = text.match(/ExecutionStatus="(\d+)"/);

  if (!indexMatch) {
    throw new AnafApiError(`ANAF upload: missing index_incarcare in response`, 0, text);
  }

  return {
    indexIncarcare: parseInt(indexMatch[1], 10),
    executionStatus: statusMatch ? parseInt(statusMatch[1], 10) : 0,
  };
}

/**
 * Poll processing status for an uploaded invoice.
 * Call every 30–60 seconds. Terminal states: "ok" or "nok".
 */
export async function checkStatus(
  indexIncarcare: number,
  accessToken: string,
  env: AnafEnv = "prod",
): Promise<StatusResult> {
  const url = `${base(env)}/stareMesaj?id_incarcare=${indexIncarcare}`;
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AnafApiError(`ANAF checkStatus failed: ${res.status}`, res.status, body);
  }

  const text = await res.text();
  const stareMatch = text.match(/stare="([^"]+)"/);
  const idDescarcareMatch = text.match(/id_descarcare="(\d+)"/);
  const eroareMatch = text.match(/eroare="([^"]+)"/);

  return {
    stare: stareMatch?.[1] ?? "unknown",
    idDescarcare: idDescarcareMatch ? parseInt(idDescarcareMatch[1], 10) : undefined,
    eroare: eroareMatch?.[1],
  };
}

/**
 * Download the ANAF-signed result ZIP (when stare="ok" or "nok").
 * Max 20 downloads per day per CIF — the caller must track this.
 */
export async function downloadReceipt(
  idDescarcare: number,
  accessToken: string,
  env: AnafEnv = "prod",
): Promise<Buffer> {
  const url = `${base(env)}/descarcare?id=${idDescarcare}`;
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AnafApiError(`ANAF download failed: ${res.status}`, res.status, body);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ANAF's public validator needs no OAuth token (api.anaf.ro/.../validare
// answers 401 without one). Checked 2026-11-03: it returns JSON
// {"stare":"ok"|"nok","Messages":[{"message":"...codEroare=BR-..."}]}.
const PUBLIC_VALIDATOR = "https://webservicesp.anaf.ro/prod/FCTEL/rest/validare/FACT1";

/** Validate XML against ANAF's validator — use BEFORE uploading. */
export async function validateXml(xml: string): Promise<ValidationResult> {
  const res = await fetch(PUBLIC_VALIDATOR, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: xml,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AnafApiError(`ANAF validate failed: ${res.status}`, res.status, body);
  }

  return parseValidationResponse(await res.text());
}

/** A reply that isn't an explicit "ok" is never treated as valid. */
export function parseValidationResponse(text: string): ValidationResult {
  let parsed: { stare?: unknown; Messages?: Array<{ message?: unknown }> } | null = null;
  try { parsed = JSON.parse(text); } catch { /* not JSON */ }
  if (!parsed) return { valid: false, errors: [`Răspuns ANAF necunoscut: ${text.slice(0, 200)}`] };
  const errors = (parsed.Messages ?? [])
    .map((m) => String(m.message ?? ""))
    .map((m) => {
      const code = m.match(/codEroare=([A-Z0-9-]+)/)?.[1];
      const msg = m.match(/textEroare=([^;]+)/)?.[1]?.trim();
      return code ? `${code}: ${msg ?? m}` : m;
    })
    .filter(Boolean);
  return { valid: parsed.stare === "ok" && errors.length === 0, errors };
}

export class AnafApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly responseBody: string,
  ) {
    super(message);
    this.name = "AnafApiError";
  }
}
