// Server only: /admin's view of the apps' API.

/**
 * Requests to the apps' API (/api/v1/app) over the last 30 days, per app and per
 * resource, from Cloudflare's analytics of dhikr.ly. Edge hits included, which is the
 * point: the API is cached, so the origin sees almost none of it. Totals only: nothing per
 * device exists to read (the apps declare «Data Not Collected»).
 */
export type AppTraffic = {
  apps: { app: string; count: number }[];
  resources: { resource: string; count: number }[];
  total: number;
};

const APPS = new Set(['adhan', 'quran', 'masahif']);
const ZONE = '3c5890bfe2afd71e64f2d9da6fdcf58b';

/** «/api/v1/app/timings/abdulhamid_algriw/001» → «timings/{slug}/{surah}». */
const resourceOf = (path: string) =>
  path
    .replace(/^\/api\/v1\/app\//, '')
    .replace(/^(timings|word-timings)\/[a-z0-9_]+\/(?:\d{3}(?:\.json)?)$/, '$1/{slug}/{surah}')
    .replace(/^timings\/[a-z0-9_]+\/ayahs$/, 'timings/{slug}/ayahs')
    .replace(/^tafsir\/timings\/mukhtasar\/[a-z0-9_-]+\/\d{3}(?:\.json)?$/, 'tafsir/timings/…');

export async function appTraffic(): Promise<AppTraffic | null> {
  const token = process.env.CF_ANALYTICS_TOKEN;
  if (!token) return null;
  const now = new Date();
  const since = new Date(now.getTime() - 30 * 86_400_000);
  const query = `{ viewer { zones(filter: { zoneTag: "${ZONE}" }) {
    httpRequestsAdaptiveGroups(limit: 5000, filter: {
      datetime_geq: "${since.toISOString()}", datetime_lt: "${now.toISOString()}",
      clientRequestPath_like: "/api/v1/app/%"
    }) { count dimensions { clientRequestPath } }
  } } }`;
  try {
    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await response.json()) as {
      data?: {
        viewer?: {
          zones?: {
            httpRequestsAdaptiveGroups?: {
              count: number;
              dimensions: { clientRequestPath: string };
            }[];
          }[];
        };
      };
    };
    const groups = data.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups;
    if (!groups) return null;
    const apps = new Map<string, number>();
    const resources = new Map<string, number>();
    let total = 0;
    for (const { count, dimensions } of groups) {
      // The app names itself as the first segment after /api/v1/app/ (the analytics on this
      // plan cannot see query strings).
      const [, first = ''] = /^\/api\/v1\/app\/([^/]+)/.exec(dimensions.clientRequestPath) ?? [];
      const app = APPS.has(first) ? first : 'other';
      apps.set(app, (apps.get(app) ?? 0) + count);
      const resource = resourceOf(dimensions.clientRequestPath.replace(/^(\/api\/v1\/app\/)(?:adhan|quran|masahif)\//, '$1'));
      resources.set(resource, (resources.get(resource) ?? 0) + count);
      total += count;
    }
    const sorted = (map: Map<string, number>) => [...map].sort((a, b) => b[1] - a[1]);
    return {
      apps: sorted(apps).map(([app, count]) => ({ app, count })),
      resources: sorted(resources)
        .slice(0, 12)
        .map(([resource, count]) => ({ resource, count })),
      total,
    };
  } catch {
    return null;
  }
}
