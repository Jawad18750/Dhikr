import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE } from '@/lib/reader/guard';
import { surahOf } from '@/lib/reader/params';
import { readerAvailable, readerStars } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Where the mushaf prints «۞» in a surah, to map timing-corpus words to its own count. */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'layout');
  if ('response' in passed) return passed.response;
  const surah = surahOf((await params).surah);
  if (!surah) return denied(400);
  return NextResponse.json(await readerStars(surah), {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
