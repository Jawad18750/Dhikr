// Applies db/migrations/*.sql in order, each once (recorded in schema_migrations).
//   DATABASE_URL=postgres://… node scripts/migrate.mjs
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'db', 'migrations');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(
  'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, at TIMESTAMPTZ NOT NULL DEFAULT now())'
);
const done = new Set((await client.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));
for (const name of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
  if (done.has(name)) continue;
  await client.query('BEGIN');
  try {
    await client.query(readFileSync(path.join(dir, name), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    console.log(`applied ${name}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`failed ${name}:`, error.message);
    process.exit(1);
  }
}
await client.end();
