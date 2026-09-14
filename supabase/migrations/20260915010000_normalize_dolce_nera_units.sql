-- Normalize Dolce Nera's unit_of_measure spellings into the six canonical
-- English codes already defined in lib/units-of-measure.ts (DEFAULT_OPERATIONAL_UNITS).
-- Storage stays English; Romanian display is unchanged, handled entirely by
-- unitLabel() at render time. This migration does not touch that mapping.
--
-- Scoped to Dolce Nera only (org b01ce0e0-d01c-4042-0000-000000000042) — the
-- only organisation with real product data; nothing else on the platform is
-- affected.
--
-- Before (9 spellings, 238 products):
--   each=188, kg=21, litre=12, g=5, Buc=5, portion=2, L=2, Units=2, pack=1
-- After (6 canonical units, 238 products):
--   each=195, kg=21, litre=14, g=5, portion=2, pack=1
--
-- "Buc" and "Units" both meant "each" — collapsed into the existing "each" code.
-- "L" meant "litre" — collapsed into the existing "litre" code.
-- kg, g, portion, pack were already correctly spelled and are untouched.
--
-- recipe_items and stock_movements reference products by id, not by copying
-- unit_of_measure, so neither needs a corresponding update — verify this
-- assumption holds (row counts unchanged, recipe costs unchanged) when this
-- migration is actually run.

update public.products
set unit_of_measure = 'each'
where organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
  and unit_of_measure in ('Buc', 'Units');

update public.products
set unit_of_measure = 'litre'
where organisation_id = 'b01ce0e0-d01c-4042-0000-000000000042'
  and unit_of_measure = 'L';
