import { notFound } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";
import { getCompetitions, getTeamProfile, getTeamsForCompetition } from "@/app/lib/v2/queries";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { TeamView } from "@/app/components/v2/team/TeamView";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { sport: string; competition: string; team: string }[] = [];
  for (const s of SPORTS) {
    for (const c of getCompetitions(s.slug)) {
      for (const team of getTeamsForCompetition(c.slug)) {
        out.push({ sport: s.slug, competition: c.slug, team: team.slug });
      }
    }
  }
  return out;
}

export default async function Page({
  params,
}: {
  params: Promise<{ sport: string; competition: string; team: string }>;
}) {
  const { team } = await params;
  const profile = getTeamProfile(team);
  if (!profile) notFound();
  return (
    <V2Shell>
      <TeamView profile={profile} />
    </V2Shell>
  );
}
