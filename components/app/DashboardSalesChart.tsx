type SalesDay = {
  label: string;
  value: number;
};

type PaymentMix = {
  label: string;
  value: number;
  color: string;
};

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardSalesChart({
  days,
  paymentMix,
  currency,
}: {
  days: SalesDay[];
  paymentMix: PaymentMix[];
  currency: string;
}) {
  const max = Math.max(1, ...days.map((day) => day.value));
  const paymentTotal = paymentMix.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="sales-trend-title">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="sales-trend-title" className="text-base font-semibold text-foreground">Vânzări în ultimele 7 zile</h2>
            <p className="mt-1 text-xs text-muted-foreground">Total pe zi, din vânzările finalizate</p>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-muted-foreground">lei</span>
        </div>
        <div className="mt-6 grid grid-cols-7 items-end gap-2" role="img" aria-label="Grafic vânzări pe ultimele 7 zile">
          {days.map((day) => (
            <div key={day.label} className="flex min-w-0 flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground sm:text-xs">{day.value > 0 ? formatMoney(day.value, currency) : "—"}</span>
              <div className="flex h-28 w-full items-end rounded-md bg-accent/60 px-1" title={`${day.label}: ${formatMoney(day.value, currency)}`}>
                <div
                  className="w-full rounded-sm bg-brass transition-[height]"
                  style={{ height: `${Math.max(8, Math.round((day.value / max) * 100))}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground sm:text-xs">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5" aria-labelledby="payment-mix-title">
        <div>
          <h2 id="payment-mix-title" className="text-base font-semibold text-foreground">Încasări azi</h2>
          <p className="mt-1 text-xs text-muted-foreground">Defalcare după metoda de plată</p>
        </div>
        <p className="mt-5 text-2xl font-bold text-foreground">{formatMoney(paymentTotal, currency)}</p>
        <div className="mt-4 space-y-3">
          {paymentMix.map((item) => {
            const percentage = paymentTotal > 0 ? Math.round((item.value / paymentTotal) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground"><span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />{item.label}</span>
                  <span className="font-medium text-muted-foreground">{formatMoney(item.value, currency)} · {percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent" aria-hidden>
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
