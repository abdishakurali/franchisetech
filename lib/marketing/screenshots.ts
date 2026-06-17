import { createClient } from "@/lib/supabase/server";

export type MarketingScreenshot = {
  id: string;
  storage_key: string;
  section: string;
  title: string;
  alt_text: string;
  description: string;
  display_order: number;
  image_url: string;
};

/**
 * Fetch marketing screenshot metadata from the backend.
 * image_url is the authoritative URL — starts as a local /public path and
 * is updated to a Supabase Storage URL after the bootstrap-upload runs.
 */
export async function getMarketingScreenshots(
  section?: string
): Promise<MarketingScreenshot[]> {
  const supabase = await createClient();

  let query = supabase
    .from("marketing_screenshots")
    .select("id, storage_key, section, title, alt_text, description, display_order, image_url")
    .eq("is_active", true)
    .order("display_order");

  if (section) {
    query = query.eq("section", section);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data as MarketingScreenshot[];
}
