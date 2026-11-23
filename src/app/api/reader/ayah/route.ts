import { allow, clientAddress, denied, sameOrigin } from '@/lib/reader/guard';
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
 * Asked for by this site's pages only (same origin), within budgets per address, and
 * kept in the browser's own cache (never a shared one).
 */
export async function GET(request: Request) {
  if (!readerAvailable()) return denied(503);
  if (!sameOrigin(request)) return denied(403);
  const address = clientAddress(request);
  if (!allow(`ayah:m:${address}`, 240, 60_000) || !allow(`ayah:h:${address}`, 1500, 3600_000)) return denied(429);
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
  return png(svg, 0, { 'Cache-Control': 'private, max-age=2592000, immutable' });
}
