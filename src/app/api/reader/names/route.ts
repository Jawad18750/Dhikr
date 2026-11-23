import { cookies } from 'next/headers';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerNames } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The surah names as مصحف الجماهيرية prints them, as one PNG: a cell per surah (1 to 114,
 * top to bottom), or `?surah=` alone. Pixels only, black ink the page colours as a mask,
 * and the cell's width (X-Name-Cell); never the shapes.
 */
export async function GET(request: Request) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'names');
  if ('response' in passed) return passed.response;
  const q = new URL(request.url).searchParams;
  const height = Math.round(Number(q.get('height')) / 2) * 2;
  const surah = q.has('surah') ? Number(q.get('surah')) : undefined;
  if (!Number.isFinite(height) || height < 20 || height > 160) return denied(400);
  if (surah !== undefined && (!Number.isInteger(surah) || surah < 1 || surah > 114)) return denied(400);
  let drawn: Awaited<ReturnType<typeof readerNames>>;
  try {
    drawn = await readerNames(height, surah);
  } catch {
    return denied(404);
  }
  return png(drawn.svg, sessionTag(passed.session), { 'X-Name-Cell': String(drawn.cell) });
}
