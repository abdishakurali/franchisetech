import { getKitchenOpsContext } from "@/lib/kitchenops/metrics";
import { getAppLocaleAndText } from "@/lib/app-locale-server";
import type { SetupStep } from "@/lib/setup-progress";
import { SetupChecklist } from "@/components/app/SetupChecklist";

export default async function SetupChecklistPage() {
  const { countryCode, profileLocale, supabase, orgId } = await getKitchenOpsContext();
  const { locale } = await getAppLocaleAndText(countryCode, profileLocale);
  const ro = locale === "ro";
  const [orgResult, products, sales, members] = await Promise.all([
    supabase.from("organisations").select("name,country,currency_code,fiscalnet_enabled").eq("id", orgId).maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("active", true),
    supabase.from("pos_transactions").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).eq("status", "completed"),
    supabase.from("organisation_members").select("id", { count: "exact", head: true }).eq("organisation_id", orgId).or("status.is.null,status.eq.active"),
  ]);
  // Query failures must not look like an empty organisation or completed setup.
  if (orgResult.error || products.error || sales.error || members.error) {
    throw new Error("Setup progress could not be loaded");
  }
  const org = orgResult.data;
  const steps: SetupStep[] = [
    { id: "business", title: ro ? "Datele firmei" : "Business details", text: ro ? "CUI, adresă, cote TVA" : "Tax ID, address, VAT rates", href: "/app/settings?tab=business", done: Boolean(org?.name && org?.country && org?.currency_code) },
    { id: "products", title: ro ? "Adaugă produsele" : "Add your products", text: products.count ? `${products.count} ${ro ? "produse în catalog" : "products in your catalogue"}` : (ro ? "Adaugă manual sau importă din CSV" : "Add manually or import a CSV"), href: "/app/products", done: (products.count ?? 0) > 0 },
    { id: "fiscal", title: ro ? "Conectează casa de marcat" : "Connect your till", text: ro ? "Doar din browserul casierului" : "From the cashier’s browser only", href: countryCode === "RO" ? "/app/settings?tab=fiscal" : "/app/pos", done: countryCode === "RO" ? Boolean(org?.fiscalnet_enabled) : (sales.count ?? 0) > 0 },
    { id: "team", title: ro ? "Invită echipa" : "Invite your team", text: ro ? "Casieri și manageri · opțional" : "Cashiers and managers · optional", href: "/app/settings/team", done: (members.count ?? 0) > 1 },
    { id: "first_sale", title: ro ? "Prima vânzare" : "Your first sale", text: ro ? "Deschide casa și înregistrează prima vânzare" : "Open your till and record the first sale", href: "/app/pos?welcome=1", done: (sales.count ?? 0) > 0 },
  ].map((step) => ({ ...step, label: ro ? "Continuă" : "Continue", section: "core" }));
  const doneCount = steps.filter((step) => step.done).length;
  return (
    <div className="flex min-h-[calc(100svh-120px)] items-center bg-background px-4 py-8 sm:px-10 sm:py-12">
      <SetupChecklist locale={locale} steps={steps} doneCount={doneCount} totalCount={steps.length} percent={Math.round(doneCount / steps.length * 100)} />
    </div>
  );
}
