CREATE TABLE IF NOT EXISTS team_audit_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organisation_id uuid NOT NULL,
  actor_user_id uuid NOT NULL,
  target_user_id uuid,
  action text NOT NULL,
  old_role text,
  new_role text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS team_audit_org_idx ON team_audit_events(organisation_id, created_at DESC);
ALTER TABLE team_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_owners_can_read_team_audit" ON team_audit_events
  FOR SELECT USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid() AND role IN ('owner','manager')
    )
  );
