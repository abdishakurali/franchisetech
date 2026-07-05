"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lock } from "lucide-react";
import { updateNotificationPreference, type NotificationKey } from "@/app/actions/org-settings";
import { toast } from "sonner";

type Prefs = Record<NotificationKey, boolean>;

const PAID_KEYS: NotificationKey[] = ["daily_report", "weekly_report", "sales_alert"];

const LABELS: Record<NotificationKey, { label: string; desc: string; channel: "Email" | "In-app" }> = {
  stock_low: {
    label: "Stoc redus",
    desc: "Alertă când un ingredient scade sub nivelul minim definit",
    channel: "Email",
  },
  stock_empty: {
    label: "Stoc epuizat",
    desc: "Alertă imediată când stocul ajunge la 0",
    channel: "Email",
  },
  bon_consum_generated: {
    label: "Bon de consum generat",
    desc: "Confirmare email după fiecare bon de consum zilnic",
    channel: "Email",
  },
  efactura_rejected: {
    label: "e-Factură respinsă",
    desc: "Alertă dacă SPV returnează eroare la transmiterea unei facturi",
    channel: "Email",
  },
  efactura_deadline: {
    label: "e-Factură aproape de termen",
    desc: "Reamintire cu 1 zi înainte de expirarea termenului de 5 zile lucrătoare",
    channel: "Email",
  },
  nir_missing_cui: {
    label: "NIR fără CUI furnizor",
    desc: "Alertă dacă o recepție e înregistrată fără CUI furnizor valid",
    channel: "In-app",
  },
  daily_report: {
    label: "Raport zilnic vânzări",
    desc: "Email cu ziua precedentă completă, la ora configurată",
    channel: "Email",
  },
  weekly_report: {
    label: "Raport săptămânal",
    desc: "Email în ziua aleasă, cu perioada completă raportată",
    channel: "Email",
  },
  sales_alert: {
    label: "Alertă vânzări scăzute",
    desc: "Notificare dacă ziua curentă e sub 70% față de media ultimelor 7 zile",
    channel: "Email",
  },
};

const DEFAULT_PREFS: Prefs = {
  stock_low: true,
  stock_empty: true,
  bon_consum_generated: false,
  efactura_rejected: true,
  efactura_deadline: true,
  nir_missing_cui: true,
  daily_report: false,
  weekly_report: false,
  sales_alert: false,
};

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-slate-900" : "bg-slate-200",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

function NotifRow({
  notifKey,
  checked,
  onChange,
  locked,
  planLabel,
}: {
  notifKey: NotificationKey;
  checked: boolean;
  onChange: (k: NotificationKey, v: boolean) => void;
  locked?: boolean;
  planLabel?: string;
}) {
  const meta = LABELS[notifKey];
  return (
    <div className="flex items-start gap-4 py-3">
      <div className="pt-0.5">
        {locked ? (
          <div className="relative inline-flex h-5 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
            <Lock className="h-3 w-3 text-slate-400" />
          </div>
        ) : (
          <Toggle checked={checked} onChange={(v) => onChange(notifKey, v)} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-900">{meta.label}</span>
          <Badge variant="outline" className="text-xs h-5 px-1.5 text-slate-500">
            {meta.channel}
          </Badge>
          {locked && (
            <Badge className="text-xs h-5 px-1.5 bg-amber-100 text-amber-800 border-0">
              {planLabel ?? "Plan Operations"}
            </Badge>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{meta.desc}</p>
      </div>
    </div>
  );
}

export function NotificationPreferences({
  initialPrefs,
  canEdit = true,
  reportsIncluded = false,
}: {
  initialPrefs: Partial<Prefs>;
  canEdit?: boolean;
  reportsIncluded?: boolean;
}) {
  const [prefs, setPrefs] = useState<Prefs>({ ...DEFAULT_PREFS, ...initialPrefs });
  const [, startTransition] = useTransition();

  function handleChange(key: NotificationKey, enabled: boolean) {
    if (!canEdit) return;
    setPrefs((prev) => ({ ...prev, [key]: enabled }));
    startTransition(async () => {
      try {
        await updateNotificationPreference(key, enabled);
      } catch {
        setPrefs((prev) => ({ ...prev, [key]: !enabled }));
        toast.error("Nu s-a putut salva preferința. Încearcă din nou.");
      }
    });
  }

  function handlePaidClick() {
    toast("Această notificare necesită planul Operations.", {
      description: "Upgrade-ează pentru rapoarte automate și alerte de performanță.",
      action: { label: "Vezi planurile", onClick: () => window.open("/pricing", "_blank") },
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operațional</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-2">
            Notificări în timp real despre stoc și operațiuni zilnice. Gratuite, trimise pe email la proprietar.
          </p>
          <div className="divide-y divide-slate-100">
            {(["stock_low", "stock_empty", "bon_consum_generated"] as NotificationKey[]).map((k) => (
              <NotifRow key={k} notifKey={k} checked={prefs[k]} onChange={handleChange} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fiscal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-2">
            Alerte pentru conformitate e-Factura și integritate NIR. Gratuite.
          </p>
          <div className="divide-y divide-slate-100">
            {(["efactura_rejected", "efactura_deadline", "nir_missing_cui"] as NotificationKey[]).map(
              (k) => (
                <NotifRow key={k} notifKey={k} checked={prefs[k]} onChange={handleChange} />
              )
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Rapoarte
            {!reportsIncluded && <Badge className="text-xs bg-amber-100 text-amber-800 border-0">Plan Operations</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500 mb-2">
            Rapoarte automate și alerte de performanță. Incluse în Operations.
          </p>
          <div className="divide-y divide-slate-100">
            {PAID_KEYS.map((k) => (
              reportsIncluded ? (
                <NotifRow key={k} notifKey={k} checked={prefs[k]} onChange={handleChange} />
              ) : (
                <div key={k} onClick={handlePaidClick} className="cursor-pointer">
                  <NotifRow notifKey={k} checked={false} onChange={() => {}} locked />
                </div>
              )
            ))}
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-slate-500">
            <a href="/pricing" className="text-blue-600 hover:underline">
              Compară planurile →
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
