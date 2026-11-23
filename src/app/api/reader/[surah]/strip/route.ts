import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE } from '@/lib/reader/guard';
import { heightOf, surahOf } from '@/lib/reader/params';
import { readerAvailable, readerStrip } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A surah as one line at a height: its width in pixels and its tiles. Nothing else. */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'layout');
  if ('response' in passed) return passed.response;
  const surah = surahOf((await params).surah);
  const height = heightOf(new URL(request.url).searchParams.get('height'));
  if (!surah || !height) return denied(400);
  const strip = await readerStrip(surah, height);
  return NextResponse.json(
    { width: strip.width, height: strip.height, tile: strip.tile, tiles: strip.tiles },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
