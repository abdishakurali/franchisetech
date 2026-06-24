import type { AppLocale } from "@/lib/app-i18n";
import {
  CAPABILITY_CATEGORIES,
  type CapabilityCategory,
  type CapabilityItem,
  type CapabilityCategoryId,
  type ModuleCapabilityId,
} from "@/lib/business-capabilities";
import type { RestaurantFeatureKey } from "@/lib/restaurant-features";

const CATEGORY_RO: Record<
  CapabilityCategoryId,
  { title: string; description: string }
> = {
  stock_costing: {
    title: "Stoc și costuri",
    description: "Urmărește livrări, costuri ingrediente, rețete și marje. Dezactivează pentru un meniu simplu.",
  },
  kitchen_orders: {
    title: "Bucătărie și comenzi",
    description: "Pentru businessuri care prepară la comandă și au nevoie de un flux clar de la casă la bucătărie.",
  },
  payments_till: {
    title: "Plăți și casă",
    description: "Cum încasează personalul și gestionează bacșișul la casă.",
  },
  products_menu: {
    title: "Produse și meniu",
    description: "Opțiuni extra pe produse când meniul are variante sau note.",
  },
  team_locations: {
    title: "Echipă și locații",
    description: "Mai mult control pentru personal sau mai multe sucursale.",
  },
  workstation: {
    title: "Layout stație de lucru",
    description: "Aranjament ecran pentru case aglomerate și display-uri bucătărie.",
  },
};

const MODULE_ITEM_RO: Record<ModuleCapabilityId, { label: string; description: string }> = {
  inventory: {
    label: "Stoc și achiziții",
    description: "Niveluri stoc, furnizori, achiziții și recepție.",
  },
  recipe_costing: {
    label: "Costuri rețete",
    description: "Rețete, costuri ingrediente și rapoarte marjă.",
  },
  team_advanced: {
    label: "Echipă și audit",
    description: "Roluri echipă, permisiuni și urmărire numerar.",
  },
  multi_site: {
    label: "Operațiuni multi-site",
    description: "Mai multe locații și comutare între site-uri.",
  },
};

const FEATURE_RO: Record<RestaurantFeatureKey, { label: string; description: string }> = {
  kitchen_display_enabled: {
    label: "Display bucătărie",
    description: "Trimite comenzile plătite de la POS către bucătărie sau prep.",
  },
  restaurant_order_flow_enabled: {
    label: "Flux comenzi",
    description: "Urmărește comenzile de la trimis la în pregătire, gata și finalizat.",
  },
  order_types_enabled: {
    label: "La masă / la pachet / livrare",
    description: "Etichetează comenzile ca să știe personalul cum pleacă fiecare.",
  },
  table_service_enabled: {
    label: "Gestionare mese",
    description: "Adaugă etichete masă și pregătește fluxuri de servire la masă.",
  },
  kitchen_stations_enabled: {
    label: "Stații prep",
    description: "Trimite articole către bucătărie, bar, cafea sau ambalare.",
  },
  product_modifiers_enabled: {
    label: "Opțiuni produs",
    description: "Adaugă alegeri: mărime, lapte, extra, note preparare.",
  },
  courses_enabled: {
    label: "Feluri / timing servire",
    description: "Grupează mâncarea pe feluri pentru servire formală.",
  },
  kitchen_printing_enabled: {
    label: "Tipărire bon bucătărie",
    description: "Tipărește bonuri prep când hardware-ul este configurat.",
  },
  payment_split_enabled: {
    label: "Plăți împărțite",
    description: "Încasează o vânzare pe numerar, card, voucher, transfer sau altele.",
  },
  tips_enabled: {
    label: "Bacșiș",
    description: "Adaugă bacșiș la checkout, separat de vânzările de produse.",
  },
  compact_workstation_nav_enabled: {
    label: "Vizualizare compactă stație",
    description: "Mai mult spațiu pe POS și bucătărie cu sidebar doar cu iconițe.",
  },
};

function localizeItem(item: CapabilityItem, locale: AppLocale): CapabilityItem {
  if (locale !== "ro") return item;
  if (item.kind === "module") {
    const ro = MODULE_ITEM_RO[item.id];
    return ro ? { ...item, label: ro.label, description: ro.description } : item;
  }
  const ro = FEATURE_RO[item.id];
  return ro ? { ...item, label: ro.label, description: ro.description } : item;
}

export function getLocalizedCapabilityCategories(locale: AppLocale): CapabilityCategory[] {
  return CAPABILITY_CATEGORIES.map((category) => {
    const ro = locale === "ro" ? CATEGORY_RO[category.id] : null;
    return {
      ...category,
      title: ro?.title ?? category.title,
      description: ro?.description ?? category.description,
      items: category.items.map((item) => localizeItem(item, locale)),
    };
  });
}

export function localizeCapabilityLabel(label: string, locale: AppLocale): string {
  if (locale !== "ro") return label;
  for (const mod of Object.values(MODULE_ITEM_RO)) {
    if (mod.label === label || matchesEnModuleLabel(label, mod)) return mod.label;
  }
  for (const feat of Object.values(FEATURE_RO)) {
    if (feat.label === label) return feat.label;
  }
  const enToRo: Record<string, string> = {
    "Stock & purchases": MODULE_ITEM_RO.inventory.label,
    "Recipe costing": MODULE_ITEM_RO.recipe_costing.label,
    "Team & audit": MODULE_ITEM_RO.team_advanced.label,
    "Multi-site operations": MODULE_ITEM_RO.multi_site.label,
  };
  return enToRo[label] ?? label;
}

function matchesEnModuleLabel(enLabel: string, ro: { label: string }): boolean {
  const reverse: Record<string, string> = {
    "Stock & purchases": MODULE_ITEM_RO.inventory.label,
    "Recipe costing": MODULE_ITEM_RO.recipe_costing.label,
    "Team & audit": MODULE_ITEM_RO.team_advanced.label,
    "Multi-site operations": MODULE_ITEM_RO.multi_site.label,
  };
  return reverse[enLabel] === ro.label;
}
