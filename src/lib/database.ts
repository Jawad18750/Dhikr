// Server only: the site's Postgres (accounts, API keys, usage).
import pg from 'pg';

const globalForPool = globalThis as unknown as { dhikrPool?: pg.Pool };

/** One pool per server process (kept across hot reloads in development). */
export const pool =
  globalForPool.dhikrPool ??
  new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 30_000 });
if (process.env.NODE_ENV !== 'production') globalForPool.dhikrPool = pool;

export const databaseAvailable = () => Boolean(process.env.DATABASE_URL);
