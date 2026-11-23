import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE } from '@/lib/reader/guard';
import { heightOf, surahOf } from '@/lib/reader/params';
import { readerAvailable, readerStripHit } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Which word a tap landed on: a place on the line in, (ayah, word) out. */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'hit');
  if ('response' in passed) return passed.response;
  const q = new URL(request.url).searchParams;
  const surah = surahOf((await params).surah);
  const height = heightOf(q.get('height'));
  const x = Number(q.get('x'));
  const y = Number(q.get('y'));
  if (!surah || !height || !Number.isFinite(x) || !Number.isFinite(y)) return denied(400);
  return NextResponse.json(await readerStripHit(surah, height, x, y), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
