import { NextResponse } from 'next/server';

import { allow, clientAddress, denied, mintSession, READER_COOKIE, sameOrigin } from '@/lib/reader/guard';
import { readerAvailable } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A reading session: a signed cookie the other reader routes require. */
export async function POST(request: Request) {
  if (!readerAvailable()) return denied(503);
  if (!sameOrigin(request)) return denied(403);
  if (!allow(`session:a:${clientAddress(request)}`, 30, 3600_000)) return denied(429);
  const { value, maxAge } = mintSession();
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  response.cookies.set(READER_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/reader',
    maxAge,
  });
  return response;
}
