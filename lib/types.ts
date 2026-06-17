export interface Organisation {
  id: string
  name: string
  business_type: string | null
  country: string
  country_code: string | null
  created_at: string
  // FiscalNet (Romania-only) — null/false for all non-RO orgs
  fiscalnet_enabled?: boolean | null
  fiscalnet_mock_mode?: boolean | null
  fiscalnet_bonuri_path?: string | null
  fiscalnet_raspuns_path?: string | null
  fiscalnet_auto_print?: boolean | null
  fiscalnet_ask_before_print?: boolean | null
  fiscalnet_manual_only?: boolean | null
  fiscalnet_timeout_ms?: number | null
  fiscalnet_retry_count?: number | null
  fiscalnet_cif?: string | null
  fiscalnet_operator_code?: string | null
}

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

export interface OrgMember {
  id: string
  organisation_id: string
  user_id: string
  role: 'owner' | 'manager' | 'staff' | 'auditor'
  created_at: string
  profiles?: Profile
}

export interface Site {
  id: string
  organisation_id: string
  name: string
  address: string | null
  city: string | null
  eircode: string | null
  created_at: string
}

export interface Asset {
  id: string
  organisation_id: string
  site_id: string
  name: string
  asset_type: 'fridge' | 'freezer' | 'cold_room' | 'chill_display' | 'hot_hold' | 'probe' | 'other'
  location: string | null
  qr_code: string | null
  min_temp: number | null
  max_temp: number | null
  active: boolean
  created_at: string
  sites?: Site
}

export interface CheckTemplate {
  id: string
  organisation_id: string
  name: string
  check_type: 'refrigeration' | 'delivery' | 'cooking' | 'cooling' | 'reheating' | 'hot_hold' | 'cleaning' | 'hygiene' | 'calibration'
  description: string | null
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'monthly' | 'ad_hoc'
  active: boolean
  created_at: string
}

export interface ScheduledCheck {
  id: string
  organisation_id: string
  site_id: string | null
  asset_id: string | null
  template_id: string | null
  due_at: string
  completed_at: string | null
  completed_by: string | null
  status: 'pending' | 'completed' | 'missed' | 'failed' | 'verified'
  notes: string | null
  created_at: string
  assets?: Asset
  sites?: Site
  profiles?: Profile
}

export interface TemperatureReading {
  id: string
  organisation_id: string
  site_id: string | null
  asset_id: string | null
  scheduled_check_id: string | null
  value_c: number
  source: 'manual' | 'probe' | 'bluetooth' | 'wifi_sensor' | 'simulated_sensor'
  taken_by: string | null
  taken_at: string
  status: 'pass' | 'warning' | 'fail'
  notes: string | null
  photo_url: string | null
  created_at: string
  assets?: Asset
  sites?: Site
  profiles?: Profile
  corrective_actions?: CorrectiveAction[]
}

export interface CorrectiveAction {
  id: string
  organisation_id: string
  site_id: string | null
  asset_id: string | null
  reading_id: string | null
  action_type: 'rechecked' | 'moved_stock' | 'adjusted_unit' | 'called_maintenance' | 'discarded_food' | 'escalated_to_manager' | 'other'
  description: string
  completed_by: string | null
  completed_at: string
  follow_up_required: boolean
  follow_up_at: string | null
  created_at: string
  assets?: Asset
  sites?: Site
  profiles?: Profile
  temperature_readings?: TemperatureReading
}

export interface VerificationReview {
  id: string
  organisation_id: string
  site_id: string | null
  period_start: string | null
  period_end: string | null
  reviewed_by: string | null
  reviewed_at: string
  status: 'approved' | 'needs_action'
  notes: string | null
  profiles?: Profile
  sites?: Site
}

export interface ProbeThermometer {
  id: string
  organisation_id: string
  site_id: string | null
  name: string
  serial_number: string | null
  active: boolean
  created_at: string
  sites?: Site
}

export interface CalibrationRecord {
  id: string
  organisation_id: string
  site_id: string | null
  probe_id: string | null
  method: 'ice_point' | 'boiling_point' | 'comparison' | 'other'
  result: 'pass' | 'fail'
  checked_by: string | null
  checked_at: string
  notes: string | null
  probe_thermometers?: ProbeThermometer
  profiles?: Profile
}

export interface SensorDevice {
  id: string
  organisation_id: string
  site_id: string | null
  asset_id: string | null
  device_name: string | null
  device_type: 'temperature' | 'door' | 'power' | 'humidity' | 'combo'
  provider: string
  external_id: string | null
  status: 'active' | 'inactive' | 'maintenance'
  last_seen_at: string | null
  created_at: string
  assets?: Asset
  sites?: Site
}

export interface SensorReading {
  id: string
  organisation_id: string
  site_id: string | null
  asset_id: string | null
  sensor_device_id: string
  metric: 'temperature_c' | 'door_open' | 'power_status' | 'humidity'
  value: number | null
  bool_value: boolean | null
  recorded_at: string
  status: 'normal' | 'warning' | 'critical'
  created_at: string
  sensor_devices?: SensorDevice
}

export interface DashboardStats {
  checksToday: number
  checksMissed: number
  outOfRange: number
  openCorrectiveActions: number
  assetsAtRisk: number
  pendingVerifications: number
}
