import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { surahOf, widthOf, zoomOf } from '@/lib/reader/params';
import { rasterise } from '@/lib/reader/raster';
import { readerAvailable, readerRowSvg } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One line of the printed ink as a PNG, or, with `ayah` and `word`, only that word's ink
 * in the lit colour (laid over the line by the page): pixels only, never shapes or
 * coordinates.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ surah: string; row: string }> }
) {
  if (!readerAvailable()) return denied(503);
  const q = new URL(request.url).searchParams;
  const lit = q.has('ayah') && q.has('word');
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, lit ? 'lit' : 'row');
  if ('response' in passed) return passed.response;
  const { surah: s, row: r } = await params;
  const surah = surahOf(s);
  const zoom = zoomOf(q.get('zoom'));
  const width = widthOf(q.get('width'));
  const row = Number(r);
  if (!surah || !zoom || !width || !Number.isInteger(row) || row < 0 || row > 4000) {
    return denied(400);
  }
  const theme = q.get('theme') === 'dark' ? 'dark' : 'light';
  const word = lit ? { ayah: Number(q.get('ayah')), word: Number(q.get('word')) } : undefined;
  if (word && (!Number.isInteger(word.ayah) || !Number.isInteger(word.word))) return denied(400);
  let svg: string;
  try {
    svg = await readerRowSvg(surah, zoom, row, width, theme, word);
  } catch {
    return denied(404);
  }
  const png = await rasterise(svg, sessionTag(passed.session));
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'private, no-store',
      'Content-Disposition': 'inline',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
