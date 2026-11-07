// Odoo service packages and promises shown on /odoo and in /terms#odoo.
// Prices set 2026-11-07 on the owner's instruction ("you decide, charge fairly,
// lower"). EUR, final: SALUT TECH SRL is not VAT-registered.

export const ODOO_REPLY_HOURS = 5;
export const ODOO_HOURLY_EUR = 35;
export const ODOO_WARRANTY_DAYS = 30;

type PackageText = { name: string; summary: string; includes: string[] };
export type OdooPackage = { id: string; priceEur: number; from: boolean; monthly: boolean; en: PackageText; ro: PackageText };

export const ODOO_PACKAGES: readonly OdooPackage[] = [
  {
    id: "review",
    priceEur: 0,
    from: false,
    monthly: false,
    en: {
      name: "Integration review",
      summary: "We look at your Odoo version, hosting and the systems to connect.",
      includes: ["30-minute call", "Written scope and fixed price within 2 working days", "No obligation"],
    },
    ro: {
      name: "Analiza integrării",
      summary: "Verificăm versiunea Odoo, găzduirea și sistemele de conectat.",
      includes: ["Discuție de 30 de minute", "Ofertă scrisă, la preț fix, în 2 zile lucrătoare", "Fără obligații"],
    },
  },
  {
    id: "setup",
    priceEur: 290,
    from: false,
    monthly: false,
    en: {
      name: "Connector setup",
      summary: "One of our apps installed and configured on your Odoo.",
      includes: ["Installation and configuration", "Mapping of your products, taxes and warehouses", "Test sync together with you", `${ODOO_WARRANTY_DAYS} days of free fixes`],
    },
    ro: {
      name: "Configurarea unui conector",
      summary: "Una dintre aplicațiile noastre, instalată și configurată în Odoo-ul dumneavoastră.",
      includes: ["Instalare și configurare", "Potrivirea produselor, taxelor și depozitelor", "Sincronizare de test împreună cu dumneavoastră", `${ODOO_WARRANTY_DAYS} de zile de corecturi gratuite`],
    },
  },
  {
    id: "custom",
    priceEur: 950,
    from: true,
    monthly: false,
    en: {
      name: "Custom integration",
      summary: "A new connector or changes to an existing one.",
      includes: ["Fixed price agreed after the review", "Delivered as an Odoo module with tests", "Installation on your Odoo", `${ODOO_WARRANTY_DAYS} days of free fixes`],
    },
    ro: {
      name: "Integrare la comandă",
      summary: "Un conector nou sau modificări la unul existent.",
      includes: ["Preț fix stabilit după analiză", "Livrat ca modul Odoo, cu teste", "Instalare în Odoo-ul dumneavoastră", `${ODOO_WARRANTY_DAYS} de zile de corecturi gratuite`],
    },
  },
  {
    id: "support",
    priceEur: 59,
    from: false,
    monthly: true,
    en: {
      name: "Support and updates",
      summary: "For what we built or configured for you.",
      includes: ["Up to 2 hours of fixes or small changes a month", `Reply within ${ODOO_REPLY_HOURS} working hours`, "Updates of our apps for your Odoo version", "Cancel any month"],
    },
    ro: {
      name: "Suport și actualizări",
      summary: "Pentru ce am construit sau configurat pentru dumneavoastră.",
      includes: ["Până la 2 ore pe lună de corecturi sau modificări mici", `Răspuns în cel mult ${ODOO_REPLY_HOURS} ore lucrătoare`, "Actualizarea aplicațiilor noastre pentru versiunea dumneavoastră de Odoo", "Anulare în orice lună"],
    },
  },
];
