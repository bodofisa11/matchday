/**
 * Browser-safe fetching for dynamic site content (hero banners, badges, etc.).
 *
 * Queries the `site_content` table from Supabase by slot names.
 * Returns a Map for O(1) lookups in components.
 */
import { createSupabaseClient } from "@/app/lib/supabase-client";
import { getStorageUrl } from "@/app/lib/v1/image-utils";

export interface SiteContent {
  slot: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  badgeText?: string;
  accentColor?: string;
}

/**
 * Fetch active site_content rows for the given slot names.
 *
 * Example:
 *   const content = await fetchSiteContent(["pl-hero-banner", "f1-hero-banner"]);
 *   const plHero = content.get("pl-hero-banner");
 */
export async function fetchSiteContent(
  slots: string[]
): Promise<Map<string, SiteContent>> {
  const map = new Map<string, SiteContent>();
  if (slots.length === 0) return map;

  const supabase = createSupabaseClient();
  if (!supabase) return map;

  const { data } = await supabase
    .from("site_content")
    .select("*")
    .in("slot", slots)
    .eq("is_active", true);

  if (data) {
    for (const row of data) {
      map.set(row.slot, {
        slot: row.slot,
        title: row.title ?? undefined,
        subtitle: row.subtitle ?? undefined,
        imageUrl: row.image_path
          ? getStorageUrl(row.image_path) ?? undefined
          : undefined,
        badgeText: row.badge_text ?? undefined,
        accentColor: row.accent_color ?? undefined,
      });
    }
  }

  return map;
}
