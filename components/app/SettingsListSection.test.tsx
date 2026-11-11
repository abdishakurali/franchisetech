// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { SettingsListSection } from "@/components/app/SettingsListSection";

afterEach(cleanup);

const rows = [{ id: "pm1", primary: "Card", editValues: { name: "Card" } }];
const fields = [{ key: "name", label: "Nume", type: "text" as const }];

function renderWith(actions: {
  add?: () => Promise<unknown>;
  update?: () => Promise<unknown>;
  del?: () => Promise<unknown>;
}) {
  const ok = () => Promise.resolve({ ok: true as const });
  return render(
    <SettingsListSection
      title="Metode de plată"
      rows={rows}
      canEdit
      addFields={fields}
      editFields={fields}
      addDefaults={{ name: "" }}
      addAction={(actions.add ?? ok) as never}
      updateAction={(actions.update ?? ok) as never}
      deleteAction={(actions.del ?? ok) as never}
      addLabel="+ Adăugați metodă de plată"
      emptyLabel="Nicio metodă."
      locale="ro"
    />,
  );
}

describe("SettingsListSection save results", () => {
  it("a refused delete of a used item says so instead of doing nothing", async () => {
    const del = vi.fn().mockResolvedValue({ ok: false, error: "in_use" });
    const { getByText, findByRole } = renderWith({ del });
    fireEvent.click(getByText("✕"));
    fireEvent.click(getByText("Da"));
    expect((await findByRole("alert")).textContent).toContain("nu poate fi șters");
    expect(getByText("Card")).toBeTruthy();
  });

  it("a failed add keeps the form open with the typed name", async () => {
    const add = vi.fn().mockResolvedValue({ ok: false, error: "failed" });
    const { getByText, getByRole, findByRole, container } = renderWith({ add });
    fireEvent.click(getByText("+ Adăugați metodă de plată"));
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Tichete" } });
    fireEvent.click(getByRole("button", { name: "Adăugați" }));
    expect((await findByRole("alert")).textContent).toContain("Modificarea nu s-a salvat");
    expect((container.querySelector("input") as HTMLInputElement).value).toBe("Tichete");
  });

  it("a duplicate unit name says so instead of silently doing nothing", async () => {
    const add = vi.fn().mockResolvedValue({ ok: false, error: "duplicate" });
    const { getByText, getByRole, findByRole } = renderWith({ add });
    fireEvent.click(getByText("+ Adăugați metodă de plată"));
    fireEvent.click(getByRole("button", { name: "Adăugați" }));
    expect((await findByRole("alert")).textContent).toContain("Există deja un element cu acest nume");
  });

  it("a failed edit keeps the edit row open", async () => {
    const update = vi.fn().mockResolvedValue({ ok: false, error: "failed" });
    const { getByText, getByRole, findByRole } = renderWith({ update });
    fireEvent.click(getByText("Editați"));
    fireEvent.click(getByRole("button", { name: "Salvați" }));
    await findByRole("alert");
    expect(getByRole("button", { name: "Salvați" })).toBeTruthy();
  });

  it("a void (older) action counts as success and closes the form", async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    const { getByText, getByRole, queryByRole } = renderWith({ add });
    fireEvent.click(getByText("+ Adăugați metodă de plată"));
    fireEvent.click(getByRole("button", { name: "Adăugați" }));
    await waitFor(() => expect(getByText("+ Adăugați metodă de plată")).toBeTruthy());
    expect(queryByRole("alert")).toBeNull();
  });
});
