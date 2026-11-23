// Server only: API keys, the email link's spam guards, and what an account has used.
import { createHash, randomBytes } from 'node:crypto';

import { pool } from '@/lib/database';

/** A key: «dk_» and 40 random URL-safe characters. Only its SHA-256 is kept. */
export const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

export async function createApiKey(userId: number, name: string) {
  const key = `dk_${randomBytes(30).toString('base64url')}`;
  const prefix = key.slice(0, 10);
  const label = name.trim().slice(0, 60) || 'مفتاح';
  const { rows } = await pool.query<{ count: string }>(
    'SELECT count(*) FROM api_keys WHERE "userId" = $1 AND revoked_at IS NULL',
    [userId]
  );
  if (Number(rows[0]?.count ?? 0) >= 10) return null;
  await pool.query('INSERT INTO api_keys ("userId", name, prefix, hash) VALUES ($1, $2, $3, $4)', [
    userId,
    label,
    prefix,
    hashKey(key),
  ]);
  return { key, prefix, name: label };
}

export type KeyRow = {
  id: number;
  name: string;
  prefix: string;
  created_at: Date;
  last_used_at: Date | null;
};

export async function listKeys(userId: number) {
  const { rows } = await pool.query<KeyRow>(
    `SELECT id, name, prefix, created_at, last_used_at FROM api_keys
     WHERE "userId" = $1 AND revoked_at IS NULL ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

export async function revokeKey(userId: number, id: number) {
  await pool.query('UPDATE api_keys SET revoked_at = now() WHERE id = $1 AND "userId" = $2', [id, userId]);
}

/** What this account used in the last 30 days: API calls by endpoint, and bulk downloads. */
export async function usageOf(userId: number) {
  const [calls, byPath, downloads] = await Promise.all([
    pool.query<{ count: string }>(
      `SELECT count(*) FROM api_requests WHERE "userId" = $1 AND at > now() - interval '30 days'`,
      [userId]
    ),
    pool.query<{ path: string; count: string }>(
      `SELECT regexp_replace(path, '/[^/]+/[0-9]+$', '/…') AS path, count(*) FROM api_requests
       WHERE "userId" = $1 AND at > now() - interval '30 days' GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
      [userId]
    ),
    pool.query<{ count: string }>(
      `SELECT count(*) FROM downloads WHERE "userId" = $1 AND at > now() - interval '30 days'`,
      [userId]
    ),
  ]);
  return {
    calls: Number(calls.rows[0]?.count ?? 0),
    byPath: byPath.rows.map((r) => ({ path: r.path, count: Number(r.count) })),
    downloads: Number(downloads.rows[0]?.count ?? 0),
  };
}

/** Cloudflare Turnstile: the email form was sent by a person, not a script. */
export async function humanCheck(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!response?.ok) return false;
  const data = (await response.json()) as { success?: boolean };
  return data.success === true;
}

/** Sliding windows in this process: a few links per address and per email an hour. */
const windows = new Map<string, number[]>();
export function allowOnce(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  if (windows.size > 50_000) windows.clear();
  return true;
}
