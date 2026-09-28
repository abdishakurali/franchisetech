"use client";

import { useState } from "react";

export type MovementRow = {
  id: string;
  date: string;
  type: string;
  product: string;
  quantity: number;
  unit: string;
  value: number | null;
};

export type NirRow = {
  id: string;
  number: string;
  date: string;
  supplier: string;
  lineCount: number;
  total: number;
};

export type ProductRow = {
  id: string;
  code: string;
  name: string;
  stock: number;
  unit: string;
  value: number | null;
};

const money = (value: number) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(value);
const qty = (value: number) => new Intl.NumberFormat("ro-RO", { maximumFractionDigits: 3 }).format(value);
const when = (value: string) => new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(new Date(value));

type Tab = "movements" | "nir" | "products";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "movements", label: "Mișcări de stoc" },
  { id: "nir", label: "NIR-uri" },
  { id: "products", label: "Produse" },
];

function Empty({ label }: { label: string }) {
  return <p className="px-5 py-10 text-center text-sm text-slate-500">{label}</p>;
}

export function AccountantWorkspaceTabs({
  movements,
  nirs,
  products,
}: {
  // null means this accountant's granted permissions don't cover this tab at
  // all — hide the tab entirely rather than show it empty (which would read
  // as "there's nothing here" instead of "you don't have access to this").
  movements: MovementRow[] | null;
  nirs: NirRow[] | null;
  products: ProductRow[] | null;
}) {
  const visibleTabs = TABS.filter((t) => {
    if (t.id === "movements") return movements !== null;
    if (t.id === "nir") return nirs !== null;
    return products !== null;
  });
  const [tab, setTab] = useState<Tab>(visibleTabs[0]?.id ?? "movements");
  const activeTab = visibleTabs.some((t) => t.id === tab) ? tab : visibleTabs[0]?.id;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex border-b border-slate-200">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold transition ${
              activeTab === t.id
                ? "border-b-2 border-[#0B1D33] text-[#0B1D33]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "movements" && movements && (
        movements.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Tip mișcare</th>
                  <th className="px-5 py-3">Produs</th>
                  <th className="px-5 py-3 text-right">Cantitate</th>
                  <th className="px-5 py-3">U.M.</th>
                  <th className="px-5 py-3 text-right">Valoare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-5 py-3 text-slate-600">{when(m.date)}</td>
                    <td className="px-5 py-3 text-slate-900">{m.type}</td>
                    <td className="px-5 py-3 text-slate-900">{m.product}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">{qty(m.quantity)}</td>
                    <td className="px-5 py-3 text-slate-500">{m.unit}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-900">{m.value != null ? money(m.value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty label="Nicio mișcare de stoc în perioada selectată." />
      )}

      {activeTab === "nir" && nirs && (
        nirs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Număr NIR</th>
                  <th className="px-5 py-3">Data</th>
                  <th className="px-5 py-3">Furnizor</th>
                  <th className="px-5 py-3 text-right">Nr. produse</th>
                  <th className="px-5 py-3 text-right">Valoare totală</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nirs.map((n) => (
                  <tr key={n.id}>
                    <td className="px-5 py-3 font-medium text-slate-900">{n.number}</td>
                    <td className="px-5 py-3 text-slate-600">{when(n.date)}</td>
                    <td className="px-5 py-3 text-slate-900">{n.supplier}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">{n.lineCount}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-900">{money(n.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty label="Nicio notă de intrare-recepție în perioada selectată." />
      )}

      {activeTab === "products" && products && (
        products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Cod produs</th>
                  <th className="px-5 py-3">Denumire</th>
                  <th className="px-5 py-3 text-right">Stoc curent</th>
                  <th className="px-5 py-3">U.M.</th>
                  <th className="px-5 py-3 text-right">Valoare stoc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 text-slate-500">{p.code}</td>
                    <td className="px-5 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-600">{qty(p.stock)}</td>
                    <td className="px-5 py-3 text-slate-500">{p.unit}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-slate-900">{p.value != null ? money(p.value) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty label="Niciun produs activ." />
      )}
    </div>
  );
}
