/**
 * SQL snippets for founder daily/weekly briefs (Supabase MCP execute_sql).
 * North star: activated_trials_per_week — till → first sale → Z-report within 7 days.
 */

/** Trials needing founder action (activation SLA). */
export const STUCK_TRIALS_SQL = `
SELECT
  o.name AS org_name,
  o.country_code,
  p.email AS owner_email,
  o.created_at AS signup_at,
  o.trial_ends_at,
  o.growth_till_opened_at,
  o.growth_first_sale_at,
  o.growth_first_report_at,
  o.growth_activated_at,
  CASE
    WHEN o.growth_first_sale_at IS NULL
      AND o.created_at < now() - interval '24 hours'
      THEN 'call_within_24h_no_sale'
    WHEN o.growth_first_sale_at IS NULL
      AND o.created_at < now() - interval '48 hours'
      THEN 'urgent_guide_first_sale'
    WHEN o.growth_first_sale_at IS NOT NULL
      AND o.growth_first_report_at IS NULL
      AND o.created_at < now() - interval '7 days'
      THEN 'nudge_z_report'
    WHEN o.trial_ends_at IS NOT NULL
      AND o.trial_ends_at < now() + interval '3 days'
      AND o.growth_activated_at IS NULL
      THEN 'trial_ending_offer_setup'
    ELSE NULL
  END AS sla_action
FROM organisations o
JOIN organisation_members om
  ON om.organisation_id = o.id AND om.role = 'owner'
JOIN profiles p ON p.id = om.user_id
WHERE o.trial_ends_at IS NULL OR o.trial_ends_at > now() - interval '7 days'
ORDER BY o.created_at DESC
LIMIT 30;
`;

/** Weekly funnel rollup (past 7 days). */
export const WEEKLY_FUNNEL_SQL = `
SELECT
  count(*) AS trial_signups,
  count(*) FILTER (WHERE growth_till_opened_at IS NOT NULL) AS till_opened,
  count(*) FILTER (WHERE growth_first_sale_at IS NOT NULL) AS first_sale,
  count(*) FILTER (WHERE growth_first_report_at IS NOT NULL) AS z_report,
  count(*) FILTER (WHERE growth_activated_at IS NOT NULL) AS activated
FROM organisations
WHERE created_at >= now() - interval '7 days';
`;

/** Outreach send stats this week. */
export const WEEKLY_OUTREACH_SQL = `
SELECT type, status, count(*)::int AS n
FROM outreach_log
WHERE campaign = 'v2-franchisetech'
  AND sent_at >= now() - interval '7 days'
GROUP BY type, status
ORDER BY type, status;
`;
