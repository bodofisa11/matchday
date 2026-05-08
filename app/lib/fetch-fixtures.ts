import { drizzle } from "drizzle-orm/node-postgres";
import { getPostgresPool } from "./postgres-client";
import { footballFixtures, f1Fixtures } from "./db-schema";
import type { Fixture } from "./fixtures";
import { utcToIST } from "./timezone";

export type SportId = "all" | "football" | "f1";

function mapF1Status(f1Status: string): Fixture["status"] {
  if (f1Status === "scheduled") return "scheduled";
  if (["practice", "qualifying", "race"].includes(f1Status)) return "live";
  return "finished"; // completed, cancelled
}

function mapRowToFixture(row: typeof footballFixtures.$inferSelect): Fixture {
  const dateStr =
    typeof row.date === "string"
      ? row.date.split("T")[0]
      : (row.date as Date).toISOString().split("T")[0];
  const ist = utcToIST(dateStr, row.kickoff);
  return {
    id: String(row.id),
    sport: "football" as const,
    homeTeam: row.homeTeam,
    awayTeam: row.awayTeam,
    competition: row.competition,
    competitionShort: row.competitionShort,
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.venue ?? undefined,
    status: row.status as Fixture["status"],
    homeScore: row.homeScore ?? undefined,
    awayScore: row.awayScore ?? undefined,
  };
}

function mapF1RowToFixture(row: typeof f1Fixtures.$inferSelect): Fixture {
  const dateStr =
    typeof row.date === "string"
      ? row.date.split("T")[0]
      : (row.date as Date).toISOString().split("T")[0];
  const ist = utcToIST(dateStr, "14:00");
  return {
    id: String(row.id),
    sport: "f1" as const,
    homeTeam: row.circuit,
    awayTeam: row.country,
    competition: `Round ${row.round}`,
    competitionShort: "F1",
    kickoff: ist.kickoff,
    date: ist.date,
    venue: row.country,
    status: mapF1Status(row.status),
  };
}

export async function fetchFixtures(sportId: SportId = "all"): Promise<{
  fixtures: Fixture[];
  updatedAt: string;
}> {
  const updatedAt = new Date().toISOString();
  const pool = getPostgresPool();
  if (!pool) return { fixtures: [], updatedAt };

  try {
    const db = drizzle(pool);
    const allFixtures: Fixture[] = [];

    if (sportId === "f1" || sportId === "all") {
      const rows = await db.select().from(f1Fixtures).orderBy(f1Fixtures.date);
      allFixtures.push(...rows.map(mapF1RowToFixture));
    }

    if (sportId === "football" || sportId === "all") {
      const rows = await db
        .select()
        .from(footballFixtures)
        .orderBy(footballFixtures.date, footballFixtures.kickoff);
      allFixtures.push(...rows.map(mapRowToFixture));
    }

    allFixtures.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      return d !== 0 ? d : a.kickoff.localeCompare(b.kickoff);
    });

    return { fixtures: allFixtures, updatedAt };
  } catch {
    return { fixtures: [], updatedAt };
  }
}
