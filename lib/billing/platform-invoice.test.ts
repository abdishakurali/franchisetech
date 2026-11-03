import { describe, expect, it, vi } from "vitest";
import { mapStripeInvoice, romanianAddress, romanianCui, type StripeInvoiceLike } from "./platform-invoice";
import {
  queuePlatformInvoice,
  queuePlatformStorno,
  type NewInvoiceRow,
  type PlatformInvoiceStore,
  type QueueDeps,
  type StoredInvoice,
} from "./platform-invoice-queue";

// ── In-memory store with the database's guarantees ───────────────────────────
// unique (organisation_id, stripe_invoice_id), one storno per invoice, and a
// locked, gap-free counter like issue_sales_invoice. Every call yields to the
// event loop so concurrent calls genuinely interleave.
function memoryStore() {
  const rows = new Map<string, StoredInvoice>();
  let nextId = 1;
  let nextNumber = 1;
  let lock: Promise<void> = Promise.resolve();
  const tick = () => new Promise<void>((r) => setTimeout(r, Math.random() * 3));
  const store: PlatformInvoiceStore & { rows: Map<string, StoredInvoice>; xml: Map<string, string> } = {
    rows,
    xml: new Map(),
    async insert(row: NewInvoiceRow) {
      await tick();
      const clash = [...rows.values()].some((r) =>
        (row.stripeInvoiceId && r.stripeInvoiceId === row.stripeInvoiceId) || (row.stornoOf && r.stornoOf === row.stornoOf));
      if (clash) return "conflict";
      const id = `inv-${nextId++}`;
      rows.set(id, { id, invoiceNumber: row.draftNumber, issued: false, uploadStatus: row.uploadStatus, stripeInvoiceId: row.stripeInvoiceId, stornoOf: row.stornoOf, issueDate: row.issueDate, currency: row.currency, buyerName: row.buyerName, buyerCif: row.buyerCif, buyerTaxId: row.buyerTaxId, buyerAddress: row.buyerAddress, lines: row.lines, note: row.note });
      return { id };
    },
    async findByStripeInvoiceId(id) { await tick(); return [...rows.values()].find((r) => r.stripeInvoiceId === id) ?? null; },
    async findStornoOf(id) { await tick(); return [...rows.values()].find((r) => r.stornoOf === id) ?? null; },
    async issue(id) {
      const run = lock.then(async () => {
        await tick();
        const row = rows.get(id)!;
        if (!row.issued) { row.invoiceNumber = `SLT${nextNumber++}`; row.issued = true; }
        return { invoiceNumber: row.invoiceNumber };
      });
      lock = run.then(() => undefined, () => undefined);
      return run;
    },
    async saveXml(id, xml) { await tick(); store.xml.set(id, xml); const r = rows.get(id)!; r.uploadStatus = "ready"; },
  };
  return store;
}

const seller = {
  name: "SALUT TECH S.R.L.", taxId: "49702253", legalId: "49702253",
  address: { street: "Str. Orhideelor nr. 15", city: "Dobroesti", countrySubentity: "RO-IF", countryCode: "RO" },
};

function deps(store = memoryStore()) {
  const alert = vi.fn().mockResolvedValue(undefined);
  const d: QueueDeps = { store, seller, config: { vatCategory: "O" }, alert };
  return { d, store, alert };
}

function stripeInvoice(id: string, over: Partial<StripeInvoiceLike> = {}): StripeInvoiceLike {
  return {
    id, livemode: true, currency: "eur", amount_paid: 4900,
    customer_name: "ABI FLOWERS BOUTIQUE S.R.L.",
    customer_address: { line1: "Str. Cristea Mateescu 4", line2: "Sector 2", city: "București", state: null, postal_code: null, country: "RO" },
    customer_tax_ids: [{ type: "ro_tin", value: "28279356" }],
    status_transitions: { paid_at: 1793700000 },
    lines: { data: [{ description: "franchisetech Pro", amount: 4900, quantity: 1, discount_amounts: [] }] },
    ...over,
  };
}

