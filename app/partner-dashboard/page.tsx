import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CopyReferralButton } from "@/components/app/CopyReferralButton";

const money = (value: number) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "EUR" }).format(value);

const STATUS_LABEL: Record<string, string> = {
  pending: "În așteptare",
  active: "Client plătitor",
  churned: "Renunțat",
};

export default async function PartnerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/partner-dashboard");

  const { data: partner } = await supabase
    .from("accountant_partners")
    .select("id,name,firm_name,referral_code,commission_rate_eur,status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold">Niciun cont de partener găsit</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Acest cont nu este înregistrat în programul de parteneri.{" "}
          <Link href="/accountant-partners" className="text-brass hover:underline">Înscrie-te aici</Link>.
        </p>
      </main>
    );
  }

  const { data: referrals } = await supabase
    .from("partner_referrals")
    .select("id,organisation_id,status,referred_at,first_payment_at,organisations(name,company_legal_name)")
    .eq("partner_id", partner.id)
    .order("referred_at", { ascending: false });

  const referralIds = (referrals ?? []).map((r) => r.id);
  const now = new Date();
  const periodMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  const { data: commissions } = referralIds.length
    ? await supabase
        .from("partner_commissions")
        .select("referral_id,period_month,amount_eur,status")
        .in("referral_id", referralIds)
    : { data: [] };

  const thisMonthByReferral = new Map<string, number>();
  let pendingTotal = 0;
  let paidTotal = 0;
  for (const c of commissions ?? []) {
    if (c.period_month === periodMonth) {
      thisMonthByReferral.set(c.referral_id, (thisMonthByReferral.get(c.referral_id) ?? 0) + Number(c.amount_eur));
    }
    if (c.status === "pending") pendingTotal += Number(c.amount_eur);
    else if (c.status === "paid") paidTotal += Number(c.amount_eur);
  }

  const referralLink = `${process.env.NODE_ENV === "production" ? "https://www.franchisetech.ro" : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")}/signup?ref=${encodeURIComponent(partner.referral_code)}`;
  const activeClientCount = (referrals ?? []).filter((r) => r.status === "active").length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">Panou de partener</p>
        <h1 className="mt-1 text-2xl font-bold">{partner.firm_name || partner.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{partner.commission_rate_eur}€/lună per client abonat plătitor</p>
      </header>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold">Linkul tău de recomandare</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="break-all rounded-lg bg-secondary px-3 py-2 text-sm text-foreground">{referralLink}</p>
          <CopyReferralButton link={referralLink} />
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Clienți recomandați" value={String((referrals ?? []).length)} />
        <Metric label="Clienți plătitori" value={String(activeClientCount)} />
        <Metric label="Comisioane în așteptare" value={money(pendingTotal)} />
        <Metric label="Comisioane plătite" value={money(paidTotal)} />
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4"><h2 className="font-semibold">Clienți recomandați</h2></div>
        {(referrals ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nu ai încă niciun client recomandat. Trimite-le linkul de mai sus.</p>
        ) : (
          <div className="divide-y divide-border">
            {(referrals ?? []).map((r) => {
              const org = Array.isArray(r.organisations) ? r.organisations[0] : r.organisations;
              const earnedThisMonth = thisMonthByReferral.get(r.id) ?? 0;
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                  <div>
                    <p className="font-medium">{org?.company_legal_name || org?.name || "Client"}</p>
                    <p className="text-xs text-muted-foreground">Recomandat {new Date(r.referred_at).toLocaleDateString("ro-RO")}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.status === "active" ? "bg-reconciled/10 text-reconciled" : r.status === "churned" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                    <span className="font-medium tabular-nums">{money(earnedThisMonth)} luna asta</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 flex gap-3 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-attention" />
        <p>Comisioanele sunt generate automat lunar și marcate „în așteptare&rdquo;. Plata către tine se face manual, prin transfer bancar — nu există plăți automate din platformă. Contactează-ne pentru detalii de facturare și plată.</p>
      </section>

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Gift className="size-4" />
        <span>Vrei să trimiți linkul mai departe? Copiază-l de mai sus și trimite-l direct clienților tăi.</span>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold tabular-nums">{value}</p></div>;
}
