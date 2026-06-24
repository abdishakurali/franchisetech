"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ExportConfig = {
  key: string;
  label: string;
  labelRo: string;
  description: string;
  descriptionRo: string;
  color: string;
};

const SAGA_EXPORTS: ExportConfig[] = [
  {
    key: "combined",
    label: "Full Export",
    labelRo: "Export complet",
    description: "NIR + Sales combined XML",
    descriptionRo: "NIR + Vânzări în format XML",
    color: "bg-violet-600 hover:bg-violet-700",
  },
  {
    key: "nir",
    label: "NIR (Purchases)",
    labelRo: "NIR (Achiziții)",
    description: "Purchase receipts for Saga",
    descriptionRo: "Note de intrare-recepție",
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    key: "sales",
    label: "Sales (Vânzări)",
    labelRo: "Vânzări",
    description: "Daily sales with VAT breakdown",
    descriptionRo: "Vânzări zilnice cu TVA",
    color: "bg-cyan-600 hover:bg-cyan-700",
  },
];

export function SagaExportButtons({
  fromDate,
  toDate,
  isRO = false,
}: {
  fromDate: string;
  toDate: string;
  isRO?: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const download = async (key: string) => {
    setLoading(key);
    try {
      const resp = await fetch(`/api/saga-export?type=${key}&from=${fromDate}&to=${toDate}`);
      if (!resp.ok) throw new Error("Export failed");
      const xml = await resp.text();
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `saga-${key}-${fromDate}-${toDate}.xml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(isRO ? "Export eșuat. Vă rugăm încercați din nou." : "Export failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRO ? "Export Saga XML" : "Saga XML Export"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          {isRO
            ? "Exportă datele în format XML compatibil cu software-ul de contabilitate Saga."
            : "Export data in XML format compatible with Saga accounting software."}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SAGA_EXPORTS.map((exp) => (
            <button
              key={exp.key}
              onClick={() => download(exp.key)}
              disabled={loading === exp.key}
              className={`rounded-lg p-4 text-left text-white transition-opacity ${exp.color} disabled:opacity-60`}
            >
              <p className="font-semibold">
                {loading === exp.key
                  ? isRO
                    ? "Se exportă…"
                    : "Exporting…"
                  : isRO
                    ? exp.labelRo
                    : exp.label}
              </p>
              <p className="mt-0.5 text-sm opacity-80">{isRO ? exp.descriptionRo : exp.description}</p>
            </button>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">
          {isRO
            ? `Toate exporturile includ date din ${fromDate} până la ${toDate}.`
            : `All exports include data from ${fromDate} to ${toDate}.`}
        </p>
      </CardContent>
    </Card>
  );
}
