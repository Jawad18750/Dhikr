// Every country's capital, for dhikr.ly's prayer-methods tool: src/data/prayer-world.json
// (capital, coordinates, IANA time zone, Arabic and English country names) and
// src/data/world-land.json (the land as one SVG path, equirectangular, for the map).
//   node scripts/build-prayer-world.mjs <cities15000.txt> <world-countries countries.json> <world-atlas land-110m.json>
// Capitals: GeoNames (cities15000, feature code PPLC), CC BY 4.0. Country names:
// mledoze/world-countries (ODbL). Land: Natural Earth via world-atlas (public domain).
import fs from 'node:fs';

const [geonames, countriesFile, landFile] = process.argv.slice(2);
const names = new Map(
  JSON.parse(fs.readFileSync(countriesFile, 'utf8')).map((c) => [c.cca2, { ar: c.translations?.ara?.common ?? c.name.common, en: c.name.common }])
);
const capitals = new Map();
for (const line of fs.readFileSync(geonames, 'utf8').split('\n')) {
  const f = line.split('\t');
  if (f[7] !== 'PPLC') continue;
  const cc = f[8];
  const population = Number(f[14]) || 0;
  const held = capitals.get(cc);
  if (held && held.population >= population) continue;
  capitals.set(cc, { cc, capital: f[1], lat: Math.round(Number(f[4]) * 1e4) / 1e4, lng: Math.round(Number(f[5]) * 1e4) / 1e4, tz: f[17], population });
}
const out = [...capitals.values()]
  .filter((c) => names.has(c.cc))
  .map(({ population: _, ...c }) => ({ ...c, name_ar: names.get(c.cc).ar, name_en: names.get(c.cc).en }))
  .sort((a, b) => a.name_ar.localeCompare(b.name_ar, 'ar'));
fs.writeFileSync('src/data/prayer-world.json', JSON.stringify(out));
console.log(`prayer-world: ${out.length} countries`);

// The land, equirectangular, 2 px per degree, rounded.
const t = JSON.parse(fs.readFileSync(landFile, 'utf8'));
const [sx, sy] = t.transform.scale;
const [tx, ty] = t.transform.translate;
const arc = (index) => {
  const a = t.arcs[index < 0 ? ~index : index];
  let x = 0;
  let y = 0;
  const pts = a.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * sx + tx, y * sy + ty];
  });
  return index < 0 ? pts.reverse() : pts;
};
const P = (lng, lat) => `${Math.round((lng + 180) * 2)},${Math.round((90 - lat) * 2)}`;
const parts = [];
for (const g of t.objects.land.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  for (const poly of polys) for (const ring of poly) parts.push(`M${ring.flatMap((index) => arc(index)).map(([lng, lat]) => P(lng, lat)).join('L')}Z`);
}
fs.writeFileSync('src/data/world-land.json', JSON.stringify({ path: parts.join(''), width: 720, height: 360 }));
console.log('world-land', parts.join('').length);
