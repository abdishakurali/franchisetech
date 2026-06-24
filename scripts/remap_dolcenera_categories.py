#!/usr/bin/env python3
"""Remap Dolce Nera products: split inventory category_id vs pos_category_id from Odoo."""
from __future__ import annotations

import json
import re
import subprocess
import unicodedata
from pathlib import Path

ORG_ID = "b01ce0e0-d01c-4042-0000-000000000042"
ODOO_COMPANY = 42

INVENTORY_IDS = {
    "MATERIA PRIMA": "eb0cb7ba-cd44-4d08-8970-94c930ebca21",
    "MARFURi": "7e7932c2-4a74-4afd-bedf-e438da6258e5",
    "MARFURI": "7e7932c2-4a74-4afd-bedf-e438da6258e5",
    "PRODUSE FINITE": "348a5cbd-9522-4463-b31b-3f7695e16c73",
}

# Odoo POS name -> Supabase category name hints
POS_ALIASES = {
    "houseblendcoffees": "A - HOUSE BLEND COFFEES",
    "brezzadibariso": "BREZZA DI BARI S.O.",
    "dekofcuoredicolumbiaso": "DEKOF - CUORE DI COLUMBIA",
    "nicaraguashgepso": "NICARAGUA SHG EP",
    "columbialaorquideaplanadasso": "COLUMBIA - LA ORQUIDEA PLANADAS",
    "perumonteverderumiyacuamazonasorganicso": "PERU - MONTEVERDE RUMIYACU AMAZONAS Organic",
    "premium10blend": "PREMIUM 10 BLEND",
    "specialitycoffee": "SPECIALITY COFFEE",
    "noncoffee": "NON COFFEE",
    "ceai": "CEAI",
    "icedcoffee": "ICED COFFEE",
    "limonada": "LIMONADA & FRESH",
    "limonadafresh": "LIMONADA & FRESH",
    "racoritoare": "RACORITOARE",
    "shop": "SHOP",
    "patiserie": "PATISERIE",
    "extra": "Extra",
    "bauturiceai": "BAUTURI CEA",
    "hotbeverag": "HOT BEVERAG",
    "bauturiracoritoare": "BAUTURI RACORITOARE",
    "drinks": "DRINKS",
    "sovegetalcoffee": "S.O. VEGETAL COFFEE",
    "hbvegetalcoffee": "H.B. VEGETAL COFFEE",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def odoo_name(val) -> str:
    if isinstance(val, dict):
        return val.get("ro_RO") or val.get("en_US") or next(iter(val.values()), "")
    if isinstance(val, str) and val.startswith("{"):
        try:
            return odoo_name(json.loads(val.replace("'", '"')))
        except json.JSONDecodeError:
            pass
    return str(val or "").strip()


def psql_json(query: str) -> list[dict]:
    raw = subprocess.check_output(
        ["psql", "-d", "dolcenera_20260615", "-t", "-A", "-c", query],
        text=True,
    ).strip()
    if not raw:
        return []
    return json.loads(raw)


def main() -> None:
    out_dir = Path(__file__).resolve().parents[1] / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    odoo_rows = psql_json(
        """
        SELECT json_agg(row_to_json(t)) FROM (
          SELECT
            COALESCE(NULLIF(pt.name->>'ro_RO',''), pt.name->>'en_US', pt.name::text) AS name,
            pc.name AS inventory_category,
            (
              SELECT COALESCE(NULLIF(pos.name->>'en_US',''), pos.name::text)
              FROM pos_category_product_template_rel rel
              JOIN pos_category pos ON pos.id = rel.pos_category_id
              WHERE rel.product_template_id = pt.id
              ORDER BY pos.sequence
              LIMIT 1
            ) AS pos_category
          FROM product_template pt
          JOIN product_category pc ON pc.id = pt.categ_id
          WHERE pt.company_id = 42
        ) t;
        """
    )

    supa_cats_raw = Path(out_dir / "dolcenera-supabase-categories-snapshot.json")
    # categories embedded in prior snapshot or we hardcode from known IDs
    categories = [
        {"id": "3505a9e9-2f93-4708-a4ac-dc8d167726b0", "name": "A - HOUSE BLEND COFFEES"},
        {"id": "5beea7d2-2ee1-4491-8021-e3261f864516", "name": "BREZZA DI BARI S.O."},
        {"id": "be42ab7b-7c14-4db2-95e3-59793c24b93f", "name": "CEAI"},
        {"id": "388ef06d-ca91-4781-8d38-a26764c67d7e", "name": "COLUMBIA - LA ORQUIDEA PLANADAS"},
        {"id": "f8df03fd-8ad2-4ddc-bc60-1c5ac0193656", "name": "DEKOF - CUORE DI COLUMBIA"},
        {"id": "bd4b9d87-89f2-4a07-8795-5b82003c8b54", "name": "house blend coffees"},
        {"id": "84de5b21-7dab-458b-aad7-fb13525e1f7c", "name": "house blend coffees"},
        {"id": "69df12b5-3f22-4517-963c-1a8d20b2c0bf", "name": "ICED COFFEE"},
        {"id": "a9cc3068-ebdc-415b-a69b-07481decaeda", "name": "LIMONADA & FRESH"},
        {"id": "d12b41c4-b341-4205-ae6c-fbe7b53dc42e", "name": "NICARAGUA SHG EP"},
        {"id": "5faa0121-88e5-45cf-8851-e1bb255b7e9d", "name": "NON COFFEE"},
        {"id": "5ca60676-5ad6-4842-87ee-4d83e67dee7d", "name": "PERU - MONTEVERDE RUMIYACU AMAZONAS Organic"},
        {"id": "9c9d5ed0-e7c6-4118-be7a-4b29a622ce40", "name": "PREMIUM 10 BLEND"},
        {"id": "e29d65a4-fe77-47d8-a9bb-3c001725f3e4", "name": "RACORITOARE"},
        {"id": "5cde9c02-4661-4a39-b479-6e83294b0f98", "name": "SHOP"},
        {"id": "01be02b5-5c21-4f5f-8c7d-21142abe009a", "name": "SPECIALITY COFFEE"},
        {"id": "eb0cb7ba-cd44-4d08-8970-94c930ebca21", "name": "X - MATERIA PRIMA"},
        {"id": "7e7932c2-4a74-4afd-bedf-e438da6258e5", "name": "X - MARFURI"},
        {"id": "348a5cbd-9522-4463-b31b-3f7695e16c73", "name": "X - PRODUSE FINITE"},
    ]

    pos_by_norm = {norm(c["name"]): c["id"] for c in categories}
    for alias_norm, target_name in POS_ALIASES.items():
        tid = pos_by_norm.get(norm(target_name))
        if tid:
            pos_by_norm[alias_norm] = tid

    def resolve_pos_id(odoo_pos: str | None) -> str | None:
        if not odoo_pos:
            return None
        n = norm(odoo_pos)
        if n in pos_by_norm:
            return pos_by_norm[n]
        for k, cid in pos_by_norm.items():
            if k in n or n in k:
                return cid
        return None

    def resolve_inv_id(odoo_inv: str) -> str:
        key = odoo_inv.strip().upper()
        if key in INVENTORY_IDS:
            return INVENTORY_IDS[key]
        if key == "MARFURI":
            return INVENTORY_IDS["MARFURi"]
        return INVENTORY_IDS["PRODUSE FINITE"]

    statements: list[str] = [
        "-- Category cleanup",
        f"UPDATE product_categories SET name = 'MATERIA PRIMA', category_type = 'inventory' WHERE id = '{INVENTORY_IDS['MATERIA PRIMA']}' AND organisation_id = '{ORG_ID}';",
        f"UPDATE product_categories SET name = 'MARFURi', category_type = 'inventory' WHERE id = '{INVENTORY_IDS['MARFURi']}' AND organisation_id = '{ORG_ID}';",
        f"UPDATE product_categories SET name = 'PRODUSE FINITE', category_type = 'inventory' WHERE id = '{INVENTORY_IDS['PRODUSE FINITE']}' AND organisation_id = '{ORG_ID}';",
        f"UPDATE product_categories SET category_type = 'pos' WHERE organisation_id = '{ORG_ID}' AND id NOT IN ('{INVENTORY_IDS['MATERIA PRIMA']}', '{INVENTORY_IDS['MARFURi']}', '{INVENTORY_IDS['PRODUSE FINITE']}');",
        "-- Merge duplicate house blend into canonical",
        f"UPDATE products SET pos_category_id = '{pos_by_norm.get(norm('A - HOUSE BLEND COFFEES'), '3505a9e9-2f93-4708-a4ac-dc8d167726b0')}' WHERE organisation_id = '{ORG_ID}' AND category_id IN ('bd4b9d87-89f2-4a07-8795-5b82003c8b54', '84de5b21-7dab-458b-aad7-fb13525e1f7c');",
        f"UPDATE products SET category_id = NULL WHERE organisation_id = '{ORG_ID}' AND category_id IN ('bd4b9d87-89f2-4a07-8795-5b82003c8b54', '84de5b21-7dab-458b-aad7-fb13525e1f7c');",
        f"DELETE FROM product_categories WHERE id IN ('bd4b9d87-89f2-4a07-8795-5b82003c8b54', '84de5b21-7dab-458b-aad7-fb13525e1f7c') AND organisation_id = '{ORG_ID}';",
        f"UPDATE product_categories SET name = 'HOUSE BLEND COFFEES', sort_order = 0 WHERE id = '3505a9e9-2f93-4708-a4ac-dc8d167726b0' AND organisation_id = '{ORG_ID}';",
        "-- Move misplaced POS assignments off category_id before Odoo remap",
        f"""UPDATE products p
SET pos_category_id = p.category_id, category_id = NULL
FROM product_categories pc
WHERE p.organisation_id = '{ORG_ID}'
  AND p.category_id = pc.id
  AND pc.category_type = 'pos';""",
    ]

    odoo_by_name = {norm(odoo_name(r["name"])): r for r in odoo_rows}

    # Load supabase product names via psql not available - use SQL file with name matching from odoo export
    mapping_report = []
    for row in odoo_rows:
        name = odoo_name(row["name"])
        n = norm(name)
        inv_id = resolve_inv_id(row["inventory_category"])
        pos_id = resolve_pos_id(row.get("pos_category"))
        pos_sql = f"'{pos_id}'" if pos_id else "NULL"
        mapping_report.append({
            "name": name,
            "inventory": row["inventory_category"],
            "pos": row.get("pos_category"),
            "inv_id": inv_id,
            "pos_id": pos_id,
        })
        statements.append(
            f"UPDATE products SET category_id = '{inv_id}', pos_category_id = {pos_sql} "
            f"WHERE organisation_id = '{ORG_ID}' AND lower(trim(name)) = lower(trim('{name.replace(chr(39), chr(39)+chr(39))}'));"
        )

    sql_path = out_dir / "dolcenera-category-remap.sql"
    sql_path.write_text("\n".join(statements) + "\n")
    (out_dir / "dolcenera-category-remap-report.json").write_text(json.dumps(mapping_report, indent=2, ensure_ascii=False))
    print(f"Wrote {sql_path} ({len(statements)} statements, {len(odoo_rows)} products)")


if __name__ == "__main__":
    main()
