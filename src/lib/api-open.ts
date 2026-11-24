// Server only: the open part of the API, free without a key or an account (prayer times).
import { allow } from '@/lib/reader/guard';

export const OPEN_CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export const openPreflight = () => new Response(null, { status: 204, headers: OPEN_CORS });

const address = (request: Request) =>
  request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

/**
 * Answers an open call: no key, no login. Within a generous budget per address (the data
 * changes once a year, so callers should cache), and cached at the edge for an hour.
 */
export async function open(
  request: Request,
  attribution: { license: string; source: string; site: string },
  answer: () => unknown
) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', ...OPEN_CORS };
  const who = address(request);
  if (!allow(`open:m:${who}`, 120, 60_000) || !allow(`open:h:${who}`, 3000, 3_600_000)) {
    return new Response(JSON.stringify({ error: { code: 'slow_down', message: 'Too many calls; cache the answers (the tables change once a year).' } }), {
      status: 429,
      headers: { ...headers, 'Retry-After': '60' },
    });
  }
  const data = answer();
  if (data === null) {
    return new Response(JSON.stringify({ error: { code: 'not_found', message: 'No such city or date.', docs: attribution.site } }), { status: 404, headers });
  }
  return new Response(JSON.stringify({ data, ...attribution }), {
    status: 200,
    headers: { ...headers, 'Cache-Control': 'public, max-age=3600, s-maxage=3600' },
  });
}
