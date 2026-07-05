-- ============================================================
-- 20260703000000_pos_cash_breakdown.sql
-- P1: RON denomination breakdown for till-close cash counting.
-- Additive only. Does not change counted_cash / cash_difference semantics —
-- cash_breakdown is supplementary detail alongside the existing total.
-- ============================================================

alter table public.pos_sessions
  add column if not exists cash_breakdown jsonb;

alter table public.pos_daily_close
  add column if not exists cash_breakdown jsonb;
