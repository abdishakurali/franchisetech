import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { evaluateTemperature } from "@/lib/temperature";

export async function POST() {
  if (process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS !== "true") {
    return NextResponse.json({ error: "Demo tools are not enabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("organisation_members")
    .select("organisation_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return NextResponse.json({ error: "No organisation found" }, { status: 400 });

  const orgId = membership.organisation_id;
  const { count } = await supabase
    .from("temperature_readings")
    .select("*", { count: "exact", head: true })
    .eq("organisation_id", orgId)
    .ilike("notes", "Demo kitchen data%");

  if ((count ?? 0) >= 5) return NextResponse.json({ success: true, message: "Demo data already loaded" });

  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("organisation_id", orgId)
    .eq("name", "Main Kitchen")
    .limit(1)
    .maybeSingle();

  const siteId = existingSite?.id ?? (await supabase
    .from("sites")
    .insert({ organisation_id: orgId, name: "Main Kitchen", city: "Dublin" })
    .select("id")
    .single()).data?.id;

  if (!siteId) return NextResponse.json({ error: "Could not create demo site" }, { status: 500 });

  const demoAssets = [
    { name: "Walk-in Cold Room", asset_type: "cold_room", min_temp: 0, max_temp: 5 },
    { name: "Fish Fridge", asset_type: "fridge", min_temp: 0, max_temp: 5 },
    { name: "Main Freezer", asset_type: "freezer", min_temp: null, max_temp: -18 },
    { name: "Hot Hold Station", asset_type: "hot_hold", min_temp: 63, max_temp: null },
  ];

  const assets = [];
  for (const asset of demoAssets) {
    const { data: existing } = await supabase
      .from("assets")
      .select("id,name,asset_type,min_temp,max_temp")
      .eq("organisation_id", orgId)
      .eq("name", asset.name)
      .limit(1)
      .maybeSingle();

    if (existing) {
      assets.push(existing);
    } else {
      const { data: created, error } = await supabase
        .from("assets")
        .insert({
          organisation_id: orgId,
          site_id: siteId,
          name: asset.name,
          asset_type: asset.asset_type,
          min_temp: asset.min_temp,
          max_temp: asset.max_temp,
          active: true,
        })
        .select("id,name,asset_type,min_temp,max_temp")
        .single();
      if (error) return NextResponse.json({ error: "Could not create demo asset", detail: error.message }, { status: 500 });
      assets.push(created);
    }
  }

  const now = new Date();
  const byName = new Map(assets.map((a) => [a.name, a]));
  const readingInputs = [
    { asset: byName.get("Walk-in Cold Room"), value_c: 4.0 },
    { asset: byName.get("Fish Fridge"), value_c: 6.2 },
    { asset: byName.get("Walk-in Cold Room"), value_c: 20.0 },
    { asset: byName.get("Main Freezer"), value_c: -20.0 },
    { asset: byName.get("Main Freezer"), value_c: -14.0 },
  ].filter((r) => r.asset);

  const { data: readings, error: readingError } = await supabase
    .from("temperature_readings")
    .insert(readingInputs.map((r, index) => ({
      organisation_id: orgId,
      site_id: siteId,
      asset_id: r.asset!.id,
      value_c: r.value_c,
      source: "manual",
      taken_by: user.id,
      taken_at: new Date(now.getTime() - (readingInputs.length - index) * 45 * 60 * 1000).toISOString(),
      status: evaluateTemperature(r.value_c, r.asset!.asset_type, r.asset!.min_temp, r.asset!.max_temp),
      notes: "Demo kitchen data",
    })))
    .select("id,value_c,status,asset_id");

  if (readingError) return NextResponse.json({ error: "Could not create demo readings", detail: readingError.message }, { status: 500 });

  const failed = readings?.find((r) => r.value_c === 20.0);
  if (failed) {
    await supabase.from("corrective_actions").insert({
      organisation_id: orgId,
      site_id: siteId,
      asset_id: failed.asset_id,
      reading_id: failed.id,
      action_type: "moved_stock",
      description: "Moved stock to backup fridge, called maintenance, and scheduled recheck.",
      completed_by: user.id,
      follow_up_required: true,
    });
  }

  const freezerFailed = readings?.find((r) => r.value_c === -14.0);
  if (freezerFailed) {
    await supabase.from("corrective_actions").insert({
      organisation_id: orgId,
      site_id: siteId,
      asset_id: freezerFailed.asset_id,
      reading_id: freezerFailed.id,
      action_type: "called_maintenance",
      description: "Moved affected frozen stock to backup freezer and called maintenance.",
      completed_by: user.id,
      follow_up_required: true,
    });
  }

  await supabase.from("delivery_records").insert({
    organisation_id: orgId,
    site_id: siteId,
    supplier_name: "Dublin Fresh Foods",
    product_name: "Chicken Fillets",
    batch_lot: "BATCH-2481",
    use_by_date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    storage_type: "chilled",
    quantity: "5 kg",
    status: "accepted",
    notes: "Demo kitchen data",
    created_by: user.id,
  });

  await supabase.from("cleaning_checks").insert({
    organisation_id: orgId,
    site_id: siteId,
    checklist_name: "Daily close-down cleaning",
    items: [
      "Food contact surfaces cleaned",
      "Fridge handles cleaned",
      "Floors cleaned",
      "Bins emptied",
      "Sanitiser available",
      "Handwash station stocked",
    ].map((label) => ({ label, completed: true })),
    status: "completed",
    completed_by: user.id,
    notes: "Demo kitchen data",
  });

  await supabase.from("food_process_checks").insert([
    {
      organisation_id: orgId,
      site_id: siteId,
      check_type: "cooking",
      food_item: "Chicken curry",
      temperature_c: 74,
      status: "pass",
      checked_by: user.id,
      notes: "Demo kitchen data",
    },
    {
      organisation_id: orgId,
      site_id: siteId,
      check_type: "hot_hold",
      food_item: "Soup station",
      temperature_c: 58,
      status: "fail",
      action_taken: "Removed from service and reheated.",
      checked_by: user.id,
      notes: "Demo kitchen data",
    },
  ]);

  return NextResponse.json({ success: true, message: "Demo kitchen data loaded" });
}
