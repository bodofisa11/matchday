import { getCompetitionTeamDetails, teamSlug } from "@/app/lib/v2/queries";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { TeamView } from "@/app/components/v2/team/TeamView";

export const dynamicParams = false;

// World Cup teams are nations; enumerate them from the DB at build time.
export async function generateStaticParams() {
  const teams = await getCompetitionTeamDetails("world-cup");
  const params = teams.map((t) => ({ team: teamSlug(t.name) }));
  // output:export rejects an empty param set; fall back to one throwaway path
  // (renders "Team not found") when the build can't reach Supabase.
  return params.length > 0 ? params : [{ team: "__none__" }];
}

export default async function Page({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  return (
    <V2Shell>
      <TeamView sport="football" competitionSlug="world-cup" teamSlug={team} />
    </V2Shell>
  );
}
