// SALUT TECH's own subscription invoices: a paid Stripe invoice becomes one
// RO e-Factura. This module is pure — it maps a Stripe invoice to an invoice
// draft, or says exactly what's missing. It never guesses buyer data: a wrong
// CUI or county on a legal invoice is worse than holding it for a human.

import type { UblAddress, UblLineItem } from "@/lib/anaf/ubl-builder";

/** ISO 3166-2:RO county codes, keyed by name without diacritics. */
const COUNTY_CODES: Record<string, string> = {
  alba: "RO-AB", arad: "RO-AR", arges: "RO-AG", bacau: "RO-BC", bihor: "RO-BH",
  "bistrita-nasaud": "RO-BN", botosani: "RO-BT", brasov: "RO-BV", braila: "RO-BR",
  bucuresti: "RO-B", buzau: "RO-BZ", "caras-severin": "RO-CS", calarasi: "RO-CL",
  cluj: "RO-CJ", constanta: "RO-CT", covasna: "RO-CV", dambovita: "RO-DB", dolj: "RO-DJ",
  galati: "RO-GL", giurgiu: "RO-GR", gorj: "RO-GJ", harghita: "RO-HR", hunedoara: "RO-HD",
  ialomita: "RO-IL", iasi: "RO-IS", ilfov: "RO-IF", maramures: "RO-MM", mehedinti: "RO-MH",
  mures: "RO-MS", neamt: "RO-NT", olt: "RO-OT", prahova: "RO-PH", "satu mare": "RO-SM",
  salaj: "RO-SJ", sibiu: "RO-SB", suceava: "RO-SV", teleorman: "RO-TR", timis: "RO-TM",
  tulcea: "RO-TL", vaslui: "RO-VS", valcea: "RO-VL", vrancea: "RO-VN",
};

function plain(value: string): string {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/^(judetul|jud\.?|municipiul|mun\.?)\s+/, "").trim();
}

export type StripeAddressLike = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

/**
 * CIUS-RO wants an ISO county code, and for București the city must be
 * SECTOR1–SECTOR6 (BR-RO-100/101). Returns null when that can't be read
 * from the address — the caller holds the invoice instead of guessing.
 */
export function romanianAddress(addr: StripeAddressLike | null | undefined): UblAddress | null {
  if (!addr || (addr.country ?? "").toUpperCase() !== "RO") return null;
  const street = [addr.line1, addr.line2].filter((s) => s && s.trim()).join(", ").trim();
  if (!street) return null;
  const all = [addr.line1, addr.line2, addr.city, addr.state].filter(Boolean).join(" ");
  const isBucharest = /bucure[sș]ti|bucharest/i.test(all) || plain(addr.state ?? "") === "bucuresti";
  if (isBucharest) {
    const sector = plain(all).match(/sector(?:ul)?\s*([1-6])\b/);
    if (!sector) return null;
    return { street, city: `SECTOR${sector[1]}`, postalCode: addr.postal_code ?? undefined, countrySubentity: "RO-B", countryCode: "RO" };
  }
  const county = COUNTY_CODES[plain(addr.state ?? "")];
  const city = (addr.city ?? "").trim();
  if (!county || !city) return null;
  return { street, city, postalCode: addr.postal_code ?? undefined, countrySubentity: county, countryCode: "RO" };
}

/** "RO28279356" or "28279356" → digits; anything else → null. */
export function romanianCui(value: string | null | undefined): string | null {
  const digits = (value ?? "").trim().toUpperCase().replace(/^RO/, "");
  return /^[0-9]{2,10}$/.test(digits) ? digits : null;
}

export type StripeInvoiceLike = {
  id: string;
  livemode: boolean;
  currency: string;
  amount_paid: number;
  customer_name?: string | null;
  customer_address?: StripeAddressLike | null;
  customer_tax_ids?: Array<{ type: string; value: string | null }> | null;
  status_transitions?: { paid_at?: number | null } | null;
  lines: { data: Array<{ description?: string | null; amount: number; quantity?: number | null; discount_amounts?: Array<{ amount: number }> | null }> };
};

export type PlatformInvoiceConfig = {
  vatCategory: "O" | "E";
  exemptionReason?: string;
};

export type PlatformInvoiceDraft = {
  stripeInvoiceId: string;
  issueDate: string;
  currency: string;
  buyerName: string;
  buyerCif: string;
  buyerTaxId: string;
  buyerAddress: UblAddress;
  lines: UblLineItem[];
  totalInclVat: number;
  paymentTerms: string;
};

export type PlatformInvoiceMapping =
  | { kind: "skip"; reason: string }
  | { kind: "needs_data"; reason: string }
  | { kind: "ready"; draft: PlatformInvoiceDraft };

export function bucharestDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date(unixSeconds * 1000));
}

export function mapStripeInvoice(inv: StripeInvoiceLike, config: PlatformInvoiceConfig): PlatformInvoiceMapping {
  if (!inv.livemode) return { kind: "skip", reason: "test-mode invoice" };
  if (!(inv.amount_paid > 0)) return { kind: "skip", reason: "nothing was paid" };

  const taxId = (inv.customer_tax_ids ?? []).find((t) => t.type === "ro_tin")?.value ?? null;
  const cui = romanianCui(taxId);
  if (!cui) return { kind: "needs_data", reason: "Clientul nu are CUI românesc (ro_tin) în Stripe." };
  const name = (inv.customer_name ?? "").trim();
  if (!name) return { kind: "needs_data", reason: "Clientul nu are denumire în Stripe." };
  const address = romanianAddress(inv.customer_address);
  if (!address) return { kind: "needs_data", reason: "Adresa clientului nu are județ valid (sau sector, pentru București)." };

  const lines: UblLineItem[] = [];
  let netCents = 0;
  inv.lines.data.forEach((l, i) => {
    const qty = l.quantity && l.quantity > 0 ? l.quantity : 1;
    const net = l.amount - (l.discount_amounts ?? []).reduce((s, d) => s + d.amount, 0);
    netCents += net;
    lines.push({ id: i + 1, name: (l.description ?? "Abonament franchisetech").slice(0, 200), unitCode: "C62", quantity: qty, unitPrice: net / 100 / qty, vatRate: 0, vatCategoryId: config.vatCategory });
  });
  // Credits, taxes or proration we don't model: hold rather than misstate the invoice.
  if (lines.length === 0 || netCents !== inv.amount_paid) {
    return { kind: "needs_data", reason: `Liniile facturii Stripe (${netCents / 100}) nu dau suma plătită (${inv.amount_paid / 100}).` };
  }
  const paidAt = inv.status_transitions?.paid_at;
  if (!paidAt) return { kind: "needs_data", reason: "Factura Stripe nu are data plății." };

  return {
    kind: "ready",
    draft: {
      stripeInvoiceId: inv.id,
      issueDate: bucharestDate(paidAt),
      currency: inv.currency.toUpperCase(),
      buyerName: name,
      buyerCif: cui,
      buyerTaxId: (taxId ?? "").trim().toUpperCase(),
      buyerAddress: address,
      lines,
      totalInclVat: inv.amount_paid / 100,
      paymentTerms: "Plătit cu cardul la data emiterii.",
    },
  };
}
