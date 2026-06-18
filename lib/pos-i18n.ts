export type PosLocale = "en" | "ro";

export const posText = {
  en: {
    order: "Order",
    payment: "Payment",
    clearAll: "Clear all",
    tapToAdd: "Tap a product to add it.",
    discountPct: "Discount %",
    subtotal: "Subtotal",
    inclVat: "Incl. VAT",
    inclTva: "Incl. VAT",
    tip: "Tip",
    total: "Total",
    pay: "Pay",
    backToOrder: "Back to order",
    charge: "Charge",
    validateCharge: "Validate & charge",
    processing: "Processing…",
    insufficientCash: "Insufficient cash",
    addItems: "Add items to pay",
    setupPaymentMethods: "Set up payment methods in Settings",
    cashReceived: "Cash received",
    changeDue: "Change due",
    exact: "Exact",
    cashUnderpaidMsg: "Amount received is less than the total due.",
    paymentMethod: "Payment method",
    saleNotCompleted: "Sale not completed. No payment recorded. Please try again.",
    appUpdated: "The POS updated in the background. Your order is kept — reload and try again.",
    payItems: (n: number) => `${n} item${n !== 1 ? "s" : ""}`,
    paymentCash: "Cash",
    paymentCard: "Card",
    paymentOnline: "Online",
    paymentOther: "Other",
    paymentGeneric: "Payment",
    split: "Split",
    splitPayment: "Split payment",
    splitPaid: (amount: string) => `Paid ${amount}`,
    splitRemaining: (amount: string) => `Remaining ${amount}`,
    splitFullyPaid: "Fully paid ✓",
    addSplitPayment: "+ Add split payment",
    downloadTxtAgain: "Download TXT again",
    saleSaved: (amount: string) => `✓ Sale ${amount} saved.`,
    saleSavedFiscal: (amount: string, msg: string) => `✓ Sold ${amount} — ${msg}`,
    saleSavedFiscalWarn: (msg: string) => `✓ Sale saved | ⚠️ FiscalNet: ${msg}`,
    saleSavedMock: (amount: string) =>
      `✓ Sale ${amount} saved. ⚠️ Simulation mode — no fiscal receipt. Disable "Simulation mode" in Settings.`,
    offlineQueued: "Sale queued — pending sync when connection returns. Cart cleared.",
    offlineSyncing: "Back online — syncing queued sales…",
    offlineSyncDone: (n: number) =>
      `${n} sale${n !== 1 ? "s" : ""} synced to the register. Print fiscal receipt for each if required.`,
    offlinePendingSync: (n: number) =>
      `${n} sale${n !== 1 ? "s" : ""} pending sync`,
    offlinePendingFiscal: (n: number) =>
      `${n} sale${n !== 1 ? "s" : ""} pending fiscal receipt`,
    offlinePendingFiscalRow: "Saved — fiscal receipt still required",
    offlinePendingSyncRow: "Waiting for connection",
    offlineFiscalDismiss: "Fiscal done",
    offlineViewReceipt: "View receipt",
    lineTotalLockedHint: "Use Discount % for fiscal receipts",
    offlineQueueLabel: (items: number, total: string) =>
      `${items} item${items !== 1 ? "s" : ""} · ${total}`,
    holdOrder: "Hold order",
    heldOrders: "Held orders",
    resumeOrder: "Resume",
    noHeldOrders: "No held orders",
    orderHeld: "Order parked — you can start a new sale.",
    allCategories: "All",
    searchProducts: "Search products…",
    searchCustomer: "Search customer…",
    noContact: "No contact details",
    typeToSearchCustomers: "Type to search saved customers",
    addNewCustomer: (name: string) => `+ Add "${name}" as new customer`,
    notes: "Notes",
    splitLabel: (n: number) => `Split (${n})`,
    edit: "Edit",
    orderTypeEdit: "Order",
    tablePrefix: "Table",
  },
  ro: {
    order: "Comandă",
    payment: "Plată",
    clearAll: "Golește tot",
    tapToAdd: "Atinge un produs pentru a-l adăuga.",
    discountPct: "Reducere %",
    subtotal: "Subtotal",
    inclVat: "Incl. TVA",
    inclTva: "Incl. TVA",
    tip: "Bacșiș",
    total: "Total",
    pay: "Plătește",
    backToOrder: "Înapoi la comandă",
    charge: "Încasează",
    validateCharge: "Validează și încasează",
    processing: "Se procesează…",
    insufficientCash: "Sumă insuficientă",
    addItems: "Adaugă produse",
    setupPaymentMethods: "Configurează metodele de plată în Setări",
    cashReceived: "Clientul a dat",
    changeDue: "Rest de dat",
    exact: "Exact",
    cashUnderpaidMsg: "Suma primită este insuficientă.",
    paymentMethod: "Metodă de plată",
    saleNotCompleted: "Vânzarea nu a fost finalizată. Nicio plată nu a fost înregistrată. Încearcă din nou.",
    appUpdated: "Aplicația s-a actualizat în fundal. Comanda ta este intactă — reîncarcă pagina și încearcă din nou.",
    payItems: (n: number) => `${n} produs${n !== 1 ? "e" : ""}`,
    paymentCash: "Numerar",
    paymentCard: "Card",
    paymentOnline: "Online",
    paymentOther: "Altele",
    paymentGeneric: "Plată",
    split: "Împărțit",
    splitPayment: "Plată împărțită",
    splitPaid: (amount: string) => `Încasat ${amount}`,
    splitRemaining: (amount: string) => `Rămas ${amount}`,
    splitFullyPaid: "Încasat complet ✓",
    addSplitPayment: "+ Adaugă plată împărțită",
    downloadTxtAgain: "Descarcă TXT din nou",
    saleSaved: (amount: string) => `✓ Vânzare ${amount} salvată.`,
    saleSavedFiscal: (amount: string, msg: string) => `✓ Vândut ${amount} — ${msg}`,
    saleSavedFiscalWarn: (msg: string) => `✓ Vânzare salvată | ⚠️ FiscalNet: ${msg}`,
    saleSavedMock: (amount: string) =>
      `✓ Vânzare ${amount} salvată. ⚠️ Mod simulare — bon fiscal neemis. Dezactivează „Mod simulare” în Setări.`,
    offlineQueued: "Vânzare în coadă — așteaptă sincronizarea. Coș golit.",
    offlineSyncing: "Conexiune restabilită — sincronizare vânzări…",
    offlineSyncDone: (n: number) =>
      `${n} vânzări sincronizate. Emite bonul fiscal pentru fiecare, dacă e cazul.`,
    offlinePendingSync: (n: number) =>
      `${n} vânzări așteaptă sincronizarea`,
    offlinePendingFiscal: (n: number) =>
      `${n} vânzări așteaptă bon fiscal`,
    offlinePendingFiscalRow: "Salvat — bon fiscal încă necesar",
    offlinePendingSyncRow: "Așteaptă conexiunea",
    offlineFiscalDismiss: "Bon emis",
    offlineViewReceipt: "Vezi bonul",
    lineTotalLockedHint: "Folosește Reducere % pentru bon fiscal",
    offlineQueueLabel: (items: number, total: string) =>
      `${items} produs${items !== 1 ? "e" : ""} · ${total}`,
    holdOrder: "Pune în așteptare",
    heldOrders: "Comenzi în așteptare",
    resumeOrder: "Reia",
    noHeldOrders: "Nicio comandă în așteptare",
    orderHeld: "Comandă parcată — poți începe o vânzare nouă.",
    allCategories: "Toate",
    searchProducts: "Caută produse…",
    searchCustomer: "Caută client…",
    noContact: "Fără date de contact",
    typeToSearchCustomers: "Tastează pentru a căuta clienți salvați",
    addNewCustomer: (name: string) => `+ Adaugă „${name}” ca client nou`,
    notes: "Note",
    splitLabel: (n: number) => `Împărțit (${n})`,
    edit: "Editează",
    orderTypeEdit: "Comandă",
    tablePrefix: "Masă",
  },
} as const;

