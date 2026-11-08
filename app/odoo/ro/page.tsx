import type { Metadata } from "next";
import { ClaudeMarketingShellAuth } from "@/components/marketing/ClaudeMarketingShellAuth";
import { OdooServicesPage } from "@/components/marketing/OdooServicesPage";
import { ODOO_APP_COUNT } from "@/lib/marketing/odoo-apps";

export const metadata: Metadata = {
  title: "Integrare Odoo pentru companii din Europa | SALUT TECH SRL",
  description:
    `Integrare Odoo cu Shopify, WooCommerce, Power BI, OCR cu AI pentru facturi, case de marcat fiscale și drepturi de acces pe câmpuri. ${ODOO_APP_COUNT} de aplicații Odoo publicate, pentru Odoo 16–20, proiecte la preț fix.`,
  alternates: { canonical: "/odoo/ro", languages: { en: "/odoo", ro: "/odoo/ro" } },
};

export default function OdooRoPage() {
  return (
    <ClaudeMarketingShellAuth>
      <OdooServicesPage locale="ro" />
    </ClaudeMarketingShellAuth>
  );
}
