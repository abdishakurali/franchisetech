// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { OrgVatRate } from "@/lib/vat-rates";

const addProductFromPos = vi.fn();
const addCategoryInline = vi.fn();
const advanceFromMenu = vi.fn();

vi.mock("@/app/actions/kitchenops", () => ({ addProductFromPos, addCategoryInline }));
vi.mock("@/app/actions/onboarding-steps", () => ({ advanceFromMenu }));
vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const { MenuBuilder } = await import("@/components/onboarding/MenuBuilder");
const { toast } = await import("sonner");

const roRates: OrgVatRate[] = [
  { id: "r21", name: "TVA Standard 21%", rate: 21, is_default: true, active: true, sort_order: 1 },
  { id: "r11", name: "TVA Redus 11%", rate: 11, is_default: false, active: true, sort_order: 2 },
  { id: "r0", name: "Scutit 0%", rate: 0, is_default: false, active: true, sort_order: 3 },
];

const categories = [
  { id: "cat-coffee", name: "Cafea" },
  { id: "cat-drinks", name: "Răcoritoare" },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderBuilder(overrides: Partial<Parameters<typeof MenuBuilder>[0]> = {}) {
  return render(
    <MenuBuilder
      locale="ro"
      vatRates={roRates}
      initialCategories={categories}
      initialProducts={[]}
      {...overrides}
    />,
  );
}

function fillRow(index: number, name: string, price: string) {
  fireEvent.change(screen.getAllByPlaceholderText("ex: Cappuccino")[index], { target: { value: name } });
  fireEvent.change(screen.getAllByPlaceholderText("14")[index], { target: { value: price } });
}

function categoryRadios(categoryId: string) {
  return Array.from(document.querySelectorAll<HTMLInputElement>(`input[type=radio][name="vat-${categoryId}"]`));
}

function sentProducts() {
  return addProductFromPos.mock.calls.map(([fd]) => {
    const data = fd as FormData;
    return {
      name: data.get("name"),
      category: data.get("pos_category_id"),
      vat_rate: data.get("vat_rate"),
    };
  });
}

describe("MenuBuilder VAT choice", () => {
  it("preselects no VAT rate for any category", () => {
    renderBuilder();
    for (const category of categories) {
      const radios = categoryRadios(category.id);
      expect(radios).toHaveLength(3);
      expect(radios.some((radio) => radio.checked)).toBe(false);
    }
    expect(screen.getAllByText(/Cota TVA apare pe bonul fiscal\. Dacă nu sunteți sigur, întrebați contabilul\./)).toHaveLength(2);
  });

  it("blocks continue when a category with products has no VAT rate chosen, and saves nothing", async () => {
    renderBuilder();
    fillRow(0, "Espresso", "9");

    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));

    expect((await screen.findByRole("alert")).textContent).toBe("Alegeți cota TVA pentru această categorie.");
    expect(toast.error).toHaveBeenCalledWith("Alegeți cota TVA pentru categoria „Cafea” înainte de a continua.");
    expect(addProductFromPos).not.toHaveBeenCalled();
    expect(advanceFromMenu).not.toHaveBeenCalled();
  });

  it("does not fall back to the org default when one of several categories is unchosen", async () => {
    renderBuilder();
    fillRow(0, "Espresso", "9");
    fillRow(1, "Cola", "8");
    fireEvent.click(categoryRadios("cat-coffee").find((radio) => radio.value === "11")!);

    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));

    expect((await screen.findByRole("alert")).textContent).toBe("Alegeți cota TVA pentru această categorie.");
    expect(toast.error).toHaveBeenCalledWith("Alegeți cota TVA pentru categoria „Răcoritoare” înainte de a continua.");
    expect(addProductFromPos).not.toHaveBeenCalled();
  });

  it("sends the chosen rate as vat_rate for every product in that category", async () => {
    addProductFromPos.mockResolvedValue({ ok: true });
    advanceFromMenu.mockResolvedValue(undefined);
    renderBuilder();

    fireEvent.click(screen.getAllByRole("button", { name: /Produs/ })[0]);
    fillRow(0, "Espresso", "9");
    fillRow(1, "Cappuccino", "14");
    fillRow(2, "Cola", "8");
    fireEvent.click(categoryRadios("cat-coffee").find((radio) => radio.value === "11")!);
    fireEvent.click(categoryRadios("cat-drinks").find((radio) => radio.value === "21")!);

    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));

    await waitFor(() => expect(advanceFromMenu).toHaveBeenCalledTimes(1));
    expect(sentProducts()).toEqual([
      { name: "Espresso", category: "cat-coffee", vat_rate: "11" },
      { name: "Cappuccino", category: "cat-coffee", vat_rate: "11" },
      { name: "Cola", category: "cat-drinks", vat_rate: "21" },
    ]);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("leaves existing products alone and does not require a choice for categories without new rows", async () => {
    advanceFromMenu.mockResolvedValue(undefined);
    renderBuilder({
      initialProducts: [{ id: "p-1", name: "Latte", sale_price: 15, category_id: "cat-coffee" }],
    });

    expect(screen.getByText("Latte")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));

    await waitFor(() => expect(advanceFromMenu).toHaveBeenCalledTimes(1));
    expect(addProductFromPos).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows only the offered rates and the VAT-payer note for a business limited to 0%", async () => {
    addProductFromPos.mockResolvedValue({ ok: true });
    advanceFromMenu.mockResolvedValue(undefined);
    renderBuilder({ vatRates: [roRates[2]], vatRestrictedToZero: true, initialCategories: [categories[0]] });

    const radios = categoryRadios("cat-coffee");
    expect(radios.map((radio) => radio.value)).toEqual(["0"]);
    expect(radios[0].checked).toBe(false);
    expect(screen.getByText(/neplătitoare de TVA/)).toBeTruthy();

    fillRow(0, "Espresso", "9");
    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));
    expect(addProductFromPos).not.toHaveBeenCalled();

    fireEvent.click(radios[0]);
    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));
    await waitFor(() => expect(advanceFromMenu).toHaveBeenCalledTimes(1));
    expect(sentProducts()).toEqual([{ name: "Espresso", category: "cat-coffee", vat_rate: "0" }]);
  });

  it("blocks continue when the org has no active VAT rates", async () => {
    renderBuilder({ vatRates: [], initialCategories: [categories[0]] });
    fillRow(0, "Espresso", "9");

    fireEvent.click(screen.getByRole("button", { name: /Adăugați produsele și continuați/ }));

    expect(toast.error).toHaveBeenCalledWith("Nu există cote TVA active. Adăugați-le în Setări înainte de a adăuga produse.");
    expect(addProductFromPos).not.toHaveBeenCalled();
  });
});