export function posLocale(isRO: boolean): PosLocale {
  return isRO ? "ro" : "en";
}

export function paymentTypeLabel(type: string, name: string, locale: PosLocale): string {
  const t = posText[locale];
  if (type === "cash") return t.paymentCash;
  if (type === "card") return t.paymentCard;
  if (type === "online") return t.paymentOnline;
  if (type === "other") return t.paymentOther;
  return name || t.paymentGeneric;
}

export function friendlySaleError(error: string, isRO: boolean): string {
  const lower = error.toLowerCase();
  if (lower.includes("cash received") || lower.includes("less than")) {
    return isRO ? "Suma primită este insuficientă." : "Amount received is less than the total due.";
  }
  if (lower.includes("payment method")) {
    return isRO ? "Selectează o metodă de plată validă." : "Select a valid payment method.";
  }
  if (lower.includes("cart") || lower.includes("empty")) {
    return isRO ? "Coșul este gol." : "Cart is empty.";
  }
  if (lower.includes("session") || lower.includes("till")) {
    return isRO ? "Sesiunea de casă nu este deschisă. Deschide casa înainte de vânzare." : "Till session is not open. Open the till before selling.";
  }
  return isRO
    ? "Plata nu a putut fi finalizată. Încearcă din nou sau contactează suportul."
    : "Payment could not be completed. Please try again or contact support.";
}
