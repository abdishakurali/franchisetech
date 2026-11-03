import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { platformInvoiceDeps } from "./platform-invoice-store";

const db = {} as SupabaseClient;

afterEach(() => vi.unstubAllEnvs());

describe("platform invoicing switch", () => {
  it("is off unless PLATFORM_BILLING_ORG_ID is set", () => {
    vi.stubEnv("PLATFORM_BILLING_ORG_ID", "");
    expect(platformInvoiceDeps(db)).toBeNull();
  });

  it("defaults to category O and uses SALUT TECH's registry address as seller", () => {
    vi.stubEnv("PLATFORM_BILLING_ORG_ID", "org-1");
    const deps = platformInvoiceDeps(db)!;
    expect(deps.config).toEqual({ vatCategory: "O", exemptionReason: undefined });
    expect(deps.seller).toMatchObject({ taxId: "49702253", address: { countrySubentity: "RO-IF", postalCode: "077085" } });
  });

  it("switches to E with the configured exemption reason", () => {
    vi.stubEnv("PLATFORM_BILLING_ORG_ID", "org-1");
    vi.stubEnv("PLATFORM_VAT_CATEGORY", "E");
    vi.stubEnv("PLATFORM_VAT_EXEMPTION_REASON", "Scutit conform art. 310 Cod fiscal");
    expect(platformInvoiceDeps(db)!.config).toEqual({ vatCategory: "E", exemptionReason: "Scutit conform art. 310 Cod fiscal" });
  });
});
