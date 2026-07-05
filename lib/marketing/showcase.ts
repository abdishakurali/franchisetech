/**
 * Canonical showcase assets — each image must match `path` (what the URL bar shows).
 * When adding screenshots, verify the screen before assigning a slot.
 */
export const showcaseAssets = {
  /** POS with products in cart and Charge button */
  posCart: {
    src: "/showcase/pos-cart.png",
    path: "/app/pos",
  },
  /** Owner dashboard — Today at a glance */
  ownerDashboard: {
    src: "/showcase/reports-dashboard.png",
    path: "/app",
  },
  /** Kitchen display — New / Preparing / Ready / Done */
  kitchenDisplay: {
    src: "/showcase/kitchen-display.png",
    path: "/app/kitchen",
  },
  /** Stock levels table with low-stock alerts */
  stockLevels: {
    src: "/showcase/stock-levels.png",
    path: "/app/stock",
  },
  /** Supplier list and spend */
  suppliers: {
    src: "/showcase/suppliers.png",
    path: "/app/suppliers",
  },
  /** Products & ingredients with unit costs (margin building block) */
  recipeCosting: {
    src: "/showcase/recipe-costing.png",
    path: "/app/products",
  },
  /** Daily Z-report / till close */
  zReport: {
    src: "/showcase/settings-features.png",
    path: "/app/reports/z-report",
  },
  /** In-app setup checklist */
  setupGuide: {
    src: "/showcase/setup-guide.png",
    path: "/app/setup-checklist",
  },
  /** POS product grid before items are added */
  posGrid: {
    src: "/showcase/pos-grid.png",
    path: "/app/pos",
  },
  /** Table floor picker — Sală / Terasă / Bar */
  tableFloor: {
    src: "/showcase/table-floor.png",
    path: "/app/pos",
  },
  /** Table tab checkout — Trimite comanda rounds, Încasează total */
  posTableOrder: {
    src: "/showcase/pos-table-order.png",
    path: "/app/pos",
  },
} as const;

export type ShowcaseKey = keyof typeof showcaseAssets;
