import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import {
  ebrizaPricingComparisonRows,
  type EbrizaPricingCell,
} from "@/lib/marketing/ebriza-pricing-comparison";
import type { MarketingMessages } from "@/lib/marketing/i18n/en";

type EbrizaComparisonCopy = MarketingMessages["pricing"]["ebrizaComparison"];

function CellContent({
  cell,
  labels,
}: {
  cell: EbrizaPricingCell;
  labels: EbrizaComparisonCopy;
}) {
  if (cell === "included") {
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-700">
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        <span className="sr-only">{labels.included}</span>
      </span>
    );
  }
  if (cell === "excluded") {
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400">
        <X className="h-4 w-4 shrink-0" aria-hidden />
        <span className="sr-only">{labels.excluded}</span>
      </span>
    );
  }
  if ("addon" in cell) {
    return (
      <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
        {cell.addon}
      </span>
    );
  }
  return <span className="text-base font-bold tabular-nums text-slate-950 sm:text-lg">{cell.total}</span>;
}

export function PricingEbrizaComparisonTable({ labels }: { labels: EbrizaComparisonCopy }) {
  return (
    <div className="mt-8">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="py-3 pr-4 font-semibold text-slate-700">
                {labels.colFeature}
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-blue-700">
                {labels.colFranchisetech}
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-slate-700">
                {labels.colEbrizaPro}
              </th>
              <th scope="col" className="px-3 py-3 font-semibold text-slate-700">
                {labels.colEbrizaPremium}
              </th>
            </tr>
          </thead>
          <tbody>
            {ebrizaPricingComparisonRows.map((row) => {
              const featureLabel = labels.rows[row.featureKey];
              const rowClass = row.isTotal
                ? "border-t-2 border-slate-300 bg-slate-50 font-semibold"
                : row.emphasize
                  ? "bg-blue-50/40"
                  : "";
              return (
                <tr key={row.featureKey} className={`border-b border-slate-100 ${rowClass}`}>
                  <th
                    scope="row"
                    className={`py-3.5 pr-4 text-left font-medium ${row.isTotal ? "text-slate-950" : "text-slate-800"}`}
                  >
                    {featureLabel}
                  </th>
                  <td className="px-3 py-3.5">
                    <CellContent cell={row.franchisetech} labels={labels} />
                  </td>
                  <td className="px-3 py-3.5">
                    <CellContent cell={row.ebrizaPro} labels={labels} />
                  </td>
                  <td className="px-3 py-3.5">
                    <CellContent cell={row.ebrizaPremium} labels={labels} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{labels.footnote}</p>
      <Link
        href={labels.compareHref}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
      >
        {labels.readComparison} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function PricingEbrizaComparisonFallback({ labels }: { labels: EbrizaComparisonCopy }) {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm leading-6 text-slate-600">{labels.fallbackText}</p>
      <Link
        href={labels.compareHref}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
      >
        {labels.readComparison} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
