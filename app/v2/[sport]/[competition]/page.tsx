import { notFound } from "next/navigation";
import { SPORTS } from "@/app/lib/v2/types";
import { getCompetition, getCompetitions } from "@/app/lib/v2/queries";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { CompetitionView } from "@/app/components/v2/competition/CompetitionView";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { sport: string; competition: string }[] = [];
  for (const s of SPORTS) {
    for (const c of getCompetitions(s.slug)) {
      out.push({ sport: s.slug, competition: c.slug });
    }
  }
  return out;
}

export default async function Page({
  params,
}: {
  params: Promise<{ sport: string; competition: string }>;
}) {
  const { sport, competition } = await params;
  const meta = getCompetition(competition);
  if (!meta || meta.sport !== sport) notFound();
  return (
    <V2Shell>
      <CompetitionView competition={meta} />
    </V2Shell>
  );
}
