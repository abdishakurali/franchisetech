import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { evaluateTemperature } from '@/lib/temperature'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const authHeader = request.headers.get('authorization')
  const secret = process.env.SENSOR_INGEST_SECRET

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    external_id: string
    metric: string
    value: number
    recorded_at?: string
    bool_value?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.external_id || !body.metric) {
    return NextResponse.json({ error: 'external_id and metric are required' }, { status: 400 })
  }

  // Find sensor device by external_id
  const { data: device, error: deviceError } = await supabase
    .from('sensor_devices')
    .select('*, assets(*)')
    .eq('external_id', body.external_id)
    .single()

  if (deviceError || !device) {
    return NextResponse.json({ error: 'Sensor device not found', external_id: body.external_id }, { status: 404 })
  }

  const recordedAt = body.recorded_at || new Date().toISOString()

  // Determine sensor reading status
  let status: 'normal' | 'warning' | 'critical' = 'normal'
  if (body.metric === 'temperature_c' && body.value !== undefined && device.assets) {
    const tempStatus = evaluateTemperature(
      body.value,
      device.assets.asset_type,
      device.assets.min_temp,
      device.assets.max_temp
    )
    status = tempStatus === 'pass' ? 'normal' : tempStatus === 'warning' ? 'warning' : 'critical'
  }

  // Insert sensor reading
  const { data: sensorReading, error: srError } = await supabase
    .from('sensor_readings')
    .insert({
      organisation_id: device.organisation_id,
      site_id: device.site_id,
      asset_id: device.asset_id,
      sensor_device_id: device.id,
      metric: body.metric,
      value: body.value,
      bool_value: body.bool_value ?? null,
      recorded_at: recordedAt,
      status,
    })
    .select()
    .single()

  if (srError) {
    return NextResponse.json({ error: 'Failed to insert sensor reading', detail: srError.message }, { status: 500 })
  }

  // Update device last_seen_at
  await supabase
    .from('sensor_devices')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', device.id)

  // If temperature metric, also create a temperature_reading
  let tempReading = null
  if (body.metric === 'temperature_c' && body.value !== undefined && device.asset_id) {
    const tempStatus = evaluateTemperature(
      body.value,
      device.assets?.asset_type ?? 'fridge',
      device.assets?.min_temp,
      device.assets?.max_temp
    )

    const { data: tr } = await supabase
      .from('temperature_readings')
      .insert({
        organisation_id: device.organisation_id,
        site_id: device.site_id,
        asset_id: device.asset_id,
        value_c: body.value,
        source: 'simulated_sensor',
        taken_at: recordedAt,
        status: tempStatus,
      })
      .select()
      .single()

    tempReading = tr
  }

  return NextResponse.json({
    success: true,
    sensor_reading_id: sensorReading.id,
    temperature_reading_id: tempReading?.id ?? null,
    status,
  })
}
