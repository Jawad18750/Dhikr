import { cookies } from 'next/headers';

import { denied, gate, READER_COOKIE, sessionTag } from '@/lib/reader/guard';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerAyah } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One ayah as مصحف الجماهيرية prints it, for quoting it anywhere on the site (tafsir,
 * library, tools): `?surah=&ayah=&height=&width=[&word=]` (a line's height and the column's
 * width; the ayah wraps to it; `word` draws that word alone). Pixels only, black ink the page colours as a mask, never the
 * shapes.
 *
 * Asked for by this site's pages only (same origin), in a reader session, within budgets
 * per session and per address, with the session's tag woven into the ink (raster.ts), and
 * kept in the browser's own cache (never a shared one).
 */
export async function GET(request: Request) {
  if (!readerAvailable()) return denied(503);
  const passed = gate(request, (await cookies()).get(READER_COOKIE)?.value, 'ink');
  if ('response' in passed) return passed.response;
  const q = new URL(request.url).searchParams;
  const surah = Number(q.get('surah'));
  const ayah = Number(q.get('ayah'));
  // Steps keep the cache small: heights by 10 px, widths by 40 px.
  const height = Math.round(Number(q.get('height')) / 10) * 10;
  const width = Math.round(Number(q.get('width')) / 40) * 40;
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return denied(400);
  if (!Number.isInteger(ayah) || ayah < 1 || ayah > 286) return denied(400);
  if (height < 60 || height > 200 || width < 120 || width > 2400) return denied(400);
  const word = q.has('word') ? Number(q.get('word')) : undefined;
  if (word !== undefined && (!Number.isInteger(word) || word < 1 || word > 200)) return denied(400);
  let svg: string;
  try {
    svg = await readerAyah(surah, ayah, height, width, word);
  } catch {
    return denied(404);
  }
  return png(svg, sessionTag(passed.session), { 'Cache-Control': 'private, max-age=2592000, immutable' });
}
