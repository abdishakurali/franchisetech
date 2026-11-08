// The Odoo apps SALUT TECH publishes on apps.odoo.com (author "Abdishakur Ali").
// The list is every module on the 19.0 release branch of the four app repositories
// (odoo-shopify-connector, odoo-shopify-pro, odoo-upgrade-gap, odoo-pos-fiscal-printer-ro).
// Names and EUR prices come from each module's __manifest__.py on that branch.
// `priceEur: null` means the manifest has no price: `free` apps download for free;
// `bundle` apps only install other apps and the store charges for those apps.
// Checked 2026-11-08: every app below answers HTTP 200 on its store page for
// Odoo 16.0, 17.0, 18.0, 19.0 and 20.0 (31 apps, 155 listings).
// `tests` counts the `def test_*` methods in each module's tests/ folder on the
// main branch of its repository on the same date. It is a count of written test
// cases, not a claim about a particular run.

export const ODOO_VERSIONS = ["16.0", "17.0", "18.0", "19.0", "20.0"] as const;
export const ODOO_STORE_VERSION = "19.0";
export const ODOO_FACTS_CHECKED = "2026-11-08";

export type OdooAppGroup =
  | "shopify"
  | "woocommerce"
  | "reporting"
  | "finance"
  | "inventory"
  | "labels"
  | "pos"
  | "hr"
  | "access"
  | "technical";

export type OdooAppPricing = "paid" | "free" | "bundle";

export type OdooApp = { tech: string; name: string; group: OdooAppGroup; priceEur: number | null; pricing: OdooAppPricing; tests: number };

export const ODOO_APPS: readonly OdooApp[] = [
  { tech: "shopify_connector_suite", name: "Complete Connector Suite for Shopify", group: "shopify", priceEur: null, pricing: "bundle", tests: 6 },
  { tech: "shopify_connector_core", name: "Shopify Connector: Products", group: "shopify", priceEur: 35, pricing: "paid", tests: 163 },
  { tech: "shopify_connector_order", name: "Order Connector for Shopify", group: "shopify", priceEur: 49, pricing: "paid", tests: 64 },
  { tech: "shopify_connector_customer", name: "Customer Connector for Shopify", group: "shopify", priceEur: 25, pricing: "paid", tests: 60 },
  { tech: "shopify_connector_stock", name: "Inventory Connector for Shopify", group: "shopify", priceEur: 25, pricing: "paid", tests: 52 },
  { tech: "shopify_connector_fulfillment", name: "Fulfilment Connector for Shopify", group: "shopify", priceEur: 25, pricing: "paid", tests: 21 },
  { tech: "shopify_connector_refund", name: "Refund Connector for Shopify", group: "shopify", priceEur: 15, pricing: "paid", tests: 11 },
  { tech: "shopify_connector_market", name: "Market Connector for Shopify", group: "shopify", priceEur: 19, pricing: "paid", tests: 10 },
  { tech: "shopify_connector_crm", name: "CRM Connector for Shopify", group: "shopify", priceEur: 19, pricing: "paid", tests: 14 },
  { tech: "shopify_profit_dashboard", name: "Shopify Profit Report", group: "shopify", priceEur: 29, pricing: "paid", tests: 9 },
  { tech: "woo_sync_pro", name: "WooCommerce Connector", group: "woocommerce", priceEur: 75, pricing: "paid", tests: 19 },
  { tech: "powerbi_data_feed", name: "Power BI Excel Data Feed", group: "reporting", priceEur: 79, pricing: "paid", tests: 26 },
  { tech: "vendor_bill_capture", name: "Vendor Bill OCR with AI", group: "finance", priceEur: 69, pricing: "paid", tests: 23 },
  { tech: "customer_statement_overdue_reminder", name: "Customer Statement & Payment Reminders", group: "finance", priceEur: 25, pricing: "paid", tests: 28 },
  { tech: "partner_warn_block_pro", name: "Overdue Credit Hold", group: "finance", priceEur: 29, pricing: "paid", tests: 14 },
  { tech: "partner_warn_block", name: "Block Customers and Products", group: "finance", priceEur: null, pricing: "free", tests: 14 },
  { tech: "sales_commission_community", name: "Sales Commission Rules", group: "finance", priceEur: 49, pricing: "paid", tests: 22 },
  { tech: "stock_aging_slow_moving", name: "Stock Aging & Slow Moving Stock", group: "inventory", priceEur: 29, pricing: "paid", tests: 21 },
  { tech: "stock_low_stock_digest", name: "Low Stock Alert Daily Digest", group: "inventory", priceEur: 19, pricing: "paid", tests: 23 },
  { tech: "stock_material_request", name: "Material Request Approval", group: "inventory", priceEur: 15, pricing: "paid", tests: 22 },
  { tech: "retail_pack_labels_stock", name: "Retail Pack: Price Labels & Stock", group: "inventory", priceEur: null, pricing: "bundle", tests: 1 },
  { tech: "shelf_price_label", name: "Price Labels & Shelf Labels", group: "labels", priceEur: 35, pricing: "paid", tests: 20 },
  { tech: "zpl_printer_network_label", name: "ZPL Printer: Zebra Labels", group: "labels", priceEur: 49, pricing: "paid", tests: 21 },
  { tech: "pos_fiscal_printer_ro", name: "Romanian Fiscal Printer for POS", group: "pos", priceEur: 149, pricing: "paid", tests: 80 },
  { tech: "pos_network_printer_escpos", name: "POS Network Printer ESC/POS", group: "pos", priceEur: 69, pricing: "paid", tests: 37 },
  { tech: "zkteco_adms_push_attendance", name: "ZKTeco ADMS Push Attendance", group: "hr", priceEur: 45, pricing: "paid", tests: 27 },
  { tech: "access_rules_pro", name: "Field Access Rights", group: "access", priceEur: 69, pricing: "paid", tests: 35 },
  { tech: "hide_cost_price_margin", name: "Hide Cost Price and Margin", group: "access", priceEur: null, pricing: "free", tests: 19 },
  { tech: "website_ip_block_country", name: "IP Block & Country Block", group: "access", priceEur: 39, pricing: "paid", tests: 29 },
  { tech: "attachment_s3_object_storage", name: "S3 Attachment Object Storage", group: "technical", priceEur: 89, pricing: "paid", tests: 43 },
  { tech: "remote_mcp_oauth_server", name: "MCP OAuth Server for Claude", group: "technical", priceEur: 79, pricing: "paid", tests: 44 },
];

export const ODOO_APP_COUNT = ODOO_APPS.length;
export const ODOO_LISTING_COUNT = ODOO_APPS.length * ODOO_VERSIONS.length;

export const ODOO_TOTAL_TESTS = ODOO_APPS.reduce((sum, app) => sum + app.tests, 0);

export function odooStoreUrl(tech: string, version: string = ODOO_STORE_VERSION) {
  return `https://apps.odoo.com/apps/modules/${version}/${tech}`;
}
