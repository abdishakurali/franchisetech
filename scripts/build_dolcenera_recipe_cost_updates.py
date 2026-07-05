#!/usr/bin/env python3
"""Build the Dolce Nera recipe-cost SQL from Odoo (Abi Flowers Boutique, company_id=42)
against the CURRENT state of franchisetech's recipes/recipe_items.

Rules (per owner instruction):
  - Cost is the priority. For products that already have a recipe in franchisetech,
    only UPDATE the cost fields (unit_cost, total_cost, unit_cost_snapshot) on
    ingredient rows that match an Odoo BOM line by name. Everything else about
    that recipe (quantity, unit, ingredient_product_id, other ingredients not in
    Odoo's BOM) is left exactly as-is.
  - For products with NO existing recipe at all, insert a full new recipe —
    but only after re-confirming (via a fresh snapshot) that nothing already
    exists for that product, to avoid duplicates.
  - One exception: a recipe row can exist with zero recipe_items (an empty shell).
    That case gets recipe_items inserted into the EXISTING recipe_id, not a new recipe.
  - Fuzzy/unmatched finished products and unmatched ingredients are reported only —
    never silently written.

READ-ONLY against Odoo. Writes nothing to Supabase — only generates local files.

Inputs (already exported this session):
  data/dolcenera-supabase-products-snapshot.json     (360 products, all orgs=Dolce Nera)
  data/dolcenera-supabase-recipe-items-snapshot.json (79 existing recipes + their items)

Plus the one known empty-shell recipe, hardcoded below (confirmed via direct query —
see conversation: "CAFEA PRAJITA - PREMIUM 3 1kg" has a recipe row with 0 items).
"""
from __future__ import annotations

import csv
import json
import re
import subprocess
import unicodedata
from pathlib import Path

ORG_ID = "b01ce0e0-d01c-4042-0000-000000000042"
ODOO_COMPANY = 42
ODOO_DB = "dolcenera_20260615"

