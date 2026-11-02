// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const probeFiscalNet = vi.fn();
const requestFiscalSetupHelp = vi.fn();

vi.mock("@/app/actions/fiscalnet", () => ({ saveFiscalNetSettings: vi.fn() }));
vi.mock("@/app/actions/onboarding-steps", () => ({ advanceFromFiscal: vi.fn() }));
vi.mock("@/app/actions/fiscal-setup-help", () => ({ requestFiscalSetupHelp }));
vi.mock("@/lib/fiscalnet/probe", () => ({ probeFiscalNet }));
vi.mock("@/lib/analytics/client-events", () => ({ captureClientEvent: vi.fn() }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const { FiscalOnboardingCard } = await import("@/components/onboarding/FiscalOnboardingCard");
const { toast } = await import("sonner");

const liveInitial = { enabled: true, mockMode: false, apiHost: "http://localhost:65400", operatorCode: "1" };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FiscalOnboardingCard", () => {
  it("checks FiscalNet from the browser and never claims the register is connected", async () => {
    probeFiscalNet.mockResolvedValue({ reachable: true, message: "FiscalNet răspunde pe acest calculator." });
    render(<FiscalOnboardingCard initial={liveInitial} />);

    fireEvent.click(screen.getByRole("button", { name: "Verifică FiscalNet" }));

    await screen.findByText("● FiscalNet răspunde");
    expect(probeFiscalNet).toHaveBeenCalledWith("http://localhost:65400");
    expect(screen.queryByText(/Conectat/)).toBeNull();
  });

  it("offers assisted setup after a failed check and confirms only once the request succeeds", async () => {
    probeFiscalNet.mockResolvedValue({ reachable: false, message: "FiscalNet nu răspunde pe acest calculator." });
    requestFiscalSetupHelp.mockResolvedValue({ ok: true });
    render(<FiscalOnboardingCard initial={liveInitial} />);

    fireEvent.click(screen.getByRole("button", { name: "Verifică FiscalNet" }));
    await screen.findByText("● FiscalNet nu răspunde");

    fireEvent.change(screen.getByLabelText("Număr de telefon"), { target: { value: "0722 123 456" } });
    fireEvent.click(screen.getByRole("button", { name: "Sunați-mă" }));

    await screen.findByText(/Am primit cererea/);
    expect(requestFiscalSetupHelp).toHaveBeenCalledWith({
      phone: "0722 123 456",
      deviceBrand: null,
      lastProbeMessage: "FiscalNet nu răspunde pe acest calculator.",
    });
  });

  it("shows the error and keeps the form when the request fails", async () => {
    requestFiscalSetupHelp.mockResolvedValue({ ok: false, error: "Introduceți un număr de telefon valid." });
    render(<FiscalOnboardingCard initial={{ ...liveInitial, enabled: false }} />);

    fireEvent.change(screen.getByLabelText("Număr de telefon"), { target: { value: "123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sunați-mă" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Introduceți un număr de telefon valid."));
    expect(screen.queryByText(/Am primit cererea/)).toBeNull();
    expect(screen.getByRole("button", { name: "Sunați-mă" })).toBeTruthy();
  });
});
