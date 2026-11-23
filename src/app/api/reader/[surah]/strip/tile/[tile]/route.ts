import { cookies } from 'next/headers';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { heightOf, surahOf } from '@/lib/reader/params';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerStripTile } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** One stretch of the line as a PNG, counted from its left end: pixels only. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ surah: string; tile: string }> }
) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'row');
  if ('response' in passed) return passed.response;
  const { surah: s, tile: t } = await params;
  const q = new URL(request.url).searchParams;
  const surah = surahOf(s);
  const height = heightOf(q.get('height'));
  const tile = Number(t);
  if (!surah || !height || !Number.isInteger(tile) || tile < 0 || tile > 2000) return denied(400);
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light';
  let svg: string;
  try {
    svg = await readerStripTile(surah, height, tile, theme);
  } catch {
    return denied(404);
  }
  return png(svg, sessionTag(passed.session));
}
