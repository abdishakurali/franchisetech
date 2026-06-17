-- FridgeProof Demo Seed Data
-- Demo Dublin Bistro - Irish HACCP demo scenario
-- Note: Auth users must exist before running this. Run after creating a demo account.
-- This script is idempotent (uses ON CONFLICT DO NOTHING where possible)

-- ============================================================
-- DEMO ORGANISATION
-- ============================================================
insert into organisations (id, name, business_type, country)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Demo Dublin Bistro',
  'Restaurant',
  'Ireland'
) on conflict (id) do update set name = excluded.name;

-- ============================================================
-- DEMO SITES
-- ============================================================
insert into sites (id, organisation_id, name, address, city, eircode)
values
  (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Temple Bar Kitchen',
    '12 Temple Bar Square',
    'Dublin',
    'D02 X285'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Rathmines Prep Kitchen',
    '45 Rathmines Road Lower',
    'Dublin',
    'D06 T973'
  )
on conflict (id) do update set name = excluded.name;

-- ============================================================
-- DEMO ASSETS
-- ============================================================
insert into assets (id, organisation_id, site_id, name, asset_type, location, qr_code, min_temp, max_temp, active)
values
  (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Walk-in Cold Room',
    'cold_room',
    'Back of house, left of service corridor',
    'FP-ASSET-0001',
    0, 5, true
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Fish Fridge',
    'fridge',
    'Prep kitchen - fish station',
    'FP-ASSET-0002',
    0, 5, true
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Dessert Display',
    'chill_display',
    'Front of house - dessert counter',
    'FP-ASSET-0003',
    0, 5, true
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Main Freezer',
    'freezer',
    'Back store, adjacent to cold room',
    'FP-ASSET-0004',
    null, -18, true
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Sauce Hot Hold',
    'hot_hold',
    'Main line - hot hold unit A',
    'FP-ASSET-0005',
    63, null, true
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Rathmines Walk-in Fridge',
    'cold_room',
    'Main prep area',
    'FP-ASSET-0006',
    0, 5, true
  )
on conflict (id) do update set name = excluded.name;

-- ============================================================
-- CHECK TEMPLATES
-- ============================================================
insert into check_templates (id, organisation_id, name, check_type, description, frequency, active)
values
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Morning Fridge Check',
    'refrigeration',
    'Daily morning temperature check for all cold storage units. Complete before food service begins.',
    'daily',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Evening Fridge Check',
    'refrigeration',
    'End of day temperature check. Completed before closing.',
    'daily',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'Freezer Check',
    'refrigeration',
    'Daily freezer temperature verification.',
    'daily',
    true
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'Probe Calibration Check',
    'calibration',
    'Weekly probe thermometer calibration using ice-point method.',
    'weekly',
    true
  )
on conflict (id) do update set name = excluded.name;

-- ============================================================
-- PROBE THERMOMETERS
-- ============================================================
insert into probe_thermometers (id, organisation_id, site_id, name, serial_number, active)
values
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Kitchen Probe A',
    'TP-2024-001',
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Kitchen Probe B (Backup)',
    'TP-2024-002',
    true
  )
on conflict (id) do update set name = excluded.name;

-- ============================================================
-- SENSOR DEVICES (demo/simulated)
-- ============================================================
insert into sensor_devices (id, organisation_id, site_id, asset_id, device_name, device_type, provider, external_id, status, last_seen_at)
values
  (
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Walk-in Cold Room Sensor (Demo)',
    'temperature',
    'manual_future',
    'demo-sensor-001',
    'active',
    now() - interval '4 hours'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000004',
    'Main Freezer Sensor (Demo)',
    'temperature',
    'manual_future',
    'demo-sensor-002',
    'active',
    now() - interval '1 hour'
  )
on conflict (id) do update set device_name = excluded.device_name;

-- ============================================================
-- NOTE: Temperature readings, corrective actions, and calibration records
-- require actual user IDs from auth.users. These are inserted via the
-- seed-demo-data API route or the admin panel after first login.
-- The demo organisation, sites, assets, templates, probes, and sensors
-- above are safe to insert without user IDs.
-- ============================================================
