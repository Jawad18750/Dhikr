// Folds every tafsir passage into Postgres for search (db/migrations/002_tafsir_search.sql),
// from the apps' files under CONTENT_ROOT. Skips the work when the files are unchanged.
//   DATABASE_URL=… CONTENT_ROOT=/opt/dhikr-content node scripts/index-tafsir.mjs [--force]
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import pg from 'pg';

import { fold } from '../src/lib/arabic-fold.mjs';

const root = process.env.CONTENT_ROOT ?? '/Users/jawad/Developer/dhikr/dhikr-app';
const library = path.join(root, 'app/assets/data/library');
const index = JSON.parse(fs.readFileSync(path.join(library, 'index.json'), 'utf8'));
const folders = index.books
  .filter((b) => b.type === 'tafsirBook' && b.asset)
  .map((b) => path.basename(b.asset))
  .filter((f) => fs.existsSync(path.join(library, 'tafsir', f)));

// What the files are: names, sizes and times, all of them.
const files = folders.flatMap((f) =>
  fs
    .readdirSync(path.join(library, 'tafsir', f))
    .filter((n) => n.endsWith('.json.br'))
    .map((n) => path.join(library, 'tafsir', f, n))
);
const fingerprint = files
  .map((file) => {
    const s = fs.statSync(file);
    return `${path.relative(library, file)}:${s.size}:${Math.round(s.mtimeMs)}`;
  })
  .sort()
  .join('\n');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const held = await client.query("SELECT fingerprint FROM search_sources WHERE name = 'tafsir'");
if (held.rows[0]?.fingerprint === fingerprint && !process.argv.includes('--force')) {
  console.log('tafsir index: unchanged');
  await client.end();
  process.exit(0);
}

// Printing artefacts the site strips too (src/lib/tafsir.ts).
const clean = (text) => text.replaceAll(/\(p-[\d٠-٩]+\)/g, '').trim();

// Filled without its index, then indexed once: far faster than keeping it up row by row.
// Searches wait (or time out) meanwhile.
await client.query('BEGIN');
await client.query("SET LOCAL maintenance_work_mem = '512MB'");
await client.query('DROP INDEX IF EXISTS tafsir_passages_folded');
await client.query('DELETE FROM tafsir_passages');
let rows = 0;
let letters = 0;
for (const tafsir of folders) {
  for (let surah = 1; surah <= 114; surah++) {
    const file = path.join(library, 'tafsir', tafsir, `${String(surah).padStart(3, '0')}.json.br`);
    if (!fs.existsSync(file)) continue;
    const entries = JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString('utf8'));
    const batch = entries
      .map(([hafs, text]) => [hafs, fold(clean(String(text ?? '')))])
      .filter(([, folded]) => folded);
    if (batch.length === 0) continue;
    await client.query(
      `INSERT INTO tafsir_passages (tafsir, surah, hafs, folded)
       SELECT $1, $2, h, f FROM unnest($3::smallint[], $4::text[]) AS x(h, f)
       ON CONFLICT (tafsir, surah, hafs) DO UPDATE SET folded = EXCLUDED.folded`,
      [tafsir, surah, batch.map((b) => b[0]), batch.map((b) => b[1])]
    );
    rows += batch.length;
    letters += batch.reduce((n, b) => n + b[1].length, 0);
  }
  console.log(`tafsir index: ${tafsir} done`);
}
console.log('tafsir index: indexing…');
await client.query('CREATE INDEX tafsir_passages_folded ON tafsir_passages USING gin (folded gin_trgm_ops)');
await client.query(
  `INSERT INTO search_sources (name, fingerprint) VALUES ('tafsir', $1)
   ON CONFLICT (name) DO UPDATE SET fingerprint = EXCLUDED.fingerprint, at = now()`,
  [fingerprint]
);
await client.query('COMMIT');
await client.query('ANALYZE tafsir_passages');
console.log(`tafsir index: ${rows} passages, ${(letters / 1e6).toFixed(0)}M letters, ${folders.length} tafsirs`);
await client.end();
