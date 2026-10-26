// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }));
vi.mock("@/lib/analytics/client-events", () => ({ captureClientEvent: vi.fn() }));
vi.mock("@/components/app/PricingCheckoutButton", () => ({
  PricingCheckoutButton: ({ plan, interval }: { plan: string; interval: string }) => (
    <button>{`checkout-${plan}-${interval}`}</button>
  ),
}));

const { PricingPlansSection } = await import("@/components/billing/PricingPlansSection");

describe("paid billing plan selection", () => {
  afterEach(() => cleanup());

  it("shows only paid plans and lets the customer choose monthly or annual checkout", () => {
    render(<PricingPlansSection variant="billing" loggedIn configured locale="ro" />);

    expect(screen.queryByText("€0")).toBeNull();
    expect(screen.queryByText("FREE")).toBeNull();
    expect(screen.getByText("checkout-growth-month")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /anual/i }));
    expect(screen.getByText("checkout-growth-year")).toBeTruthy();
    expect(screen.getByText("€39")).toBeTruthy();
  });
});
