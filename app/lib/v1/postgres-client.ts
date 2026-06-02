import { Pool } from "pg";

let pool: Pool | null = null;

/**
 * Get a Postgres connection pool for local dev (Docker).
 * Only use when DATABASE_URL is set and NODE_ENV is development.
 */
export function getPostgresPool(): Pool | null {
  const url = process.env.DATABASE_URL;
  if (!url || process.env.NODE_ENV !== "development") {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: url });
  }

  return pool;
}
