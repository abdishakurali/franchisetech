// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

const probeFiscalNet = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/actions/fiscalnet", () => ({ saveFiscalNetSettings: vi.fn(), testFiscalNetConnection: vi.fn() }));
vi.mock("@/lib/fiscalnet/probe", () => ({ probeFiscalNet }));

const { FiscalNetSettingsCard } = await import("@/components/app/FiscalNetSettingsCard");
const actions = await import("@/app/actions/fiscalnet");

const props = {
  orgId: "org-1", enabled: true, mockMode: false, connectionMode: "api" as const, apiHost: "http://localhost:65400",
  bonuriPath: null, raspunsPath: null, autoPrint: true, askBeforePrint: false, manualOnly: false,
  timeoutMs: 15000, retryCount: 2, cif: null, operatorCode: "1", vatGroups: null, paymentTypeMap: null,
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("FiscalNetSettingsCard connection check", () => {
  it("checks FiscalNet from this browser at the configured address, never via the server", async () => {
    probeFiscalNet.mockResolvedValue({ reachable: true, message: "FiscalNet răspunde pe acest calculator." });
    render(<FiscalNetSettingsCard {...props} apiHost="http://192.168.1.50:65400" />);

    fireEvent.click(screen.getByRole("button", { name: "Verifică FiscalNet" }));

    await screen.findByText(/FiscalNet răspunde pe acest calculator/);
    expect(probeFiscalNet).toHaveBeenCalledWith("http://192.168.1.50:65400");
    expect(actions.testFiscalNetConnection).not.toHaveBeenCalled();
    expect(screen.queryByText(/✅/)).toBeNull();
  });

  it("shows a warning, not a success, when FiscalNet does not answer", async () => {
    probeFiscalNet.mockResolvedValue({ reachable: false, message: "FiscalNet nu răspunde pe acest calculator." });
    render(<FiscalNetSettingsCard {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Verifică FiscalNet" }));

    expect(await screen.findByText(/⚠ FiscalNet nu răspunde/)).toBeTruthy();
  });

  it("in test mode contacts no device and says so", async () => {
    render(<FiscalNetSettingsCard {...props} mockMode />);

    fireEvent.click(screen.getByRole("button", { name: "Verifică FiscalNet" }));

    await screen.findByText(/Mod test: nu se contactează nicio casă de marcat/);
    expect(probeFiscalNet).not.toHaveBeenCalled();
  });
});
