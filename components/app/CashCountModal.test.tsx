// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CashDenomStepper } from "@/components/app/CashDenomStepper";
import { CashCountModal } from "@/components/app/CashCountModal";
import { posText } from "@/lib/pos-i18n";

afterEach(cleanup);

const ro = posText.ro;

describe("CashDenomStepper", () => {
  it("adds one note per click and clamps at zero", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CashDenomStepper
        label="50 lei"
        value={0}
        onChange={onChange}
        increaseLabel={ro.increaseDenom("50 lei")}
        decreaseLabel={ro.decreaseDenom("50 lei")}
      />
    );

    fireEvent.click(screen.getByLabelText("Crește numărul de 50 lei"));
    expect(onChange).toHaveBeenCalledWith(1);

    // [-] is disabled at zero, so a click there cannot push the count negative.
    expect((screen.getByLabelText("Scade numărul de 50 lei") as HTMLButtonElement).disabled).toBe(true);

    onChange.mockClear();
    rerender(
      <CashDenomStepper
        label="50 lei"
        value={3}
        onChange={onChange}
        increaseLabel={ro.increaseDenom("50 lei")}
        decreaseLabel={ro.decreaseDenom("50 lei")}
      />
    );
    fireEvent.click(screen.getByLabelText("Scade numărul de 50 lei"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("selects the current count on focus, so typing replaces it instead of appending", () => {
    const onChange = vi.fn();
    render(<CashDenomStepper label="50 lei" value={4} onChange={onChange} />);
    const field = screen.getByLabelText("50 lei") as HTMLInputElement;
    const select = vi.spyOn(field, "select");

    fireEvent.focus(field);
    expect(select).toHaveBeenCalled();

    fireEvent.change(field, { target: { value: "12" } });
    expect(onChange).toHaveBeenCalledWith(12);
  });

  it("keeps both +/- targets at the 44px touch minimum and hides the native spinners", () => {
    render(<CashDenomStepper label="50 lei" value={2} onChange={() => {}} />);
    for (const name of ["Increase 50 lei", "Decrease 50 lei"]) {
      const cls = screen.getByLabelText(name).className;
      expect(cls).toContain("h-11");
      expect(cls).toContain("w-11");
    }
    const field = screen.getByLabelText("50 lei");
    expect(field.className).toContain("[&::-webkit-inner-spin-button]:appearance-none");
  });

  it("falls back to English accessible names when none are passed", () => {
    render(<CashDenomStepper label="10 bani" value={0} onChange={() => {}} />);
    expect(screen.getByLabelText("Increase 10 bani")).toBeTruthy();
  });
});

describe("CashCountModal", () => {
  const labels = {
    title: ro.cashBreakdownLabel,
    total: ro.cashBreakdownTotal,
    confirm: ro.confirm,
    cancel: ro.cancel,
    increaseDenom: ro.increaseDenom,
    decreaseDenom: ro.decreaseDenom,
  };

  it("totals the counted denominations and hands back the breakdown", () => {
    const onConfirm = vi.fn();
    render(
      <CashCountModal
        open
        onOpenChange={() => {}}
        initialBreakdown={{ 50: 2, 1: 3 }}
        onConfirm={onConfirm}
        labels={labels}
      />
    );

    // 2 x 50 lei + 3 x 1 leu = 103.00 lei
    expect(screen.getByText("103.00 lei")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Crește numărul de 50 lei"));
    expect(screen.getByText("153.00 lei")).toBeTruthy();

    fireEvent.click(screen.getByText(ro.confirm));
    expect(onConfirm).toHaveBeenCalledWith(153, { 50: 3, 1: 3 });
  });

  it("labels every RON denomination row in Romanian, coins included", () => {
    render(
      <CashCountModal open onOpenChange={() => {}} onConfirm={() => {}} labels={labels} />
    );
    expect(screen.getByLabelText("Crește numărul de 200 lei")).toBeTruthy();
    expect(screen.getByLabelText("Crește numărul de 50 bani")).toBeTruthy();
    expect(screen.getByLabelText("Scade numărul de 10 bani")).toBeTruthy();
  });
});
