import type { Metadata } from "next";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { OdooServicesPage } from "@/components/marketing/OdooServicesPage";
import { ODOO_APP_COUNT } from "@/lib/marketing/odoo-apps";

export const metadata: Metadata = {
  title: "Odoo integration for European companies | SALUT TECH SRL",
  description:
    `Odoo integration with Shopify, WooCommerce, Power BI, AI bill OCR, POS fiscal printers and field access rights. ${ODOO_APP_COUNT} published Odoo apps for Odoo 16 to 20, fixed-price projects.`,
  alternates: { canonical: "/odoo", languages: { en: "/odoo", ro: "/odoo/ro" } },
};

export default function OdooPage() {
  return (
    <ClaudeMarketingShellAuth>
      <OdooServicesPage locale="en" />
    </ClaudeMarketingShellAuth>
  );
}
