import { notFound } from "next/navigation";
import { SPORTS, type SportSlug } from "@/app/lib/v2/types";
import { V2Shell } from "@/app/components/v2/V2Shell";
import { SportView } from "@/app/components/v2/sport/SportView";

export const dynamicParams = false;

export function generateStaticParams() {
  return SPORTS.map((s) => ({ sport: s.slug }));
}

export default async function Page({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!SPORTS.some((s) => s.slug === sport)) notFound();
  return (
    <V2Shell>
      <SportView sport={sport as SportSlug} />
    </V2Shell>
  );
}
