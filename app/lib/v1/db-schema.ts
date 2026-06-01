import { boolean, pgTable, text, uuid, integer, date, timestamp, numeric } from "drizzle-orm/pg-core";

export const footballFixtures = pgTable("football_fixtures", {
  id: uuid("id").primaryKey().defaultRandom(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  competition: text("competition").notNull(),
  competitionShort: text("competition_short").notNull(),
  kickoff: text("kickoff").notNull(),
  date: date("date").notNull(),
  venue: text("venue"),
  status: text("status").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  stage: text("stage"),
  groupName: text("group_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const wcGroupStandings = pgTable("wc_group_standings", {
  id: uuid("id").primaryKey().defaultRandom(),
  competitionShort: text("competition_short").notNull(),
  groupName: text("group_name").notNull(),
  position: integer("position").notNull(),
  team: text("team").notNull(),
  played: integer("played").notNull(),
  won: integer("won").notNull(),
  drawn: integer("drawn").notNull(),
  lost: integer("lost").notNull(),
  goalsFor: integer("goals_for").notNull(),
  goalsAgainst: integer("goals_against").notNull(),
  goalDifference: integer("goal_difference").notNull(),
  points: integer("points").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const f1Fixtures = pgTable("f1_fixtures", {
  id: uuid("id").primaryKey().defaultRandom(),
  round: integer("round").notNull(),
  circuit: text("circuit").notNull(),
  country: text("country").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const f1RaceResults = pgTable("f1_race_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  fixtureId: uuid("fixture_id"),
  season: text("season").notNull(),
  round: integer("round").notNull(),
  position: integer("position"),
  driver: text("driver").notNull(),
  constructor: text("constructor").notNull(),
  grid: integer("grid"),
  laps: integer("laps").notNull(),
  statusText: text("status_text").notNull(),
  points: numeric("points").notNull(),
  isFastestLap: boolean("is_fastest_lap").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const sportImages = pgTable("sport_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  sport: text("sport").notNull(),
  entityCode: text("entity_code").notNull(),
  leagueCode: text("league_code"),
  storagePath: text("storage_path").notNull(),
  altText: text("alt_text"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  sport: text("sport").notNull(),
  competition: text("competition"),
  title: text("title").notNull(),
  summary: text("summary"),
  source: text("source"),
  sourceUrl: text("source_url"),
  imagePath: text("image_path"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ---------------------------------------------------------------------------
// v2 schema (Supabase). Populated by v2 ETL runners; F1 enum values pending.
// ---------------------------------------------------------------------------

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  sport: text("sport").notNull(),
  competitionName: text("competition_name").notNull(),
  shortCode: text("short_code").notNull(),
  teamsType: text("teams_type"),
  format: text("format"),
  season: text("season").notNull(),
  edition: integer("edition"),
  scope: text("scope"),
  organizer: text("organizer"),
  status: text("status"),
});

export const fbClubs = pgTable("fb_clubs", {
  id: uuid("id").primaryKey().defaultRandom(),
  commonName: text("common_name").notNull(),
  fullName: text("full_name").notNull(),
});

export const f1Circuits = pgTable("f1_circuits", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  country: text("country"),
  lengthKm: numeric("length_km"),
  firstGrandPrixYear: integer("first_grand_prix_year"),
  scheduledLaps: integer("scheduled_laps"),
});

export const fbFixturesV2 = pgTable("fb_fixtures", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id"),
  homeClubId: uuid("home_club_id"),
  awayClubId: uuid("away_club_id"),
  matchDate: date("match_date").notNull(),
  kickoffTimeUtc: timestamp("kickoff_time_utc", { withTimezone: true }),
  status: text("status").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  venue: text("venue"),
});

export const f1FixturesV2 = pgTable("f1_fixtures", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id"),
  circuitId: uuid("circuit_id"),
  round: integer("round"),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  status: text("status").notNull(),
});

export const siteContent = pgTable("site_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  slot: text("slot").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  imagePath: text("image_path"),
  badgeText: text("badge_text"),
  accentColor: text("accent_color"),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

