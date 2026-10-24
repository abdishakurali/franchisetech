// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AppI18nProvider } from "@/lib/app-i18n-context";
import { SearchableSelect } from "@/components/app/SearchableSelect";

describe("SearchableSelect controlled value", () => {
  afterEach(cleanup);

  it("reflects a new value supplied by its parent", () => {
    const options = [{ value: "each", label: "each" }, { value: "kg", label: "kg" }];
    const view = render(
      <AppI18nProvider initialLocale="ro">
        <SearchableSelect name="unit" options={options} value="each" />
      </AppI18nProvider>,
    );
    expect(screen.getAllByDisplayValue("each").some((input) => input.getAttribute("type") === "text")).toBe(true);

    view.rerender(
      <AppI18nProvider initialLocale="ro">
        <SearchableSelect name="unit" options={options} value="kg" />
      </AppI18nProvider>,
    );
    expect(screen.getAllByDisplayValue("kg").some((input) => input.getAttribute("type") === "text")).toBe(true);
  });
});
