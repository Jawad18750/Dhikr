// Server only: the keyed public API (/api/v1). Every call carries a personal key; each is
// limited per key and logged per account, so the numbers about what is used are real.
import { hashKey } from '@/lib/account';
import { pool } from '@/lib/database';

export const LICENSE = 'CC BY-NC 4.0';
export const LICENSE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/';
export const DOCS_URL = 'https://dhikr.ly/developers';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization',
  'Access-Control-Max-Age': '86400',
};

/** The answer to a browser's preflight: any site may call the API with its key. */
export const preflight = () => new Response(null, { status: 204, headers: CORS });

type Holder = { keyId: number; userId: number } | null;
const keys = new Map<string, { at: number; holder: Holder }>();
const lastTouched = new Map<number, number>();
const windows = new Map<string, number[]>();

function within(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  return true;
}

async function holderOf(key: string): Promise<Holder> {
  const hash = hashKey(key);
  const held = keys.get(hash);
  if (held && Date.now() - held.at < 60_000) return held.holder;
  const { rows } = await pool.query<{ id: number; userId: number }>(
    'SELECT id, "userId" FROM api_keys WHERE hash = $1 AND revoked_at IS NULL',
    [hash]
  );
  const holder = rows[0] ? { keyId: rows[0].id, userId: rows[0].userId } : null;
  keys.set(hash, { at: Date.now(), holder });
  if (keys.size > 10_000) keys.clear();
  return holder;
}

const json = (body: unknown, status: number, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-License': LICENSE,
      Link: `<${LICENSE_URL}>; rel="license", <${DOCS_URL}>; rel="help"`,
      ...CORS,
      ...extra,
    },
  });

const fail = (status: number, code: string, message: string) =>
  json({ error: { code, message, docs: DOCS_URL } }, status);

/**
 * Runs [answer] for a caller with a valid key, within its limits (120 a minute, 20 000 a
 * day), and logs the call. [answer] returns the data, or null for «not found».
 */
export async function keyed(request: Request, answer: () => Promise<unknown>) {
  const started = Date.now();
  const path = new URL(request.url).pathname;
  const header = request.headers.get('authorization') ?? '';
  const key = /^Bearer\s+(dk_[A-Za-z0-9_-]{20,})$/.exec(header.trim())?.[1];
  if (!key) return fail(401, 'missing_key', 'Send your key as «Authorization: Bearer dk_…».');
  const holder = await holderOf(key);
  if (!holder) return fail(401, 'invalid_key', 'This key does not exist or was revoked.');
  if (!within(`m:${holder.keyId}`, 120, 60_000) || !within(`d:${holder.keyId}`, 20_000, 86_400_000)) {
    return fail(429, 'rate_limited', 'Too many requests for this key; slow down.');
  }

  let status = 200;
  let response: Response;
  try {
    const data = await answer();
    if (data === null) {
      status = 404;
      response = fail(404, 'not_found', 'Nothing here: check the reciter and the surah.');
    } else {
      response = json({ data, license: LICENSE, attribution: 'ذكر · dhikr.ly' }, 200);
    }
  } catch {
    status = 502;
    response = fail(502, 'upstream', 'The data source did not answer; try again shortly.');
  }

  // The log and the key's last use, after the answer is ready; never in its way.
  const bytes = Number(response.headers.get('content-length')) || null;
  const country = request.headers.get('cf-ipcountry');
  void pool
    .query(
      'INSERT INTO api_requests (key_id, "userId", path, status, bytes, ms, country) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [holder.keyId, holder.userId, path, status, bytes, Date.now() - started, country]
    )
    .catch(() => {});
  if (Date.now() - (lastTouched.get(holder.keyId) ?? 0) > 60_000) {
    lastTouched.set(holder.keyId, Date.now());
    void pool.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1', [holder.keyId]).catch(() => {});
  }
  return response;
}
