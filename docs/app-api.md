# The apps' API (v1, frozen 2026-11-23; app name in the path, 2026-11-23)

What the three apps (أذان وأذكار, مصحف الجماهيرية, مصاحف ليبيا) read, at one versioned
address. Agreed between the site and the apps (`dhikr-app/packages/quran_audio`) and
approved by the owner on 2026-11-23.

Base: `https://dhikr.ly/api/v1/app/{app}/` (`{app}` = `adhan`, `quran` or `masahif`; optional)

## Rules

1. **Open.** No key and no account. The app names itself as the first path segment:
   `/api/v1/app/adhan/…`, `/api/v1/app/quran/…` or `/api/v1/app/masahif/…`, so
   Cloudflare's analytics count each app (they cannot read query strings, so `?app=` is
   accepted but not counted). Without a name, or with an unknown one, every resource still
   answers 200. Nothing is ever gated: a shipped app can't be fixed after a 401.
2. **Cached.** One URL per resource, `Cache-Control: public` with a max age, served from
   Cloudflare's edge (a cache rule on `/api/v1/app/*`). Nothing is logged per request.
   Counts are totals per app and path from the CDN, nothing per device, so the apps'
   "Data Not Collected" answer stands.
3. **Same meaning as the old files.** Every resource except the catalogue is the old file,
   passed through byte for byte. The catalogue is the v3 envelope with additions only.
4. **Frozen.** After today only additive changes: new keys, new optional fields, new
   paths. No field is renamed, retyped or removed. Old parsers ignore unknown keys.
5. **The old addresses answer forever.** `quran-audio.abdeljawad.com/api/v3/*`,
   `/timings/*`, `/tafsir/timings/*` and `qalun-timing.abdeljawad.com/timing-data-nemo/*`
   stay up for installs that never update. `build_catalog.py` stays the one writer, so
   every reciter edit reaches old and new apps alike.

## Resources

| Path | Mirrors | Max age |
|---|---|---|
| `catalogue` | `quran-audio…/api/v3/reciters`, with the additions below | 5 min |
| `timings/index` | `quran-audio…/timings/index.json` | 5 min |
| `timings/{slug}/ayahs` | `quran-audio…/timings/{slug}/ayahs.json` | 1 h |
| `timings/{slug}/{NNN}` | `quran-audio…/timings/{slug}/{NNN}.json` | 1 h |
| `word-timings/{slug}/{NNN}` | `qalun-timing…/timing-data-nemo/{slug}/{NNN}.json` | 1 h |
| `tafsir` | `quran-audio…/api/v3/tafsir` | 1 h |
| `tafsir/timings/mukhtasar/{voice}/{NNN}` | `quran-audio…/tafsir/timings/mukhtasar/{voice}/{NNN}.json` | 1 h |

`{NNN}` is the surah, three digits (`001`–`114`); `001.json` is accepted too. `{slug}` is
`[a-z0-9_]+`. Every response may be up to a day older while the edge refreshes it
(`stale-while-revalidate`). A path outside this table answers 404.

## Catalogue

The v3 envelope, unchanged:

- `reciters[]`: `id` (int), `name` (Arabic), `moshaf[]`; also `letter`, `date`
- `moshaf`:
  - `id` (int), `name`
  - `server`: the audio base URL; a surah is `server + NNN.mp3`
  - `surah_list`: `"1,2,…"`
  - `slug`: the recitation id and the on-device cache folder; never changes
  - `image`
  - `timing_surahs`: `"1,2,…"`
  - `surah_audio`: `"<surah>:<bytes>:<hash>,…"`
  - also, as in v3: `surah_total`, `rewaya_id`, `moshaf_type`, `source`, and
    `alt_source_surahs` where a recitation has one
- `ranking`: `popular[id]`, `new[{id, until}]`, `hidden[id]`
- `portraits`: `{recitation id: url | null}`
- `hidden_surahs` (added 2026-11-23): `{recitation id: [surah, …]}`: surahs not offered for
  that recitation (not listed, played or downloaded), e.g. a wrong file at the source. A top-level
  key, because the owner's panel rewrites `ranking` whole.

Additions (optional; absent or null means unknown):

- On each reciter, `names`: `{ ar, latn, cyrl, beng }`. The name in Arabic, Latin,
  Cyrillic and Bengali script. Arabic, Urdu and Persian interfaces use `ar`; Russian uses
  `cyrl`; Bengali uses `beng`; every other language uses `latn`. `name` stays the Arabic.
- On each moshaf:
  - `timing_revision`: the revision string from `timings/index`, e.g.
    `"1/2026-10-19T11:47:13Z"`. Refetch that recitation's timings when it changes.
  - `timings_url`: `https://dhikr.ly/api/v1/app/{app}/timings/{slug}/`. Add `NNN` or
    `ayahs`. It carries the app name the catalogue was fetched with.
  - `word_timings_url`: `https://dhikr.ly/api/v1/app/{app}/word-timings/{slug}/`. Add `NNN`.

Audio files stay where `server` points.

## Not the apps' API

`https://dhikr.ly/api/v1/{reciters,timings,word-timings}` is the developers' API: a
personal key, per-account logging, its own shapes (see dhikr.ly/developers). The apps
don't use it.