describe("buyer data is read, never guessed", () => {
  it("maps București addresses to RO-B + SECTORn and refuses without a sector", () => {
    expect(romanianAddress({ line1: "Str. A 1", line2: "Sector 2", city: "București", country: "RO" })).toMatchObject({ city: "SECTOR2", countrySubentity: "RO-B" });
    expect(romanianAddress({ line1: "Str. A 1", city: "Bucharest", state: "Sectorul 6", country: "RO" })).toMatchObject({ city: "SECTOR6" });
    expect(romanianAddress({ line1: "Str. A 1", city: "Bucharest", country: "RO" })).toBeNull();
  });

  it("maps county names with or without diacritics, and refuses unknown counties or foreign addresses", () => {
    expect(romanianAddress({ line1: "Str. B 2", city: "Dobroești", state: "Județul Ilfov", country: "RO" })).toMatchObject({ countrySubentity: "RO-IF", city: "Dobroești" });
    expect(romanianAddress({ line1: "Str. B 2", city: "Cluj-Napoca", state: "Cluj", country: "RO" })).toMatchObject({ countrySubentity: "RO-CJ" });
    expect(romanianAddress({ line1: "Str. B 2", city: "X", state: "Atlantis", country: "RO" })).toBeNull();
    expect(romanianAddress({ line1: "1 Main St", city: "Dublin", country: "IE" })).toBeNull();
  });

  it("accepts a CUI with or without RO, and nothing else", () => {
    expect(romanianCui("RO28279356")).toBe("28279356");
    expect(romanianCui(" 28279356 ")).toBe("28279356");
    expect(romanianCui("ABC")).toBeNull();
    expect(romanianCui(null)).toBeNull();
  });

  it("holds the invoice when the CUI, address or totals are missing", () => {
    expect(mapStripeInvoice(stripeInvoice("a", { customer_tax_ids: [] }), { vatCategory: "O" }).kind).toBe("needs_data");
    expect(mapStripeInvoice(stripeInvoice("b", { customer_address: { line1: "X", city: "Bucharest", country: "RO" } }), { vatCategory: "O" }).kind).toBe("needs_data");
    expect(mapStripeInvoice(stripeInvoice("c", { amount_paid: 3000 }), { vatCategory: "O" }).kind).toBe("needs_data");
  });

  it("skips test-mode and unpaid invoices", () => {
    expect(mapStripeInvoice(stripeInvoice("d", { livemode: false }), { vatCategory: "O" }).kind).toBe("skip");
    expect(mapStripeInvoice(stripeInvoice("e", { amount_paid: 0 }), { vatCategory: "O" }).kind).toBe("skip");
  });

  it("applies discounts per line and dates the invoice in Bucharest time", () => {
    const m = mapStripeInvoice(stripeInvoice("f", { amount_paid: 4900, lines: { data: [{ description: "Pro", amount: 7900, quantity: 1, discount_amounts: [{ amount: 3000 }] }] } }), { vatCategory: "O" });
    expect(m.kind).toBe("ready");
    if (m.kind === "ready") {
      expect(m.draft.lines[0].unitPrice).toBe(49);
      expect(m.draft.issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("one paid Stripe invoice → exactly one e-Factura", () => {
  it("issues a numbered, category-O invoice ready for upload", async () => {
    const { d, store } = deps();
    const r = await queuePlatformInvoice(stripeInvoice("in_1"), d);
    expect(r).toMatchObject({ status: "ready", invoiceNumber: "SLT1" });
    const xml = [...store.xml.values()][0];
    expect(xml).toContain("<cbc:ID>SLT1</cbc:ID>");
    expect(xml).toContain("VATEX-EU-O");
    expect(xml).toContain("<cbc:CityName>SECTOR2</cbc:CityName>");
  });

  it("replaying the same event 5 times still gives one invoice", async () => {
    const { d, store } = deps();
    for (let i = 0; i < 5; i++) await queuePlatformInvoice(stripeInvoice("in_1"), d);
    expect(store.rows.size).toBe(1);
    expect([...store.rows.values()][0].invoiceNumber).toBe("SLT1");
  });

  it("5 concurrent deliveries of the same event give one invoice", async () => {
    const { d, store } = deps();
    const results = await Promise.all(Array.from({ length: 5 }, () => queuePlatformInvoice(stripeInvoice("in_1"), d)));
    expect(store.rows.size).toBe(1);
    expect(new Set(results.map((r) => (r.status === "ready" ? r.invoiceNumber : "x")))).toEqual(new Set(["SLT1"]));
  });

  it("20 concurrent different payments get 20 numbers with no gaps or duplicates", async () => {
    const { d, store } = deps();
    await Promise.all(Array.from({ length: 20 }, (_, i) => queuePlatformInvoice(stripeInvoice(`in_${i}`), d)));
    const numbers = [...store.rows.values()].map((r) => Number(r.invoiceNumber.replace("SLT", ""))).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("resumes a row that was saved but never numbered (crash between steps)", async () => {
    const store = memoryStore();
    await store.insert({ stripeInvoiceId: "in_9", stornoOf: null, draftNumber: "CIORNA-in_9", uploadStatus: "draft", errorMessage: null, issueDate: "2026-11-03", currency: "EUR", buyerName: "X S.R.L.", buyerCif: "28279356", buyerTaxId: "28279356", buyerAddress: { street: "S 1", city: "SECTOR2", countrySubentity: "RO-B", countryCode: "RO" }, lines: [{ id: 1, name: "Pro", unitCode: "C62", quantity: 1, unitPrice: 49, vatRate: 0, vatCategoryId: "O" }], totalInclVat: 49, note: null });
    const { d } = deps(store);
    expect(await queuePlatformInvoice(stripeInvoice("in_9"), d)).toMatchObject({ status: "ready", invoiceNumber: "SLT1", resumed: true });
  });

  it("holds and alerts, without a number, when buyer data is missing — once", async () => {
    const { d, store, alert } = deps();
    const bad = stripeInvoice("in_x", { customer_tax_ids: [] });
    expect(await queuePlatformInvoice(bad, d)).toMatchObject({ status: "needs_data" });
    await queuePlatformInvoice(bad, d);
    expect(store.rows.size).toBe(1);
    expect([...store.rows.values()][0].issued).toBe(false);
    expect(alert).toHaveBeenCalledTimes(1);
  });

  it("does nothing for a failed (unpaid) or test-mode payment", async () => {
    const { d, store } = deps();
    await queuePlatformInvoice(stripeInvoice("in_0", { amount_paid: 0 }), d);
    await queuePlatformInvoice(stripeInvoice("in_t", { livemode: false }), d);
    expect(store.rows.size).toBe(0);
  });
});

describe("refunds", () => {
  it("a full refund creates one negative storno that references the original, even when replayed", async () => {
    const { d, store } = deps();
    await queuePlatformInvoice(stripeInvoice("in_1"), d);
    await Promise.all([queuePlatformStorno("in_1", d), queuePlatformStorno("in_1", d), queuePlatformStorno("in_1", d)]);
    const stornos = [...store.rows.values()].filter((r) => r.stornoOf);
    expect(stornos).toHaveLength(1);
    expect(stornos[0].lines[0].quantity).toBe(-1);
    expect(stornos[0].note).toBe("Stornare factura SLT1");
    expect(stornos[0].invoiceNumber).toBe("SLT2");
  });

  it("a refund with no issued invoice is held and alerted, never invented", async () => {
    const { d, alert } = deps();
    expect(await queuePlatformStorno("in_none", d)).toMatchObject({ status: "skipped" });
    await queuePlatformInvoice(stripeInvoice("in_h", { customer_tax_ids: [] }), d);
    expect(await queuePlatformStorno("in_h", d)).toMatchObject({ status: "needs_data" });
    expect(alert).toHaveBeenCalledTimes(2);
  });
});
