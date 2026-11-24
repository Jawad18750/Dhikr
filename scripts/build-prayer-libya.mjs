// The Libyan cities' prayer tables, as the apps carry them, for dhikr.ly's open dataset:
// src/data/prayer-libya.json (the site's tool and API) and, with --out, the downloadable
// files (CSV, JSON, SQLite) for the public repository and /downloads.
//   node --no-warnings scripts/build-prayer-libya.mjs <dhikr-app> [--out <dir>]
// Source: the official timetables of Libya's General Authority of Awqaf and Islamic Affairs,
// compiled by «مؤذن ليبيا» (used with its author's permission) and Tawkit; repaired and
// packed by dhikr-app/scripts/import_muadhin_libya.py into tawkit.db.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import zlib from 'node:zlib';

const app = process.argv[2] ?? `${os.homedir()}/Developer/dhikr/dhikr-app`;
const outIndex = process.argv.indexOf('--out');
const out = outIndex === -1 ? null : process.argv[outIndex + 1];

const temporary = path.join(os.tmpdir(), `tawkit-${process.pid}.db`);
fs.writeFileSync(temporary, zlib.brotliDecompressSync(fs.readFileSync(path.join(app, 'app/assets/data/tawkit.db.br'))));
const database = new DatabaseSync(temporary, { readOnly: true });
const muadhin = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(app, 'scripts/data/muadhin_libya.json.gz'))).toString('utf8'));
const keyOf = new Map(muadhin.cities.map((c) => [c.name_ar, c]));

// A city's URL name, from its table's code («LY.M.awladMahmoud» → awlad-mahmoud); the few
// codes that do not name their city are named here.
const NAMED = { 'أبو قرين': 'abu-qurayn' };
const slugify = (code) =>
  code
    .replace(/^LY\.(M\.)?/, '')
    .replaceAll(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
const titled = (slug) => slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

const cities = database
  .prepare(
    `SELECT c.id, c.city_code, c.name_ar, c.lat, c.lng FROM cities c
     WHERE c.country_code = 'LY' AND EXISTS (SELECT 1 FROM prayer_times p WHERE p.city_id = c.id)
     ORDER BY c.name_ar`
  )
  .all();
const rows = database.prepare('SELECT month, day, fajr, shurouq, dhuhr, asr, maghrib, isha FROM prayer_times WHERE city_id = ? ORDER BY month, day');

const seen = new Set();
const data = cities.map((c) => {
  const m = keyOf.get(c.name_ar);
  let slug = NAMED[c.name_ar] ?? slugify(c.city_code);
  while (seen.has(slug)) slug += '-2';
  seen.add(slug);
  const days = rows.all(c.id);
  if (days.length !== 366) throw new Error(`${c.name_ar}: ${days.length} days`);
  // 366 days × 6 times, each HHMM: one string per city.
  const packed = days.map((d) => [d.fajr, d.shurouq, d.dhuhr, d.asr, d.maghrib, d.isha].map((t) => t.replace(':', '')).join('')).join('');
  if (!/^\d+$/.test(packed) || packed.length !== 366 * 24) throw new Error(`${c.name_ar}: bad times`);
  return {
    slug,
    name_ar: c.name_ar,
    name_en: titled(slug),
    lat: Math.round(c.lat * 1e5) / 1e5,
    lng: Math.round(c.lng * 1e5) / 1e5,
    // The Awqaf moved the east's and south's Fajr to the true dawn (about 15°).
    new_fajr: Boolean(m?.listed_new_fajr),
    times: packed,
  };
});
database.close();
fs.rmSync(temporary);

const meta = {
  title: 'مواقيت الصلاة للمدن الليبية',
  title_en: 'Prayer times for Libyan cities',
  source: 'الهيئة العامة للأوقاف والشؤون الإسلامية (ليبيا)',
  source_en: "Libya's General Authority of Awqaf and Islamic Affairs (official timetables)",
  compiled_by: ['«مؤذن ليبيا»', 'Tawkit.net'],
  site: 'https://dhikr.ly/prayer-times',
  license: 'CC BY 4.0',
  timezone: 'Africa/Tripoli',
  columns: ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'],
  days: 366,
};
fs.writeFileSync('src/data/prayer-libya.json', JSON.stringify({ ...meta, cities: data }));
console.log(`prayer-libya: ${data.length} cities`);

if (out) {
  fs.mkdirSync(out, { recursive: true });
  const dates = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= new Date(2024, m, 0).getDate(); d++) dates.push([m, d]);
  const time = (s, index, k) => `${s.slice(index * 24 + k * 4, index * 24 + k * 4 + 2)}:${s.slice(index * 24 + k * 4 + 2, index * 24 + k * 4 + 4)}`;
  // CSV: one row per city and day.
  const csv = ['city,name_ar,lat,lng,month,day,fajr,sunrise,dhuhr,asr,maghrib,isha'];
  for (const c of data) for (const [index, [m, d]] of dates.entries()) csv.push([c.slug, c.name_ar, c.lat, c.lng, m, d, ...[0, 1, 2, 3, 4, 5].map((k) => time(c.times, index, k))].join(','));
  fs.writeFileSync(path.join(out, 'libya-prayer-times.csv'), `\uFEFF${csv.join('\n')}\n`);
  // JSON: cities, each with its days.
  const json = {
    ...meta,
    cities: data.map(({ times, ...c }) => ({
      ...c,
      days: dates.map(([m, d], index) => ({ month: m, day: d, fajr: time(times, index, 0), sunrise: time(times, index, 1), dhuhr: time(times, index, 2), asr: time(times, index, 3), maghrib: time(times, index, 4), isha: time(times, index, 5) })),
    })),
  };
  fs.writeFileSync(path.join(out, 'libya-prayer-times.json'), JSON.stringify(json, null, 1));
  fs.writeFileSync(path.join(out, 'cities.json'), JSON.stringify(data.map(({ times, ...c }) => c), null, 2));
  // SQLite: two tables.
  const file = path.join(out, 'libya-prayer-times.sqlite');
  fs.rmSync(file, { force: true });
  const database_ = new DatabaseSync(file);
  database_.exec(`CREATE TABLE cities (slug TEXT PRIMARY KEY, name_ar TEXT NOT NULL, name_en TEXT NOT NULL, lat REAL, lng REAL, new_fajr INTEGER);
           CREATE TABLE prayer_times (city TEXT NOT NULL REFERENCES cities(slug), month INTEGER, day INTEGER, fajr TEXT, sunrise TEXT, dhuhr TEXT, asr TEXT, maghrib TEXT, isha TEXT, PRIMARY KEY (city, month, day));`);
  const ci = database_.prepare('INSERT INTO cities VALUES (?,?,?,?,?,?)');
  const pi = database_.prepare('INSERT INTO prayer_times VALUES (?,?,?,?,?,?,?,?,?)');
  database_.exec('BEGIN');
  for (const c of data) {
    ci.run(c.slug, c.name_ar, c.name_en, c.lat, c.lng, c.new_fajr ? 1 : 0);
    for (const [index, [m, d]] of dates.entries()) pi.run(c.slug, m, d, ...[0, 1, 2, 3, 4, 5].map((k) => time(c.times, index, k)));
  }
  database_.exec('COMMIT');
  database_.close();
  console.log(`downloads → ${out}`);
}
