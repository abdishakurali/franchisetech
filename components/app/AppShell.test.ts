import { describe, expect, it } from "vitest";
import { buildMainNav, resolveNavItems } from "@/components/app/AppShell";
import type { AppT } from "@/lib/app-i18n";

const t = {
  nav: {
    dashboard: "Dashboard",
    setupGuide: "Setup guide",
    pos: "POS",
    products: "Products",
    reports: "Reports",
    recipes: "Recipes",
    kitchen: "Kitchen",
    customers: "Customers",
    stock: "Stock",
    stockLevels: "Stock",
    purchases: "Purchases",
    suppliers: "Suppliers",
  },
} as unknown as AppT;

function hrefs(items: { href: string }[]) {
  return items.map((i) => i.href);
}

function moduleVisibility(overrides: Partial<{
  inventory: boolean;
  purchases: boolean;
  recipeCosting: boolean;
  teamAdvanced: boolean;
  multiSite: boolean;
  kitchenOps: boolean;
}> = {}) {
  return {
    inventory: false,
    purchases: false,
    recipeCosting: false,
    teamAdvanced: false,
    multiSite: false,
    kitchenOps: false,
    ...overrides,
  };
}

describe("buildMainNav", () => {
  it("returns the full, unrestricted nav regardless of role — role restriction is resolveNavItems' job", () => {
    expect(hrefs(buildMainNav(t))).toEqual([
      "/app",
      "/app/pos",
      "/app/products",
      "/app/recipes",
      "/app/stock",
      "/app/purchases",
      "/app/reports",
    ]);
  });
});

describe("resolveNavItems", () => {
  it("restricts a cashier to dashboard + POS regardless of module visibility", () => {
    const { mainNav, showStock, limited } = resolveNavItems(
      "cashier",
      t,
      true,
      moduleVisibility({ recipeCosting: true, inventory: true }),
      { id: "org1", name: "Org" },
    );
    expect(hrefs(mainNav)).toEqual(["/app", "/app/pos"]);
    expect(showStock).toBe(false);
    expect(limited).toBe(true);
  });

  it("gives an accountant only the enabled operations destinations", () => {
    const withoutPurchases = resolveNavItems("accountant", t, true, moduleVisibility(), { id: "org1", name: "Org", country_code: "RO", efactura_enabled: false });
    expect(hrefs(withoutPurchases.mainNav)).toEqual(["/app", "/app/reports"]);

    const withoutEfactura = resolveNavItems("accountant", t, true, moduleVisibility({ purchases: true }), { id: "org1", name: "Org", country_code: "RO", efactura_enabled: false });
    expect(hrefs(withoutEfactura.mainNav)).toEqual(["/app", "/app/reports", "/app/purchases", "/app/suppliers"]);

    const withEfactura = resolveNavItems("accountant", t, true, moduleVisibility({ purchases: true }), { id: "org1", name: "Org", country_code: "RO", efactura_enabled: true });
    expect(hrefs(withEfactura.mainNav)).toEqual(["/app", "/app/reports", "/app/purchases", "/app/suppliers", "/app/invoices"]);
  });

  it("shows only the seven design destinations while preserving recipe and stock entitlements", () => {
    const { mainNav, stockNav, showStock } = resolveNavItems(
      "owner",
      t,
      true,
      moduleVisibility({ recipeCosting: false, inventory: true }),
      { id: "org1", name: "Org" },
    );
    expect(hrefs(mainNav)).toEqual(["/app", "/app/pos", "/app/products", "/app/stock", "/app/reports"]);
    expect(showStock).toBe(false);
    expect(hrefs(stockNav)).toEqual([]);
  });

  it("keeps all destinations for an entitled owner, with no extra module links", () => {
    const { mainNav } = resolveNavItems(
      "owner",
      t,
      false,
      moduleVisibility({ recipeCosting: true, inventory: true, purchases: true }),
      { id: "org1", name: "Org", country_code: "RO", efactura_enabled: true, kitchen_display_enabled: true, loyalty_enabled: true },
    );
    expect(hrefs(mainNav)).toEqual(["/app", "/app/pos", "/app/products", "/app/recipes", "/app/stock", "/app/purchases", "/app/reports"]);
  });

  it("shows purchases in the owner nav only when the purchases module is visible", () => {
    const withoutPurchases = resolveNavItems("owner", t, true, moduleVisibility({ inventory: true }), { id: "org1", name: "Org" });
    expect(hrefs(withoutPurchases.mainNav)).not.toContain("/app/purchases");

    const withPurchases = resolveNavItems("owner", t, true, moduleVisibility({ purchases: true }), { id: "org1", name: "Org" });
    expect(hrefs(withPurchases.mainNav)).toContain("/app/purchases");
  });
});
