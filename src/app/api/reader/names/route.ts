import { allow, clientAddress, denied, sameOrigin } from '@/lib/reader/guard';
import { png } from '@/lib/reader/raster';
import { readerAvailable, readerNames } from '@/lib/reader/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The surah names as مصحف الجماهيرية prints them, as one PNG: a cell per surah (1 to 114,
 * top to bottom), or `?surah=` alone, and the cell's width (X-Name-Cell). Pixels only,
 * black ink the page colours as a mask, never the shapes.
 *
 * Asked for by this site's pages only (same origin), within a budget per address, and kept
 * in the browser's own cache for a month (never a shared one), so the names show at once
 * on every visit after the first. No reader session: names must not wait for one.
 */
export async function GET(request: Request) {
  if (!readerAvailable()) return denied(503);
  if (!sameOrigin(request)) return denied(403);
  if (!allow(`names:a:${clientAddress(request)}`, 120, 3600_000)) return denied(429);
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
  return png(drawn.svg, 0, {
    'X-Name-Cell': String(drawn.cell),
    'Cache-Control': 'private, max-age=2592000, immutable',
  });
}
