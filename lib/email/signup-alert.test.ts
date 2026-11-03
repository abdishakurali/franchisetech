import { afterEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));

const { buildSignupAlertEmail, sendSignupAlertEmail } = await import("./signup-alert");

const alert = {
  orgName: "Cafenea <Test> & Co",
  businessType: "cafenea",
  contactName: "Ana",
  email: "ana@example.ro",
  countryCode: "RO",
  locationBand: "1",
  utm: ["facebook", undefined, "fiscal-fear"],
};

afterEach(() => {
  send.mockReset();
  vi.unstubAllEnvs();
});

describe("signup alert email", () => {
  it("names the business, escapes it, and asks for a call within 24h", () => {
    const { subject, html } = buildSignupAlertEmail(alert);
    expect(subject).toBe("Cont nou — Cafenea <Test> & Co (cafenea)");
    expect(html).toContain("Cafenea &lt;Test&gt; &amp; Co");
    expect(html).not.toContain("<Test>");
    expect(html).toContain("ana@example.ro");
    expect(html).toContain("facebook / fiscal-fear");
    expect(html).toContain("în 24 de ore");
  });

  it("shows a dash for missing optional fields", () => {
    const { html } = buildSignupAlertEmail({ ...alert, businessType: null, contactName: " ", utm: [] });
    expect(html).toContain("<strong>Tip afacere:</strong> —");
    expect(html).toContain("<strong>Persoană de contact:</strong> —");
    expect(html).toContain("<strong>UTM:</strong> —");
  });

  it("sends to the sales inbox with the customer as reply-to", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("SALES_EMAIL", "sales@example.ro");
    send.mockResolvedValue({ error: null });
    expect(await sendSignupAlertEmail(alert)).toEqual({ success: true });
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: ["sales@example.ro"], replyTo: "ana@example.ro" }));
  });

  it("reports failure instead of claiming it was sent", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    expect(await sendSignupAlertEmail(alert)).toEqual({ success: false, error: "RESEND_API_KEY not configured" });
    vi.stubEnv("RESEND_API_KEY", "re_test");
    send.mockResolvedValue({ error: { message: "rate limited" } });
    expect(await sendSignupAlertEmail(alert)).toEqual({ success: false, error: "rate limited" });
  });
});
