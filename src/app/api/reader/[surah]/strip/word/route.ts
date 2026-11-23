import { cookies } from 'next/headers';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { heightOf, surahOf } from '@/lib/reader/params';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerStripWord } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The word being recited, its own ink in the lit colour, on a transparent overlay of the
 * tile it sits in (two where it crosses a seam), and that tile's number (X-Tile). No box
 * and no coordinate: its place exists only as the overlay's pixels, as on the screen.
 */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'lit');
  if ('response' in passed) return passed.response;
  const q = new URL(request.url).searchParams;
  const surah = surahOf((await params).surah);
  const height = heightOf(q.get('height'));
  const ayah = Number(q.get('ayah'));
  const word = Number(q.get('word'));
  if (!surah || !height || !Number.isInteger(ayah) || !Number.isInteger(word)) return denied(400);
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light';
  let drawn: Awaited<ReturnType<typeof readerStripWord>>;
  try {
    drawn = await readerStripWord(surah, height, ayah, word, theme);
  } catch {
    return denied(404);
  }
  return png(drawn.svg, sessionTag(passed.session), { 'X-Tile': String(drawn.tile) });
}
