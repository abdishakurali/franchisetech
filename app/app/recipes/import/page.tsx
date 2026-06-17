"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ParsedRow = {
  finished_product_name: string;
  ingredient_name: string;
  quantity_required: number;
  unit_of_measure: string;
  ingredient_cost?: number;
  status?: "ok" | "missing_product" | "missing_ingredient";
};

const SAMPLE_CSV = `finished_product_name,ingredient_name,quantity_required,unit_of_measure,ingredient_cost
Chicken Caesar,Cos Lettuce,0.25,head,1.20
Chicken Caesar,Chicken,120,g,0.012
Chicken Caesar,Bacon,30,g,0.018
Chicken Caesar,Croutons,25,g,0.006
Chicken Caesar,Parmesan,15,g,0.025
Chicken Caesar,Caesar dressing,30,ml,0.010`;

function parseCsv(raw: string): ParsedRow[] {
  const lines = raw.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z_]/g, "_"));
  const get = (cols: string[], names: string[]) => {
    const idx = names.map((n) => headers.indexOf(n)).find((i) => i >= 0) ?? -1;
    return idx >= 0 ? cols[idx]?.trim() ?? "" : "";
  };
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      finished_product_name: get(cols, ["finished_product_name", "finished_product", "product"]),
      ingredient_name: get(cols, ["ingredient_name", "ingredient"]),
      quantity_required: Number(get(cols, ["quantity_required", "quantity"])) || 0,
      unit_of_measure: get(cols, ["unit_of_measure", "unit"]) || "each",
      ingredient_cost: Number(get(cols, ["ingredient_cost", "cost"])) || undefined,
    };
  }).filter((r) => r.finished_product_name && r.ingredient_name && r.quantity_required > 0);
}

export default function RecipeImportClient() {
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [imported, setImported] = useState(false);
  const [_isPending, startTransition] = useTransition();

  const handleParse = () => {
    const parsed = parseCsv(csvText || SAMPLE_CSV);
    setRows(parsed);
    setImported(false);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    setRows(parseCsv(SAMPLE_CSV));
  };

  // Group by finished product
  const grouped = rows.reduce((acc, r) => {
    if (!acc[r.finished_product_name]) acc[r.finished_product_name] = [];
    acc[r.finished_product_name].push(r);
    return acc;
  }, {} as Record<string, ParsedRow[]>);

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <a href="/app/recipes" className="text-sm text-slate-500 hover:text-slate-700">← Recipes</a>
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Import recipes from CSV</h1>
          <p className="mt-1 text-sm text-slate-500">Use this to connect products to ingredients.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>CSV format</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">Required columns: <code className="bg-slate-100 px-1 rounded text-xs">finished_product_name, ingredient_name, quantity_required, unit_of_measure</code></p>
          <p className="text-sm text-slate-500">Optional: <code className="bg-slate-100 px-1 rounded text-xs">ingredient_cost</code> (falls back to product cost_price)</p>
          <textarea
            className="w-full h-40 rounded-md border border-slate-200 p-3 text-sm font-mono"
            placeholder={SAMPLE_CSV}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleLoadSample} type="button">Load sample</Button>
            <Button onClick={handleParse} type="button">Preview import</Button>
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview — {rows.length} ingredient rows, {Object.keys(grouped).length} recipe{Object.keys(grouped).length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(grouped).map(([product, ingredients]) => (
              <div key={product} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <p className="font-semibold text-slate-900">{product}</p>
                  <Badge variant="secondary">{ingredients.length} ingredients</Badge>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-400"><th className="pb-1">Ingredient</th><th className="pb-1 text-right">Qty</th><th className="pb-1">Unit</th><th className="pb-1 text-right">Cost/unit</th></tr></thead>
                  <tbody>
                    {ingredients.map((ing, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-1">{ing.ingredient_name}</td>
                        <td className="py-1 text-right">{ing.quantity_required}</td>
                        <td className="py-1 pl-2">{ing.unit_of_measure}</td>
                        <td className="py-1 text-right text-slate-400">{ing.ingredient_cost ? `€${ing.ingredient_cost.toFixed(3)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Before importing:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>Create the finished products (e.g. Chicken Caesar) in Products as <strong>sellable</strong>.</li>
                <li>Create all ingredient products (e.g. Chicken, Cos Lettuce) as <strong>ingredient</strong>.</li>
                <li>Then come back here and click Import — it will match by name.</li>
              </ul>
          <p className="mt-2 text-xs text-amber-700">Recipe import preview is ready. Save recipes with the manual form for now.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/app/recipes/new"><Button type="button">Create recipe manually →</Button></Link>
              <Link href="/app/products/new"><Button variant="outline" type="button">Add products first</Button></Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
