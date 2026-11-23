import { reciterName } from '@/lib/reciter-names';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

/**
 * The apps' API: what the three apps read, at one versioned address.
 *
 * Decided with the owner (2026-11-23):
 * - Open, like the files it mirrors. `?app=adhan|quran|masahif` names the caller so
 *   Cloudflare's analytics count requests per app; a missing or unknown `app` still gets a
 *   200. Never gated: a shipped app cannot be fixed after a 401.
 * - Cacheable: one URL per resource, `Cache-Control: public`, no per-request work on a hit.
 *   No logging here; counts are totals per app from the CDN, nothing per device.
 * - Same meaning as the old files, which stay up forever for old installs. Everything but
 *   the catalogue is passed through byte for byte. The catalogue is the v3 envelope with
 *   additions only (`names` per reciter; `timing_revision`, `timings_url`,
 *   `word_timings_url` per moshaf). Old parsers ignore unknown keys.
 *
 * The schema is frozen in docs/app-api.md: additive changes only.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WORD_TIMING_BASE = 'https://qalun-timing.abdeljawad.com/timing-data-nemo';
const SITE = 'https://dhikr.ly/api/v1/app';

const SLUG = /^[a-z0-9_]+$/;
const SURAH = /^(\d{3})(?:\.json)?$/;
const VOICE = /^[a-z0-9_-]+$/;

type Upstream = { url: string; maxAge: number; transform?: 'catalogue' };

/** The allowlist: an app path and the file it mirrors. Anything else is a 404. */
function upstreamFor(parts: string[]): Upstream | null {
  const [head, a, b, c, d] = parts;
  const surah = (value: string | undefined) => {
    const match = value ? SURAH.exec(value) : null;
    return match && Number(match[1]) >= 1 && Number(match[1]) <= 114 ? match[1] : null;
  };
  if (head === 'catalogue' && parts.length === 1)
    return { url: `${DHIKR_AUDIO_BASE}/api/v3/reciters`, maxAge: 300, transform: 'catalogue' };
  if (head === 'tafsir' && parts.length === 1)
    return { url: `${DHIKR_AUDIO_BASE}/api/v3/tafsir`, maxAge: 3600 };
  if (head === 'tafsir' && a === 'timings' && b === 'mukhtasar' && c && VOICE.test(c) && surah(d) && parts.length === 5)
    return { url: `${DHIKR_AUDIO_BASE}/tafsir/timings/mukhtasar/${c}/${surah(d)}.json`, maxAge: 3600 };
  if (head === 'timings' && a === 'index' && parts.length === 2)
    return { url: `${DHIKR_AUDIO_BASE}/timings/index.json`, maxAge: 300 };
  if (head === 'timings' && a && SLUG.test(a) && b === 'ayahs' && parts.length === 3)
    return { url: `${DHIKR_AUDIO_BASE}/timings/${a}/ayahs.json`, maxAge: 3600 };
  if (head === 'timings' && a && SLUG.test(a) && surah(b) && parts.length === 3)
    return { url: `${DHIKR_AUDIO_BASE}/timings/${a}/${surah(b)}.json`, maxAge: 3600 };
  if (head === 'word-timings' && a && SLUG.test(a) && surah(b) && parts.length === 3)
    return { url: `${WORD_TIMING_BASE}/${a}/${surah(b)}.json`, maxAge: 3600 };
  return null;
}

type Moshaf = Record<string, unknown> & { slug?: string; server?: string };
type Catalogue = Record<string, unknown> & {
  reciters?: (Record<string, unknown> & { name?: string; moshaf?: Moshaf[] })[];
};

const slugOf = (moshaf: Moshaf) =>
  moshaf.slug ?? String(moshaf.server ?? '').replace(/\/+$/, '').split('/').pop() ?? '';

/** The v3 envelope, unchanged, plus the additions. */
async function catalogue(body: string): Promise<string> {
  const data = JSON.parse(body) as Catalogue;
  let revisions: Record<string, { revision?: string }> = {};
  try {
    const index = await fetch(`${DHIKR_AUDIO_BASE}/timings/index.json`, { next: { revalidate: 300 } });
    if (index.ok) revisions = ((await index.json()) as { reciters?: typeof revisions }).reciters ?? {};
  } catch {
    // Without the index the revisions are simply absent (additive fields are optional).
  }
  for (const reciter of data.reciters ?? []) {
    const first = reciter.moshaf?.[0];
    const slug = first ? slugOf(first) : '';
    const ar = reciter.name ?? '';
    reciter.names = {
      ar,
      latn: reciterName(slug, ar, 'en'),
      cyrl: reciterName(slug, ar, 'ru'),
      beng: reciterName(slug, ar, 'bn'),
    };
    for (const moshaf of reciter.moshaf ?? []) {
      const own = slugOf(moshaf);
      if (!own) continue;
      moshaf.timing_revision = revisions[own]?.revision ?? null;
      moshaf.timings_url = `${SITE}/timings/${own}/`;
      moshaf.word_timings_url = `${SITE}/word-timings/${own}/`;
    }
  }
  return JSON.stringify(data);
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const upstream = upstreamFor(path);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'X-License': 'CC BY-NC 4.0 (https://dhikr.ly/developers)',
  };
  if (!upstream) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { ...headers, 'Cache-Control': 'public, max-age=300' },
    });
  }
  let response: Response;
  try {
    response = await fetch(upstream.url, { next: { revalidate: upstream.maxAge } });
  } catch {
    return new Response(JSON.stringify({ error: 'upstream_unavailable' }), {
      status: 502,
      headers: { ...headers, 'Cache-Control': 'no-store' },
    });
  }
  if (!response.ok) {
    return new Response(JSON.stringify({ error: response.status === 404 ? 'not_found' : 'upstream_error' }), {
      status: response.status === 404 ? 404 : 502,
      headers: { ...headers, 'Cache-Control': response.status === 404 ? 'public, max-age=300' : 'no-store' },
    });
  }
  const raw = await response.text();
  const body = upstream.transform === 'catalogue' ? await catalogue(raw) : raw;
  return new Response(body, {
    headers: {
      ...headers,
      // The CDN keeps it for the max age and serves a stale copy for a day while it refreshes.
      'Cache-Control': `public, max-age=${upstream.maxAge}, s-maxage=${upstream.maxAge}, stale-while-revalidate=86400`,
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Max-Age': '86400',
    },
  });
}
