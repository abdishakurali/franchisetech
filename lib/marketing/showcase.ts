/**
 * Canonical showcase assets — each image must match `path` (what the URL bar shows).
 * When adding screenshots, verify the screen before assigning a slot.
 */
export const showcaseAssets = {
  /** POS with products in cart and Charge button */
  posCart: {
    src: "/marketing/live/pos.png",
    path: "/app/pos",
  },
  /** Owner dashboard — Today at a glance */
  ownerDashboard: {
    src: "/marketing/live/dashboard.png",
    path: "/app",
  },
  /** Kitchen display — New / Preparing / Ready / Done */
  kitchenDisplay: {
    src: "/marketing/live/pos.png",
    path: "/app/kitchen",
  },
  /** Stock levels table with low-stock alerts */
  stockLevels: {
    src: "/marketing/live/stock.png",
    path: "/app/stock",
  },
  /** Supplier list and spend */
  suppliers: {
    src: "/marketing/live/stock.png",
    path: "/app/suppliers",
  },
  /** Products & ingredients with unit costs (margin building block) */
  recipeCosting: {
    src: "/marketing/live/recipes.png",
    path: "/app/products",
  },
  /** Daily Z-report / till close */
  zReport: {
    src: "/marketing/live/reports.png",
    path: "/app/reports/z-report",
  },
  /** In-app setup checklist */
  setupGuide: {
    src: "/marketing/live/dashboard.png",
    path: "/app/setup-checklist",
  },
  /** POS product grid before items are added */
  posGrid: {
    src: "/marketing/live/pos.png",
    path: "/app/pos",
  },
  /** Table floor picker — Sală / Terasă / Bar */
  tableFloor: {
    src: "/marketing/live/pos.png",
    path: "/app/pos",
  },
  /** Table tab checkout — Trimite comanda rounds, Încasează total */
  posTableOrder: {
    src: "/marketing/live/pos.png",
    path: "/app/pos",
  },
} as const;

export type ShowcaseKey = keyof typeof showcaseAssets;
