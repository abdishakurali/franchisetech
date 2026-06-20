import type { PosLocale } from "@/lib/pos-i18n";

export type AppLocale = PosLocale;

export const appText = {
  en: {
    nav: {
      dashboard: "Dashboard",
      setupGuide: "Setup guide",
      pos: "POS",
      products: "Products",
      recipes: "Recipes",
      stock: "Stock",
      stockLevels: "Stock levels",
      purchases: "Purchases",
      suppliers: "Suppliers",
      kitchen: "Kitchen",
      settings: "Settings",
      logout: "Log out",
    },
    shell: {
      openNav: "Open navigation",
      closeNav: "Close navigation",
      language: "Language",
      inviteTitle: "Invite a friend, get 1 free month",
      inviteDesc:
        "Share your link with another cafe or food business. When they make their first payment, you earn one free month on your account.",
      referralCode: "Code",
      trialDaysLeft: (n: number) => `Trial: ${n} day${n === 1 ? "" : "s"} left`,
      referralCredit: (n: number) =>
        `Referral credit: ${n} free month${n === 1 ? "" : "s"} earned`,
      setupIncomplete: "Complete setup",
      kitchenDisplay: "Kitchen display",
    },
  },
  ro: {
    nav: {
      dashboard: "Panou",
      setupGuide: "Ghid configurare",
      pos: "POS",
      products: "Produse",
      recipes: "Rețete",
      stock: "Stoc",
      stockLevels: "Niveluri stoc",
      purchases: "Achiziții",
      suppliers: "Furnizori",
      kitchen: "Bucătărie",
      settings: "Setări",
      logout: "Deconectare",
    },
    shell: {
      openNav: "Deschide navigarea",
      closeNav: "Închide navigarea",
      language: "Limbă",
      inviteTitle: "Invită un prieten, primești 1 lună gratuită",
      inviteDesc:
        "Trimite linkul către o altă cafenea sau afacere alimentară. La prima plată a lor, primești o lună gratuită pe contul tău.",
      referralCode: "Cod",
      trialDaysLeft: (n: number) => `Trial: ${n} ${n === 1 ? "zi" : "zile"} rămase`,
      referralCredit: (n: number) =>
        `Credit recomandare: ${n} ${n === 1 ? "lună" : "luni"} gratuite`,
      setupIncomplete: "Finalizează configurarea",
      kitchenDisplay: "Display bucătărie",
    },
  },
} as const;

export type AppT = (typeof appText)[AppLocale];

export function getAppText(locale: AppLocale): AppT {
  return appText[locale];
}
