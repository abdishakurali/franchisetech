import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
const capture = vi.fn();
const inserted: Record<string, unknown>[] = [];
const updates: Record<string, unknown>[] = [];
let existingLeads: { id: string }[] = [];
let insertError: { code: string; message: string } | null = null;

vi.mock("@/lib/email/demo-lead", () => ({ sendDemoLeadEmail: (...a: unknown[]) => send(...a), salesInbox: () => "info@franchisetech.ro" }));
vi.mock("@/lib/posthog-server", () => ({ captureServerEventAsync: (...a: unknown[]) => capture(...a) }));
vi.mock("@/lib/kitchenops/data", () => ({
  getActiveOrg: async () => ({
    orgId: "org-1",
    user: { id: "user-1", email: "Owner@Cafe.ro", user_metadata: {} },
    profile: { full_name: "Ana Pop" },
    supabase: {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { name: "Cafe Test SRL", business_type: "Cafenea", location_band: "one" } }) }) }),
      }),
    },
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ eq: () => ({ gte: () => ({ limit: async () => ({ data: existingLeads }) }) }) }) }),
      insert: (row: Record<string, unknown>) => {
        inserted.push(row);
        return { select: () => ({ single: async () => (insertError ? { data: null, error: insertError } : { data: { id: "lead-1" }, error: null }) }) };
      },
      update: (row: Record<string, unknown>) => {
        updates.push(row);
        return { eq: async () => ({ error: null }) };
      },
    }),
  }),
}));

const { requestFiscalSetupHelp } = await import("./fiscal-setup-help");

beforeEach(() => {
  send.mockReset().mockResolvedValue({ success: true });
  capture.mockReset();
  inserted.length = 0;
  updates.length = 0;
  existingLeads = [];
  insertError = null;
});

const input = { phone: "0722 123 456", deviceBrand: "Datecs", lastProbeMessage: "FiscalNet nu răspunde pe acest calculator." };

describe("requestFiscalSetupHelp", () => {
  it("stores the request against the org, emails it as a fiscal-setup request and tracks it", async () => {
    const result = await requestFiscalSetupHelp(input);

    expect(result).toEqual({ ok: true });
    expect(inserted[0]).toMatchObject({
      business_name: "Cafe Test SRL",
      contact_name: "Ana Pop",
      email: "owner@cafe.ro",
      phone: "0722 123 456",
      cta_id: "fiscal_setup_help",
      source_page: "/onboarding/fiscal",
      organisation_id: "org-1",
      status: "new",
    });
    expect(String(inserted[0].message)).toContain("Datecs");
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ ctaId: "fiscal_setup_help" }), "lead-1", "fiscal_setup");
    expect(updates[0]).toMatchObject({ email_status: "sent" });
    expect(capture).toHaveBeenCalledWith("user-1", "fiscal_setup_help_requested", expect.objectContaining({ stored: true, notified: true }));
  });

  it("rejects an invalid phone without storing or emailing", async () => {
    const result = await requestFiscalSetupHelp({ ...input, phone: "123" });
    expect(result.ok).toBe(false);
    expect(inserted).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("does not create a second request within 24h", async () => {
    existingLeads = [{ id: "lead-0" }];
    const result = await requestFiscalSetupHelp(input);
    expect(result).toEqual({ ok: true, duplicate: true });
    expect(inserted).toHaveLength(0);
    expect(send).not.toHaveBeenCalled();
  });

  it("still succeeds when the email fails but the request is stored, and records the failure", async () => {
    send.mockResolvedValue({ success: false, error: "smtp down" });
    const result = await requestFiscalSetupHelp(input);
    expect(result).toEqual({ ok: true });
    expect(updates[0]).toMatchObject({ email_status: "failed", email_error: "smtp down" });
  });

  it("never claims success when the request is neither stored nor emailed", async () => {
    insertError = { code: "XX000", message: "db down" };
    send.mockResolvedValue({ success: false, error: "smtp down" });
    const result = await requestFiscalSetupHelp(input);
    expect(result.ok).toBe(false);
    expect(result).toMatchObject({ error: expect.stringContaining("info@franchisetech.ro") });
    expect(capture).not.toHaveBeenCalled();
  });
});
