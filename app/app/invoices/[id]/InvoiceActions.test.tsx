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
    expect(screen.getByRole("link", { name: /Configurează și trimite la ANAF/ }).getAttribute("href"))
      .toBe("/app/settings?tab=integrations#marketplace");
    expect(screen.queryByRole("button", { name: "Trimite la ANAF" })).toBeNull();
  });
});
