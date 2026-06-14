/**
 * Dynamic site content (hero banners, badges, etc.).
 *
 * The normalized Matchday schema has no CMS / `site_content` table, so this
 * returns an empty Map. Hero and badge components fall back to their static
 * defaults. Kept as a stable seam in case a content source is added later.
 */

export interface SiteContent {
  slot: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  badgeText?: string;
  accentColor?: string;
}

export async function fetchSiteContent(
  _slots: string[],
): Promise<Map<string, SiteContent>> {
  void _slots;
  return new Map<string, SiteContent>();
}
