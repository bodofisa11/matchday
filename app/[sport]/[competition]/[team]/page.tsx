import { getCompetitions, getCompetitionTeamDetails, teamSlug } from "@/app/lib/v2/queries";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { TeamView } from "@/app/components/v2/team/TeamView";

export const dynamicParams = false;

// Enumerate every football team across wired competitions from the DB at build
// time (static export needs the full path set up front). New teams require a
// rebuild — fine, since deploys are tag-driven.
export async function generateStaticParams() {
  const out: { sport: string; competition: string; team: string }[] = [];
  for (const c of getCompetitions("football")) {
    const teams = await getCompetitionTeamDetails(c.slug);
    for (const t of teams) {
      out.push({ sport: "football", competition: c.slug, team: teamSlug(t.name) });
    }
  }
  // output:export rejects an empty param set. The DB is reachable in CI/prod, so
  // this only trips if the build can't reach Supabase — keep one throwaway path
  // (renders "Team not found", linked from nowhere) so the build still succeeds.
  if (out.length === 0) {
    return [{ sport: "football", competition: "premier-league", team: "__none__" }];
  }
  return out;
}

export default async function Page({
  params,
}: {
  params: Promise<{ sport: string; competition: string; team: string }>;
}) {
  const { sport, competition, team } = await params;
  return (
    <V2Shell>
      <TeamView sport={sport} competitionSlug={competition} teamSlug={team} />
    </V2Shell>
  );
}
