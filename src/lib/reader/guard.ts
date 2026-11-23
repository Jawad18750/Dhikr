// Server only: imported by the reader's API routes alone.

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

/**
 * The reader's gate (docs/reader-security.md): a signed session cookie scoped to the
 * reader's API, same-origin requests only, and limits sized for one real listener.
 */
export const READER_COOKIE = 'rdr';
const SESSION_HOURS = 6;

const secret = () => {
  const s = process.env.READER_SESSION_SECRET ?? '';
  if (s.length < 32) throw new Error('READER_SESSION_SECRET must be set (32+ chars)');
  return s;
};

const sign = (body: string) => createHmac('sha256', secret()).update(body).digest('base64url');

export function mintSession(): { value: string; maxAge: number } {
  const id = randomBytes(12).toString('base64url');
  const body = `${id}.${Date.now() + SESSION_HOURS * 3600_000}`;
  return { value: `${body}.${sign(body)}`, maxAge: SESSION_HOURS * 3600 };
}

/** The session id a valid, unexpired cookie carries, or null. */
export function readSession(value: string | undefined): string | null {
  if (!value) return null;
  const at = value.lastIndexOf('.');
  if (at < 0) return null;
  const body = value.slice(0, at);
  const given = Buffer.from(value.slice(at + 1));
  const want = Buffer.from(sign(body));
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  const [id, expires] = body.split('.');
  if (!id || !expires || Number(expires) < Date.now()) return null;
  return id;
}

/** A browser on this site asking, not a script or another page. */
export function sameOrigin(request: Request): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return false;
  const origin = request.headers.get('origin');
  if (origin) {
    // Behind the proxy the request's own URL is the local listener, so the origin is
    // checked against the site's public address and the Host the proxy passed on.
    const hosts = new Set<string>();
    try {
      hosts.add(new URL(process.env.NEXT_PUBLIC_APP_URL ?? '').host);
    } catch {
      /* no public address configured (development) */
    }
    const forwarded = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    if (forwarded) hosts.add(forwarded.split(',')[0].trim());
    try {
      hosts.add(new URL(request.url).host);
      return hosts.has(new URL(origin).host);
    } catch {
      return false;
    }
  }
  return site === 'same-origin';
}

export const clientAddress = (request: Request) =>
  request.headers.get('cf-connecting-ip') ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  'local';

/** Sliding-window counters, in memory (one server process). */
const windows = new Map<string, number[]>();
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  if (windows.size > 20_000) {
    for (const [k, v] of windows) if (!v.some((t) => now - t < windowMs)) windows.delete(k);
  }
  return true;
}

/** 32 bits naming the session, woven into the images it is served (raster.ts). */
export const sessionTag = (session: string) =>
  createHash('sha256').update(session).digest().readUInt32BE(0);

export const denied = (status: number) =>
  new NextResponse(null, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * The gate every reader request passes: same origin, a session, and the session's and
 * address's budgets for [kind]. Returns the session id, or the response to send.
 */
export function gate(
  request: Request,
  cookie: string | undefined,
  kind: 'layout' | 'row' | 'lit' | 'hit'
): { session: string } | { response: NextResponse } {
  if (!sameOrigin(request)) return { response: denied(403) };
  const session = readSession(cookie);
  if (!session) return { response: denied(401) };
  const address = clientAddress(request);
  // Per minute per session, and per hour per address: roomy for one listener, far
  // short of what collecting the book would take.
  const minute: Record<typeof kind, number> = { layout: 30, row: 240, lit: 600, hit: 60 };
  const hour: Record<typeof kind, number> = { layout: 400, row: 4000, lit: 12000, hit: 1200 };
  if (
    !allow(`${kind}:s:${session}`, minute[kind], 60_000) ||
    !allow(`${kind}:a:${address}`, hour[kind], 3600_000)
  ) {
    return { response: denied(429) };
  }
  return { session };
}
