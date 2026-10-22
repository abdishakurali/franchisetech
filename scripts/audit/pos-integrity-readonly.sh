#!/bin/bash
# ============================================================
# pos-integrity-readonly.sh — READ-ONLY production integrity snapshot.
#
# 1. Confirms the live post_pos_document is the production body
#    (stock deduction + org lock), not the isolated-E2E redefinition in
#    20260917160000_e2e_post_pos_document.sql.
# 2. Baseline counts of likely duplicate business records, used to measure
#    the duplicate-order fix before/after deploy.
#
# Every statement is a SELECT inside a READ ONLY transaction. Output is
# aggregate counts only (no customer names/emails).
#
# Usage: bash scripts/audit/pos-integrity-readonly.sh
# Requires DIRECT_DB_URL in .env.local and psql (same as check-schema-drift.sh).
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ENV_FILE="$ROOT/.env.local"
DIRECT_DB_URL=$(grep -m1 '^DIRECT_DB_URL=' "$ENV_FILE" | cut -d= -f2-)
if [ -z "$DIRECT_DB_URL" ]; then echo "DIRECT_DB_URL missing in .env.local" >&2; exit 1; fi

psql "$DIRECT_DB_URL" -v ON_ERROR_STOP=1 -P pager=off <<'SQL'
begin transaction read only;

\echo '== 1. Live post_pos_document body =='
select proname,
       position('stock_movements' in prosrc) > 0 as deducts_stock,
       position('for update' in prosrc) > 0      as locks_org,
       position('pos_cash_movements' in prosrc) > 0 as writes_cash,
       position('pos_transaction_payments' in prosrc) > 0 as is_e2e_body
from pg_proc where proname in ('post_pos_document', 'post_nir_purchase', 'post_cash_movement');

\echo '== E2E-only table present? (expected: null) =='
select to_regclass('public.pos_transaction_payments') as e2e_table;

\echo '== Applied 2026-09-17 E2E migrations (expected: none) =='
select version from supabase_migrations.schema_migrations
where version like '202609170925%' or version like '20260917160%' or version like '20260917161%' or version like '20260917163%'
order by 1;

\echo '== 2a. Probable duplicate sales (same session, same total, same items, <=10s apart), last 90 days =='
with tx as (
  select t.id, t.organisation_id, t.session_id, t.total, t.sold_at,
         (select string_agg(i.product_id::text || 'x' || i.quantity::text, ',' order by i.product_id, i.quantity)
            from pos_transaction_items i where i.transaction_id = t.id) as sig
  from pos_transactions t
  where t.status = 'completed' and t.sold_at > now() - interval '90 days'
)
select a.organisation_id, count(*) as probable_duplicate_pairs, min(a.sold_at)::date as first_seen, max(a.sold_at)::date as last_seen
from tx a join tx b
  on a.organisation_id = b.organisation_id and a.session_id is not distinct from b.session_id
 and a.total = b.total and a.sig = b.sig and a.id < b.id
 and b.sold_at between a.sold_at - interval '10 seconds' and a.sold_at + interval '10 seconds'
group by a.organisation_id order by 2 desc;

\echo '== 2b. Probable duplicate manual cash in/out (same session/type/amount/reason, <=30s) =='
select a.organisation_id, count(*) as probable_duplicate_pairs
from pos_cash_movements a join pos_cash_movements b
  on a.organisation_id = b.organisation_id and a.session_id = b.session_id
 and a.movement_type = b.movement_type and a.amount = b.amount and a.reason = b.reason and a.id < b.id
 and b.performed_at between a.performed_at - interval '30 seconds' and a.performed_at + interval '30 seconds'
where a.movement_type in ('cash_in', 'cash_out')
group by a.organisation_id order by 2 desc;

\echo '== 2c. Sessions with more than one pos_daily_close row =='
select organisation_id, count(*) as sessions_with_duplicate_close
from (select organisation_id, session_id from pos_daily_close where session_id is not null
      group by organisation_id, session_id having count(*) > 1) d
group by organisation_id order by 2 desc;

\echo '== 2d. Sale stock rows repeated per (sale, product) — includes legit cases where one ingredient feeds two recipes in a sale =='
select organisation_id, count(*) as duplicated_sale_stock_rows
from (select organisation_id, reference_id, product_id from stock_movements
      where movement_type = 'sale_used' and reference_id is not null
      group by organisation_id, reference_id, product_id having count(*) > 1) d
group by organisation_id order by 2 desc;

\echo '== 2e. Fiscal receipt attempts per transaction > 1 (possible double print) =='
select count(*) as transactions_with_multiple_attempts
from (select transaction_id from fiscal_receipt_attempts group by transaction_id having count(*) > 1) d;

rollback;
SQL
