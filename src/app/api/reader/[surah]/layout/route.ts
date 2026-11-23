import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE } from '@/lib/reader/guard';
import { surahOf, zoomOf } from '@/lib/reader/params';
import { readerAvailable, readerLayout } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A surah's rows at a text size: their heights and the word ranges on each. */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'layout');
  if ('response' in passed) return passed.response;
  const surah = surahOf((await params).surah);
  const zoom = zoomOf(new URL(request.url).searchParams.get('zoom'));
  if (!surah || !zoom) return denied(400);
  const layout = await readerLayout(surah, zoom);
  return NextResponse.json(layout, { headers: { 'Cache-Control': 'private, no-store' } });
}
