// Server only: read by the reciter page.

/**
 * How often each recitation was heard or saved in the last 30 days: Cloudflare's count
 * of requests for its MP3s on the audio host (most are served from Cloudflare's cache,
 * so the origin's own log would miss them). Requests, not plays: a phone streaming one
 * surah may ask several times, so the figure is shown rounded.
 *
 * The key (CF_ANALYTICS_TOKEN) can only read this one zone's analytics. Without it, or
 * when Cloudflare does not answer, there is simply no count.
 */
const HOST = 'quran-audio.abdeljawad.com';
const WINDOW_DAYS = 30;
const KEEP_MS = 6 * 3600_000;

let held: { at: number; counts: Map<string, number> } | null = null;
let pending: Promise<Map<string, number> | null> | null = null;

async function fetchCounts(): Promise<Map<string, number> | null> {
  const token = process.env.CF_ANALYTICS_TOKEN;
  const zone = process.env.CF_ANALYTICS_ZONE;
  if (!token || !zone) return null;
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 86_400_000);
  const query = `{ viewer { zones(filter: { zoneTag: "${zone}" }) {
    httpRequestsAdaptiveGroups(limit: 10000, filter: {
      datetime_geq: "${since.toISOString()}", datetime_lt: "${now.toISOString()}",
      clientRequestHTTPHost: "${HOST}", clientRequestPath_like: "/audio/%"
    }) { count dimensions { clientRequestPath } }
  } } }`;
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    data?: {
      viewer?: {
        zones?: {
          httpRequestsAdaptiveGroups?: { count: number; dimensions: { clientRequestPath: string } }[];
        }[];
      };
    };
  };
  const groups = data.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups;
  if (!groups) return null;
  const counts = new Map<string, number>();
  for (const group of groups) {
    const slug = /^\/audio\/([a-z0-9_]+)\/\d{3}\.mp3$/.exec(group.dimensions.clientRequestPath)?.[1];
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + group.count);
  }
  return counts;
}

/** The recitation's requests over the last 30 days, or null when there is no count. */
export async function listenCount(slug: string): Promise<number | null> {
  if (!held || Date.now() - held.at > KEEP_MS) {
    pending ??= fetchCounts()
      .catch(() => null)
      .finally(() => {
        pending = null;
      });
    const counts = await pending;
    if (counts) held = { at: Date.now(), counts };
  }
  return held?.counts.get(slug) ?? null;
}

const countryCache = new Map<string, { at: number; codes: string[] }>();

/** The countries this recitation is most heard in over 30 days (ISO codes, most first). */
export async function listenCountries(slug: string, top = 5): Promise<string[]> {
  const held = countryCache.get(slug);
  if (held && Date.now() - held.at < KEEP_MS) return held.codes;
  const token = process.env.CF_ANALYTICS_TOKEN;
  const zone = process.env.CF_ANALYTICS_ZONE;
  if (!token || !zone || !/^[a-z0-9_]+$/.test(slug)) return [];
  const now = new Date();
  const since = new Date(now.getTime() - WINDOW_DAYS * 86_400_000);
  const query = `{ viewer { zones(filter: { zoneTag: "${zone}" }) {
    httpRequestsAdaptiveGroups(limit: ${top + 3}, orderBy: [count_DESC], filter: {
      datetime_geq: "${since.toISOString()}", datetime_lt: "${now.toISOString()}",
      clientRequestHTTPHost: "${HOST}", clientRequestPath_like: "/audio/${slug}/%"
    }) { count dimensions { clientCountryName } }
  } } }`;
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });
    const data = (await response.json()) as {
      data?: { viewer?: { zones?: { httpRequestsAdaptiveGroups?: { dimensions: { clientCountryName: string } }[] }[] } };
    };
    const codes = (data.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups ?? [])
      .map((g) => g.dimensions.clientCountryName)
      // Cloudflare's own codes for unknown and Tor are not countries.
      .filter((c) => /^[A-Z]{2}$/.test(c) && c !== 'XX' && c !== 'T1')
      .slice(0, top);
    countryCache.set(slug, { at: Date.now(), codes });
    return codes;
  } catch {
    return [];
  }
}
