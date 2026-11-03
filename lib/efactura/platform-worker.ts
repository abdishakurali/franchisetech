// Uploads SALUT TECH's queued e-Factura to ANAF. One daily run is enough for
// the 5-working-day deadline. Safety rules, same spirit as fiscal receipts:
//   • an invoice is claimed ("uploading") before it is sent, so two runs can
//     never send it twice;
//   • if we can't tell whether ANAF received it (timeout, crash after sending),
//     it is parked for a human — never re-sent automatically;
//   • only an explicit HTTP refusal returns it to the queue;
//   • a storno waits until ANAF has accepted the invoice it reverses.

import type { ValidationResult, UploadResult } from "@/lib/anaf/client";

export type WorkerInvoice = {
  id: string;
  invoiceNumber: string;
  issueDate: string;            // YYYY-MM-DD
  uploadStatus: string;         // ready | uploading | uploaded | accepted | rejected | invalid | upload_unknown | needs_data
  xml: string | null;
  stornoOf: string | null;
  updatedAt: string;
  errorMessage: string | null;
};

export interface WorkerStore {
  listOpen(): Promise<WorkerInvoice[]>;
  /** Atomically move ready → uploading; false if someone else claimed it. */
  claim(id: string): Promise<boolean>;
  markUploaded(id: string, indexIncarcare: number): Promise<void>;
  markBack(id: string, status: "ready" | "invalid" | "upload_unknown", message: string): Promise<void>;
  statusOf(id: string): Promise<string | null>;
}

export interface AnafPort {
  validate(xml: string): Promise<ValidationResult>;
  upload(xml: string, cif: string, accessToken: string): Promise<UploadResult>;
}

export type WorkerDeps = {
  store: WorkerStore;
  anaf: AnafPort;
  cif: string;
  /** Throws if the organisation has no usable ANAF authorisation. */
  accessToken: () => Promise<string>;
  /** Upload only when true; otherwise validate and report (shadow mode). */
  uploadEnabled: boolean;
  now?: () => Date;
};

export type WorkerReport = {
  uploaded: string[];
  invalid: Array<{ number: string; errors: string[] }>;
  parked: string[];
  waitingForOriginal: string[];
  shadowValidated: string[];
  alerts: string[];
};

/** HTTP refusal from ANAF (we got an answer, nothing was accepted). */
export class AnafRefusal extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

/** Adds n working days (Mon–Fri). Public holidays are not modelled — alerts fire earlier, never later. */
export function addWorkingDays(isoDate: string, n: number): Date {
  const d = new Date(`${isoDate}T12:00:00Z`);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) left--;
  }
  return d;
}

const STUCK_MS = 60 * 60 * 1000;

export async function runPlatformUpload(deps: WorkerDeps): Promise<WorkerReport> {
  const now = deps.now?.() ?? new Date();
  const report: WorkerReport = { uploaded: [], invalid: [], parked: [], waitingForOriginal: [], shadowValidated: [], alerts: [] };
  const open = await deps.store.listOpen();

  // Deadline and stuck checks first, so they're reported even if uploading fails.
  for (const inv of open) {
    if (["accepted", "invalid", "rejected", "needs_data"].includes(inv.uploadStatus)) continue;
    const deadline = addWorkingDays(inv.issueDate, 5);
    const warnFrom = addWorkingDays(inv.issueDate, 3);
    if (now >= warnFrom) {
      report.alerts.push(`Factura ${inv.invoiceNumber} nu e confirmată de ANAF; termenul legal este ${deadline.toISOString().slice(0, 10)}.`);
    }
    if (inv.uploadStatus === "uploading" && now.getTime() - new Date(inv.updatedAt).getTime() > STUCK_MS) {
      await deps.store.markBack(inv.id, "upload_unknown", "Încărcarea s-a întrerupt; nu știm dacă ANAF a primit-o. Verificați în SPV înainte de a retrimite.");
      report.parked.push(inv.invoiceNumber);
      report.alerts.push(`Factura ${inv.invoiceNumber}: încărcarea s-a întrerupt. Verificați în SPV; nu se retrimite automat.`);
    }
  }

  const ready = open.filter((i) => i.uploadStatus === "ready" && i.xml);
  if (ready.length === 0) return report;

  let token: string | null = null;
  if (deps.uploadEnabled) {
    try {
      token = await deps.accessToken();
    } catch (e) {
      report.alerts.push(`Nu se pot trimite ${ready.length} facturi: autorizarea ANAF lipsește sau a expirat (${e instanceof Error ? e.message : "eroare"}).`);
      return report;
    }
  }

  // Originals before stornos, oldest first.
  ready.sort((a, b) => Number(Boolean(a.stornoOf)) - Number(Boolean(b.stornoOf)) || a.issueDate.localeCompare(b.issueDate));

  for (const inv of ready) {
    if (inv.stornoOf) {
      const originalStatus = await deps.store.statusOf(inv.stornoOf);
      if (originalStatus !== "accepted") { report.waitingForOriginal.push(inv.invoiceNumber); continue; }
    }

    let validation: ValidationResult;
    try {
      validation = await deps.anaf.validate(inv.xml!);
    } catch (e) {
      report.alerts.push(`Validatorul ANAF nu a răspuns pentru ${inv.invoiceNumber}; reîncercăm mâine.`);
      continue;
    }
    if (!validation.valid) {
      await deps.store.markBack(inv.id, "invalid", validation.errors.join(" | ").slice(0, 1000));
      report.invalid.push({ number: inv.invoiceNumber, errors: validation.errors });
      report.alerts.push(`Factura ${inv.invoiceNumber} nu trece validarea ANAF: ${validation.errors.slice(0, 3).join("; ")}`);
      continue;
    }

    if (!deps.uploadEnabled || !token) { report.shadowValidated.push(inv.invoiceNumber); continue; }

    if (!(await deps.store.claim(inv.id))) continue;
    try {
      const res = await deps.anaf.upload(inv.xml!, deps.cif, token);
      await deps.store.markUploaded(inv.id, res.indexIncarcare);
      report.uploaded.push(inv.invoiceNumber);
    } catch (e) {
      if (e instanceof AnafRefusal) {
        await deps.store.markBack(inv.id, "ready", `ANAF a refuzat încărcarea (HTTP ${e.status}): ${e.message}`.slice(0, 1000));
        report.alerts.push(`ANAF a refuzat încărcarea facturii ${inv.invoiceNumber} (HTTP ${e.status}); reîncercăm mâine.`);
      } else {
        await deps.store.markBack(inv.id, "upload_unknown", `Încărcare cu rezultat necunoscut: ${e instanceof Error ? e.message : "eroare"}`.slice(0, 1000));
        report.parked.push(inv.invoiceNumber);
        report.alerts.push(`Factura ${inv.invoiceNumber}: nu știm dacă a ajuns la ANAF. Verificați în SPV; nu se retrimite automat.`);
      }
    }
  }
  return report;
}
