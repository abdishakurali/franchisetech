// Demo videos for the /odoo/demos page. Files live in public/odoo/demos/<tech>/.
// Recorded 2026-11-08 on a throwaway Odoo 19 Community database with demo data.
// The honesty notes come from each video's SCRIPT.md (what is real, what is not shown).
// Names and EUR prices checked on apps.odoo.com (Odoo 19 listing) on 2026-11-08.

export const ODOO_DEMOS_CHECKED = "2026-11-08";

export type OdooDemo = {
  tech: string;
  name: string;
  priceEur: number;
  seconds: number;
  summary: string;
  note: string;
};

export const ODOO_DEMOS: readonly OdooDemo[] = [
  {
    tech: "shelf_price_label",
    name: "Price Labels & Shelf Labels",
    priceEur: 35,
    seconds: 52,
    summary:
      "Print shelf labels with the tax-included price, the offer price, the unit price per kg or litre and an EAN-13 barcode, from one product or a whole receipt.",
    note: "The labels are the PDF files Odoo returned, shown on screen; no physical printer or label stock was used. The demo company's currency is USD, so the labels show $.",
  },
  {
    tech: "zpl_printer_network_label",
    name: "ZPL Printer: Zebra Labels",
    priceEur: 49,
    seconds: 71,
    summary:
      "Send product and lot labels straight from Odoo to a Zebra printer on the network, with editable ZPL templates and a log of every job.",
    note: "The printer is a virtual Zebra on the network (raw port 9100) that saves every job. The labels at the end are rendered from the exact ZPL it received. No physical Zebra printer was used.",
  },
  {
    tech: "pos_network_printer_escpos",
    name: "POS Network Printer ESC/POS",
    priceEur: 69,
    seconds: 60,
    summary:
      "Print Odoo Point of Sale receipts and kitchen tickets directly to ESC/POS network printers and open the cash drawer, with a print log.",
    note: "The printers are virtual ESC/POS printers on port 9100. The receipt and kitchen ticket at the end are rebuilt from the raw bytes they received. Paper cut and cash drawer on real hardware were not filmed, and only the retail POS was recorded, not the restaurant flow.",
  },
  {
    tech: "attachment_s3_object_storage",
    name: "S3 Attachment Object Storage",
    priceEur: 89,
    seconds: 56,
    summary:
      "Move Odoo attachments to S3-compatible object storage, with a connection test, a dry-run migration and size-checked uploads.",
    note: "The bucket is a local MinIO server (path-style, plain HTTP). AWS S3, Cloudflare R2, Wasabi, Backblaze B2 and DigitalOcean Spaces were not filmed.",
  },
  {
    tech: "remote_mcp_oauth_server",
    name: "MCP OAuth Server for Claude",
    priceEur: 79,
    seconds: 61,
    summary:
      "Let AI clients connect to Odoo over MCP with an OAuth login, the user's own access rights, a list of allowed models and an audit log.",
    note: "The client is the official MCP Inspector command-line tool; its real output is shown on a rendered terminal page. Claude.ai, ChatGPT and Cursor themselves are not shown (they need a public HTTPS address), and only read-only tools are used.",
  },
  {
    tech: "powerbi_data_feed",
    name: "Power BI Excel Data Feed",
    priceEur: 79,
    seconds: 74,
    summary:
      "Publish Odoo data as a CSV or JSON address that Power BI or Excel can refresh, with chosen columns, filters and a call counter.",
    note: "The feed is opened in a browser and the CSV in LibreOffice Calc. Power BI Desktop, the Power BI service and Excel's \"From Web\" were not run in the video.",
  },
  {
    tech: "access_rules_pro",
    name: "Field Access Rights",
    priceEur: 69,
    seconds: 75,
    summary:
      "Hide fields or make them read-only for chosen user groups, with optional conditions and a change log, without writing code.",
    note: "Before recording, the demo sales user was given Odoo's standard \"Products / Create\" right, so the refusal comes only from the rule. Read-only is enforced by the server on save; the field is not greyed out. Report, export and import rules are not shown.",
  },
  {
    tech: "partner_warn_block_pro",
    name: "Overdue Credit Hold",
    priceEur: 29,
    seconds: 50,
    summary:
      "Stop new sales orders for customers whose invoices are overdue beyond a limit, and log who overrode the block and why.",
    note: "The overdue invoice and the quotation were created before recording; the credit rule is switched on in the video. The Blocked contacts list shows manual blocks only, and a user without the override right is not shown.",
  },
];
