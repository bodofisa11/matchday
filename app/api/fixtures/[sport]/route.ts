// Local dev only — production queries Supabase directly from the browser.
// `generateStaticParams` + `force-static` lets the static export build succeed:
// Next.js pre-renders all 3 sport variants as static JSON files (empty, since
// DATABASE_URL isn't set in CI). The production app never calls these routes.
export const dynamic = "force-static";

import { fetchFixtures, type SportId } from "@/app/lib/v1/fetch-fixtures";

const VALID_SPORTS: SportId[] = ["all", "football", "f1"];

export function generateStaticParams() {
  return VALID_SPORTS.map((sport) => ({ sport }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sport: string }> }
) {
  const { sport } = await params;
  const sportId: SportId = VALID_SPORTS.includes(sport as SportId)
    ? (sport as SportId)
    : "all";

  const { fixtures, updatedAt } = await fetchFixtures(sportId);
  return Response.json({ fixtures, updatedAt });
}
