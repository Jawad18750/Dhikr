import { cookies } from 'next/headers';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerNames } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The surah names as مصحف الجماهيرية prints them, as one PNG: a cell per surah (1 to 114,
 * top to bottom), or `?surah=` alone, and the cell's width (X-Name-Cell). Pixels only,
 * black ink the page colours as a mask, never the shapes.
 *
 * Asked for by this site's pages only (same origin), in a reader session, within budgets
 * per session and per address, with the session's tag woven in, and kept in the browser's
 * own cache for a month (never a shared one), so the names show at once on every visit
 * after the first. The whole sheet is drawn no taller than a list needs (120 px a name).
 */
export async function GET(request: Request) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'names');
  if ('response' in passed) return passed.response;
  const q = new URL(request.url).searchParams;
  const height = Math.round(Number(q.get('height')) / 2) * 2;
  const surah = q.has('surah') ? Number(q.get('surah')) : undefined;
  if (!Number.isFinite(height) || height < 20 || height > (surah === undefined ? 120 : 160)) return denied(400);
  if (surah !== undefined && (!Number.isInteger(surah) || surah < 1 || surah > 114)) return denied(400);
  let drawn: Awaited<ReturnType<typeof readerNames>>;
  try {
    drawn = await readerNames(height, surah);
  } catch {
    return denied(404);
  }
  return png(drawn.svg, sessionTag(passed.session), {
    'X-Name-Cell': String(drawn.cell),
    'Cache-Control': 'private, max-age=2592000, immutable',
  });
}
