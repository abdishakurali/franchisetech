// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const completePosOnboarding = vi.fn();
const lookupAnafCompany = vi.fn();
vi.mock("@/app/actions/onboarding", () => ({ completePosOnboarding }));
vi.mock("@/app/actions/partner-lookup", () => ({ lookupAnafCompany }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { getUser: async () => ({ data: { user: null } }) } }),
}));
vi.mock("@/lib/marketing/acquisition", () => ({ readAcquisitionClient: () => null }));
vi.mock("@/lib/billing/preferred-plan", () => ({ readPreferredPlanClient: () => null }));
vi.mock("@/lib/analytics/client-events", () => ({ captureClientEvent: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const { default: OnboardingPage } = await import("@/app/onboarding/page");
const { toast } = await import("sonner");

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.localStorage.clear();
});

function fillName() {
  fireEvent.change(screen.getByLabelText("Numele firmei / brandului"), { target: { value: "Cafea Test" } });
}

describe("onboarding step 1 VAT question", () => {
  it("has no answer preselected", () => {
    render(<OnboardingPage />);
    expect((screen.getByRole("radio", { name: "Da" }) as HTMLInputElement).checked).toBe(false);
    expect((screen.getByRole("radio", { name: "Nu" }) as HTMLInputElement).checked).toBe(false);
  });

  it("blocks Continuă until the question is answered", async () => {
    render(<OnboardingPage />);
    fillName();
    fireEvent.click(screen.getByRole("button", { name: /Continuă/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Alegeți dacă firma este plătitoare de TVA."));
    expect(completePosOnboarding).not.toHaveBeenCalled();
  });

  it.each([
    ["Da", true],
    ["Nu", false],
  ])("sends the explicit answer %s", async (label, expected) => {
    completePosOnboarding.mockResolvedValue(undefined);
    render(<OnboardingPage />);
    fillName();
    fireEvent.click(screen.getByRole("radio", { name: label }));
    fireEvent.click(screen.getByRole("button", { name: /Continuă/ }));
    await waitFor(() => expect(completePosOnboarding).toHaveBeenCalled());
    expect(completePosOnboarding.mock.calls[0][0]).toMatchObject({ anafVatRegistered: expected, orgName: "Cafea Test" });
  });

  it("ignores an old draft's unchecked box (it was never an answer)", () => {
    window.localStorage.setItem("franchisetech:onboarding-draft", JSON.stringify({ form: { name: "Vechi", anafVatRegistered: false } }));
    render(<OnboardingPage />);
    expect((screen.getByRole("radio", { name: "Nu" }) as HTMLInputElement).checked).toBe(false);
  });

  it("prefills the answer from an ANAF lookup", async () => {
    lookupAnafCompany.mockResolvedValue({ name: "SC Test SRL", cui: "123456", vatRegistered: true, address: "Cluj", registrationCode: "J12/1/2020" });
    render(<OnboardingPage />);
    fireEvent.change(screen.getByLabelText(/CUI firmă/), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "ANAF" }));
    await waitFor(() => expect((screen.getByRole("radio", { name: "Da" }) as HTMLInputElement).checked).toBe(true));
  });
});
