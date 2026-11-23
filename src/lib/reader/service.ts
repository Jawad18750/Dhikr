// Server only: imported by the reader's API routes alone.

/**
 * The render service (packages/reader_server in the app monorepo), reached on this
 * machine only, with its token. Everything it returns stays on the server: the SVG is
 * turned into pixels here (raster.ts) before anything reaches a browser.
 */
const base = () => process.env.READER_URL ?? '';
const token = () => process.env.READER_TOKEN ?? '';

/** A surah as one line at a height in pixels: its width and how it is cut into tiles. */
export type ReaderStrip = { surah: number; height: number; width: number; tile: number; tiles: number };

export const readerAvailable = () => base() !== '' && token().length >= 24;

async function call(path: string, params: Record<string, string | number>) {
  const url = new URL(path, base());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const response = await fetch(url, {
    headers: { 'x-reader-token': token() },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`reader ${path}: ${response.status}`);
  return response;
}

export async function readerStrip(surah: number, height: number): Promise<ReaderStrip> {
  return (await call('/strip', { surah, height })).json() as Promise<ReaderStrip>;
}

export async function readerStripTile(
  surah: number,
  height: number,
  tile: number,
  theme: 'light' | 'dark'
): Promise<string> {
  return (await call('/strip/tile', { surah, height, tile, theme })).text();
}

/** The lit word on a transparent overlay of the tile(s) it sits in, and the first tile. */
export async function readerStripWord(
  surah: number,
  height: number,
  ayah: number,
  word: number,
  theme: 'light' | 'dark'
): Promise<{ svg: string; tile: number }> {
  const response = await call('/strip/word', { surah, height, ayah, word, theme });
  return { svg: await response.text(), tile: Number(response.headers.get('x-word-tile')) };
}

export async function readerStripHit(surah: number, height: number, x: number, y: number) {
  return (await call('/strip/hit', { surah, height, x, y })).json() as Promise<{
    ayah: number;
    word: number;
  } | null>;
}

/** The printed surah names (all 114 stacked in cells, or one) and a cell's width. */
export async function readerNames(
  height: number,
  surah?: number
): Promise<{ svg: string; cell: number }> {
  const params: Record<string, string | number> = { height };
  if (surah) params.surah = surah;
  const response = await call('/names', params);
  return { svg: await response.text(), cell: Number(response.headers.get('x-name-cell')) };
}

export async function readerStars(surah: number): Promise<Record<string, number>> {
  return (await call('/stars', { surah, zoom: 1.6 })).json() as Promise<Record<string, number>>;
}
