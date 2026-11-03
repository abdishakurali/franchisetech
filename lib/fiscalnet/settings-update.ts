// Builds the organisations update for saveFiscalNetSettings from ONLY the
// fields the form actually sent. The settings and onboarding cards send a
// handful of fields; writing defaults for the rest used to wipe the CUI
// printed on reports (fiscalnet_cif), the VAT-group and payment-type maps,
// paths and timeouts on every save.

import type { FiscalPaymentCode, VatGroup } from "@/lib/fiscalnet";

export type FiscalNetSettingsUpdate = Record<string, unknown>;

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export function fiscalNetSettingsUpdate(
  formData: FormData,
  validatePath: (path: string) => void,
): { update: FiscalNetSettingsUpdate } | { error: string } {
  const has = (key: string) => formData.has(key);
  const update: FiscalNetSettingsUpdate = {};

  if (has("fiscalnet_enabled")) update.fiscalnet_enabled = formData.get("fiscalnet_enabled") === "true";
  if (has("fiscalnet_mock_mode")) update.fiscalnet_mock_mode = formData.get("fiscalnet_mock_mode") !== "false";
  if (has("fiscalnet_connection_mode")) update.fiscalnet_connection_mode = formData.get("fiscalnet_connection_mode") === "file" ? "file" : "api";
  if (has("fiscalnet_api_host")) update.fiscalnet_api_host = (text(formData, "fiscalnet_api_host") || "http://localhost:65400").replace(/\/$/, "");
  if (has("fiscalnet_auto_print")) update.fiscalnet_auto_print = formData.get("fiscalnet_auto_print") !== "false";
  if (has("fiscalnet_ask_before_print")) update.fiscalnet_ask_before_print = formData.get("fiscalnet_ask_before_print") === "true";
  if (has("fiscalnet_manual_only")) update.fiscalnet_manual_only = formData.get("fiscalnet_manual_only") === "true";
  if (has("fiscalnet_operator_code")) update.fiscalnet_operator_code = text(formData, "fiscalnet_operator_code") || "1";
  if (has("fiscalnet_cif")) update.fiscalnet_cif = text(formData, "fiscalnet_cif") || null;

  if (has("fiscalnet_timeout_ms")) {
    const n = Number(text(formData, "fiscalnet_timeout_ms"));
    update.fiscalnet_timeout_ms = Math.min(Math.max(Number.isFinite(n) ? n : 30000, 5000), 120000);
  }
  if (has("fiscalnet_retry_count")) {
    const n = Number(text(formData, "fiscalnet_retry_count"));
    update.fiscalnet_retry_count = Math.min(Math.max(Number.isFinite(n) ? n : 2, 0), 5);
  }

  for (const key of ["fiscalnet_bonuri_path", "fiscalnet_raspuns_path"] as const) {
    if (!has(key)) continue;
    const path = text(formData, key) || null;
    if (path) {
      try { validatePath(path); } catch { return { error: key === "fiscalnet_bonuri_path" ? "Invalid Bonuri path." : "Invalid Raspuns path." }; }
    }
    update[key] = path;
  }

  if (has("fiscalnet_vat_groups")) {
    try {
      const parsed = JSON.parse(text(formData, "fiscalnet_vat_groups")) as unknown;
      if (!Array.isArray(parsed)) return { error: "Grupele TVA FiscalNet nu sunt valide." };
      update.fiscalnet_vat_groups = parsed as VatGroup[];
    } catch { return { error: "Grupele TVA FiscalNet nu sunt valide." }; }
  }
  if (has("fiscalnet_payment_type_map")) {
    try {
      const parsed = JSON.parse(text(formData, "fiscalnet_payment_type_map")) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { error: "Codurile de plată FiscalNet nu sunt valide." };
      update.fiscalnet_payment_type_map = parsed as Record<string, FiscalPaymentCode>;
    } catch { return { error: "Codurile de plată FiscalNet nu sunt valide." }; }
  }

  return { update };
}
