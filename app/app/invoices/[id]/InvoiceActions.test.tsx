// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/app/actions/efactura", () => ({
  createStornoInvoice: vi.fn(),
  generateInvoiceXml: vi.fn(),
  issueSalesInvoice: vi.fn(),
  submitInvoiceToAnaf: vi.fn(),
}));

const { default: InvoiceActions } = await import("./InvoiceActions");

describe("B2B invoice actions", () => {
  afterEach(cleanup);

  it("keeps local invoice actions available and offers setup only at ANAF sending", () => {
    render(
      <InvoiceActions
        invoiceId="invoice-1"
        canSubmit
        isSubmitted={false}
        efacturaEnabled={false}
        anafConnected={false}
        hasXml={false}
        issued
        canStorno
      />,
    );

    expect(screen.getByRole("button", { name: "Stornează" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: /Descarcă PDF/ }).hasAttribute("disabled")).toBe(false);
    // No self-serve e-Factura switch exists, so say so instead of linking to a dead end.
    expect(screen.getByText(/nu este activă pentru firma dumneavoastră/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "cereți activarea" }).getAttribute("href")).toBe("/contact");
    expect(screen.queryByRole("button", { name: "Trimite la ANAF" })).toBeNull();
  });
});
