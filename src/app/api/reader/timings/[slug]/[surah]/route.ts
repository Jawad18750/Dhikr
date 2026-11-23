import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE } from '@/lib/reader/guard';
import { surahOf } from '@/lib/reader/params';
import { readerAvailable, readerStars } from '@/lib/reader/service';
import { fetchWordTimings } from '@/lib/reader/timings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** A recitation's word timings for one surah, in the mushaf's word count. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; surah: string }> }
) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'layout');
  if ('response' in passed) return passed.response;
  const { slug, surah: s } = await params;
  const surah = surahOf(s);
  if (!surah || !/^[a-z0-9_]+$/.test(slug)) return denied(400);
  const words = await fetchWordTimings(slug, surah, await readerStars(surah));
  return NextResponse.json({ words }, { headers: { 'Cache-Control': 'private, no-store' } });
}