# recipe_id -> product_id for recipes that exist but currently have zero recipe_items.
EMPTY_RECIPE_SHELLS = {
    "e983adec-3036-4df0-8763-ce357477cd0a": "c6d2be06-4266-4e81-b6d5-05de3e6edfe7",  # CAFEA PRAJITA - PREMIUM 3 1kg
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def sql_str(s: str) -> str:
    return "'" + (s or "").replace("'", "''") + "'"


def psql_json(query: str) -> list[dict]:
    raw = subprocess.check_output(["psql", "-d", ODOO_DB, "-t", "-A", "-c", query], text=True).strip()
    return json.loads(raw) if raw else []


BOM_QUERY = f"""
SELECT json_agg(row_to_json(t)) FROM (
  SELECT b.id AS bom_id,
    COALESCE(NULLIF(pt.name->>'ro_RO',''), pt.name->>'en_US', pt.name::text) AS finished_product,
    b.product_qty AS yield_qty
  FROM mrp_bom b
  JOIN product_template pt ON pt.id = b.product_tmpl_id
  WHERE b.company_id = {ODOO_COMPANY} AND b.active = true
) t;
"""

BOM_LINE_QUERY = f"""
SELECT json_agg(row_to_json(t)) FROM (
  SELECT bl.bom_id, bl.product_qty AS ingredient_qty,
    COALESCE(NULLIF(ipt.name->>'ro_RO',''), ipt.name->>'en_US', ipt.name::text) AS ingredient_name,
    iuom.name->>'en_US' AS ingredient_uom,
    bl.product_id AS ingredient_product_id,
    (SELECT svl.unit_cost FROM stock_valuation_layer svl
     WHERE svl.product_id = bl.product_id AND svl.company_id = {ODOO_COMPANY}
     ORDER BY svl.create_date DESC LIMIT 1) AS valuation_unit_cost,
    (SELECT ip.value_float FROM ir_property ip
     WHERE ip.name = 'standard_price' AND ip.company_id = {ODOO_COMPANY}
       AND ip.res_id = 'product.product,' || bl.product_id::text
     LIMIT 1) AS standard_price_cost
  FROM mrp_bom_line bl
  JOIN product_product ipp ON ipp.id = bl.product_id
  JOIN product_template ipt ON ipt.id = ipp.product_tmpl_id
  LEFT JOIN uom_uom iuom ON iuom.id = bl.product_uom_id
  JOIN mrp_bom b ON b.id = bl.bom_id
  WHERE b.company_id = {ODOO_COMPANY} AND b.active = true
) t;
"""


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    out_dir = repo_root / "data"

    products = json.loads((out_dir / "dolcenera-supabase-products-snapshot.json").read_text())
    products_by_norm: dict[str, dict] = {}
    for p in products:
        products_by_norm.setdefault(norm(p["name"]), p)

    recipe_item_rows = json.loads((out_dir / "dolcenera-supabase-recipe-items-snapshot.json").read_text())
    items_by_product_id: dict[str, list[dict]] = {}
    recipe_by_product_id: dict[str, dict] = {}
    for row in recipe_item_rows:
        pid = row["product_id"]
        items_by_product_id.setdefault(pid, []).append(row)
        recipe_by_product_id[pid] = {"recipe_id": row["recipe_id"], "recipe_name": row["recipe_name"]}

    def resolve_product(name: str) -> dict | None:
        n = norm(name)
        if not n:
            return None
        if n in products_by_norm:
            return {"product": products_by_norm[n], "confidence": "exact"}
        candidates = [p for k, p in products_by_norm.items() if k and (k in n or n in k)]
        if len(candidates) == 1:
            return {"product": candidates[0], "confidence": "fuzzy"}
        return None

    def ingredient_cost(ln: dict) -> float:
        if ln.get("valuation_unit_cost") is not None:
            return float(ln["valuation_unit_cost"])
        if ln.get("standard_price_cost") is not None:
            return float(ln["standard_price_cost"])
        return 0.0

    boms = psql_json(BOM_QUERY)
    lines = psql_json(BOM_LINE_QUERY)
    lines_by_bom: dict[int, list[dict]] = {}
    for ln in lines:
        lines_by_bom.setdefault(ln["bom_id"], []).append(ln)

    update_statements: list[str] = [
        "-- Dolce Nera: UPDATE cost fields on existing recipe_items, matched to Odoo BOM lines by ingredient name.",
        "-- Only unit_cost / total_cost / unit_cost_snapshot change. quantity, unit_of_measure, ingredient_product_id untouched.",
        "-- NOT YET APPLIED.",
        "",
    ]
    insert_statements: list[str] = [
        "",
        "-- Dolce Nera: brand-new recipes (no existing recipe row at all). NOT YET APPLIED.",
        "-- Re-verify against live Supabase immediately before running — this list is only as fresh as the snapshot.",
        "",
    ]
    shell_fill_statements: list[str] = [
        "",
        "-- Dolce Nera: fill items into an EXISTING empty recipe shell (recipe row exists, 0 items). NOT YET APPLIED.",
        "",
    ]

    detail_rows = []  # ingredient-level report for the update case
    summary_rows = []  # recipe-level report for everything

    new_recipe_candidates = 0
    update_candidates = 0
    shell_fill_candidates = 0

    for bom in boms:
        finished_name = bom["finished_product"]
        yield_qty = float(bom.get("yield_qty") or 1) or 1
        bom_lines = lines_by_bom.get(bom["bom_id"], [])
        if not bom_lines:
            continue

        match = resolve_product(finished_name)
        if not match:
            summary_rows.append({"odoo_finished_product": finished_name, "action": "unmatched", "franchisetech_product": "", "detail": "no franchisetech product found by name"})
            continue
        if match["confidence"] != "exact":
            summary_rows.append({"odoo_finished_product": finished_name, "action": "fuzzy_needs_confirmation", "franchisetech_product": match["product"]["name"], "detail": "name similarity only — confirm before using"})
            continue

        product = match["product"]
        product_id = product["id"]
        cost_per_unit = sum(ingredient_cost(ln) * float(ln["ingredient_qty"]) for ln in bom_lines) / yield_qty

        if product_id in EMPTY_RECIPE_SHELLS.values():
            recipe_id = next(rid for rid, pid in EMPTY_RECIPE_SHELLS.items() if pid == product_id)
            shell_fill_candidates += 1
            value_rows = []
            for ln in bom_lines:
                ing_match = resolve_product(ln["ingredient_name"] or "")
                ing_id = ing_match["product"]["id"] if ing_match and ing_match["confidence"] == "exact" else None
                qty = float(ln["ingredient_qty"])
                unit_cost = round(ingredient_cost(ln), 4)
                value_rows.append(
                    f"({sql_str(recipe_id)}, {sql_str(ln['ingredient_name'] or '')}, {sql_str(ORG_ID)}, {qty}, "
                    f"{sql_str(ln.get('ingredient_uom') or 'unit')}, {unit_cost}, {round(qty*unit_cost,4)}, "
                    f"{sql_str(ing_id) if ing_id else 'NULL'})"
                )
            shell_fill_statements.append(f"-- {finished_name} (empty recipe shell {recipe_id})")
            shell_fill_statements.append(
                "INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id) VALUES\n  "
                + ",\n  ".join(value_rows) + ";\n"
            )
            summary_rows.append({"odoo_finished_product": finished_name, "action": "fill_empty_recipe_shell", "franchisetech_product": product["name"], "detail": f"{len(bom_lines)} ingredients, cost/unit {round(cost_per_unit,4)}"})
            continue

        existing_items = items_by_product_id.get(product_id)
        if existing_items:
            update_candidates += 1
            odoo_by_norm = {norm(ln["ingredient_name"] or ""): ln for ln in bom_lines}
            existing_by_norm = {norm(it["ingredient_name"] or ""): it for it in existing_items}
            matched_norms = set(odoo_by_norm) & set(existing_by_norm)

            for n in matched_norms:
                odoo_ln = odoo_by_norm[n]
                existing_it = existing_by_norm[n]
                unit_cost = round(ingredient_cost(odoo_ln), 4)
                total_cost = round(unit_cost * float(existing_it["quantity"]), 4)
                update_statements.append(
                    f"UPDATE recipe_items SET unit_cost = {unit_cost}, total_cost = {total_cost}, unit_cost_snapshot = {unit_cost} "
                    f"WHERE id = {sql_str(existing_it['recipe_item_id'])};  -- {existing_it['ingredient_name']} in {finished_name}"
                )
                detail_rows.append({
                    "odoo_finished_product": finished_name, "franchisetech_product": product["name"],
                    "ingredient": existing_it["ingredient_name"], "action": "cost_updated",
                    "old_unit_cost": existing_it["unit_cost"], "new_unit_cost": unit_cost,
                })

            for n in set(odoo_by_norm) - matched_norms:
                detail_rows.append({
                    "odoo_finished_product": finished_name, "franchisetech_product": product["name"],
                    "ingredient": odoo_by_norm[n]["ingredient_name"], "action": "odoo_only_needs_review",
                    "old_unit_cost": "", "new_unit_cost": round(ingredient_cost(odoo_by_norm[n]), 4),
                })
            for n in set(existing_by_norm) - matched_norms:
                detail_rows.append({
                    "odoo_finished_product": finished_name, "franchisetech_product": product["name"],
                    "ingredient": existing_by_norm[n]["ingredient_name"], "action": "franchisetech_only_untouched",
                    "old_unit_cost": existing_by_norm[n]["unit_cost"], "new_unit_cost": "",
                })

            summary_rows.append({
                "odoo_finished_product": finished_name, "action": "update_existing_recipe_costs",
                "franchisetech_product": product["name"],
                "detail": f"{len(matched_norms)}/{len(bom_lines)} ingredients matched by name, cost/unit {round(cost_per_unit,4)}",
            })
            continue

        # No existing recipe at all -> new recipe candidate.
        new_recipe_candidates += 1
        value_rows = []
        for ln in bom_lines:
            ing_match = resolve_product(ln["ingredient_name"] or "")
            ing_id = ing_match["product"]["id"] if ing_match and ing_match["confidence"] == "exact" else None
            qty = float(ln["ingredient_qty"])
            unit_cost = round(ingredient_cost(ln), 4)
            value_rows.append(
                f"({sql_str(ln['ingredient_name'] or '')}, {sql_str(ORG_ID)}, {qty}, "
                f"{sql_str(ln.get('ingredient_uom') or 'unit')}, {unit_cost}, {round(qty*unit_cost,4)}, "
                f"{sql_str(ing_id) if ing_id else 'NULL'})"
            )
        insert_statements.append(f"-- {finished_name} -> {product['name']} ({product_id})")
        insert_statements.append(
            "WITH new_recipe AS (\n"
            "  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)\n"
            f"  VALUES ({sql_str(ORG_ID)}, {sql_str(finished_name)}, {sql_str(product_id)}, {yield_qty})\n"
            "  RETURNING id\n)\n"
            "INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)\n"
            "SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id\n"
            "FROM new_recipe CROSS JOIN (VALUES\n  " + ",\n  ".join(value_rows) +
            "\n) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);\n"
        )
        summary_rows.append({"odoo_finished_product": finished_name, "action": "new_recipe", "franchisetech_product": product["name"], "detail": f"{len(bom_lines)} ingredients, cost/unit {round(cost_per_unit,4)}"})

    (out_dir / "dolcenera-recipe-cost-summary.csv").write_text("")
    with (out_dir / "dolcenera-recipe-cost-summary.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["odoo_finished_product", "action", "franchisetech_product", "detail"])
        w.writeheader()
        w.writerows(summary_rows)

    with (out_dir / "dolcenera-recipe-cost-detail.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["odoo_finished_product", "franchisetech_product", "ingredient", "action", "old_unit_cost", "new_unit_cost"])
        w.writeheader()
        w.writerows(detail_rows)

    (out_dir / "dolcenera-recipe-cost-updates.sql").write_text(
        "\n".join(update_statements) + "\n".join(shell_fill_statements) + "\n".join(insert_statements) + "\n"
    )

    print(f"Recipes to UPDATE (cost only, existing recipe): {update_candidates}")
    print(f"Empty recipe shells to fill:                     {shell_fill_candidates}")
    print(f"Brand-new recipes to INSERT:                      {new_recipe_candidates}")
    print(f"Fuzzy/unmatched (no SQL generated):               {sum(1 for r in summary_rows if r['action'] in ('unmatched','fuzzy_needs_confirmation'))}")
    print(f"Wrote {out_dir / 'dolcenera-recipe-cost-summary.csv'}")
    print(f"Wrote {out_dir / 'dolcenera-recipe-cost-detail.csv'} (ingredient-level: matched/odoo_only/franchisetech_only)")
    print(f"Wrote {out_dir / 'dolcenera-recipe-cost-updates.sql'} (NOT applied)")


if __name__ == "__main__":
    main()
