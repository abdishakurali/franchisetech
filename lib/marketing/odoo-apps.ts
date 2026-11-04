// The Odoo apps SALUT TECH publishes on apps.odoo.com (author "Abdishakur Ali").
// Checked 2026-11-04: every app below answers HTTP 200 on its store page for
// Odoo 16.0, 17.0, 18.0, 19.0 and 20.0 (22 apps, 110 listings).
// `tests` counts the `def test_*` methods in each module's tests/ folder on the
// main branch of its repository on the same date. It is a count of written test
// cases, not a claim about a particular run.

export const ODOO_VERSIONS = ["16.0", "17.0", "18.0", "19.0", "20.0"] as const;
export const ODOO_STORE_VERSION = "19.0";
export const ODOO_FACTS_CHECKED = "2026-11-04";

export type OdooAppGroup = "shopify" | "woocommerce" | "reporting" | "finance" | "inventory" | "pos" | "access";

export type OdooApp = { tech: string; name: string; group: OdooAppGroup; tests: number };

export const ODOO_APPS: readonly OdooApp[] = [
  { tech: "shopify_connector_suite", name: "Complete Connector Suite for Shopify", group: "shopify", tests: 6 },
  { tech: "shopify_connector_core", name: "Shopify Connector: Products", group: "shopify", tests: 163 },
  { tech: "shopify_connector_order", name: "Order Connector for Shopify", group: "shopify", tests: 64 },
  { tech: "shopify_connector_customer", name: "Customer Connector for Shopify", group: "shopify", tests: 60 },
  { tech: "shopify_connector_stock", name: "Inventory Connector for Shopify", group: "shopify", tests: 52 },
  { tech: "shopify_connector_fulfillment", name: "Fulfilment Connector for Shopify", group: "shopify", tests: 21 },
  { tech: "shopify_connector_refund", name: "Refund Connector for Shopify", group: "shopify", tests: 11 },
  { tech: "shopify_connector_market", name: "Market Connector for Shopify", group: "shopify", tests: 10 },
  { tech: "shopify_connector_crm", name: "CRM Connector for Shopify", group: "shopify", tests: 14 },
  { tech: "shopify_profit_dashboard", name: "Shopify Profit Report", group: "shopify", tests: 9 },
  { tech: "woo_sync_pro", name: "WooCommerce Connector", group: "woocommerce", tests: 19 },
  { tech: "powerbi_data_feed", name: "Power BI Excel Data Feed", group: "reporting", tests: 26 },
  { tech: "vendor_bill_capture", name: "Vendor Bill OCR with AI", group: "finance", tests: 23 },
  { tech: "customer_statement_overdue_reminder", name: "Customer Statement & Payment Reminders", group: "finance", tests: 28 },
  { tech: "partner_warn_block_pro", name: "Overdue Credit Hold", group: "finance", tests: 14 },
  { tech: "partner_warn_block", name: "Block Customers and Products", group: "finance", tests: 14 },
  { tech: "sales_commission_community", name: "Sales Commission Rules", group: "finance", tests: 22 },
  { tech: "stock_aging_slow_moving", name: "Stock Aging & Slow Moving Stock", group: "inventory", tests: 21 },
  { tech: "stock_low_stock_digest", name: "Low Stock Alert Daily Digest", group: "inventory", tests: 23 },
  { tech: "stock_material_request", name: "Material Request Approval", group: "inventory", tests: 22 },
  { tech: "pos_fiscal_printer_ro", name: "Romanian Fiscal Printer for POS", group: "pos", tests: 80 },
  { tech: "access_rules_pro", name: "Field Access Rights", group: "access", tests: 35 },
];

export const ODOO_TOTAL_TESTS = ODOO_APPS.reduce((sum, app) => sum + app.tests, 0);

export function odooStoreUrl(tech: string, version: string = ODOO_STORE_VERSION) {
  return `https://apps.odoo.com/apps/modules/${version}/${tech}`;
}
