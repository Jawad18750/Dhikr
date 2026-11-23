// Server only: imported by the reader's API routes alone.

/**
 * The render service (packages/reader_server in the app monorepo), reached on this
 * machine only, with its token. Everything it returns stays on the server: the SVG is
 * turned into pixels here (raster.ts) before anything reaches a browser.
 */
const base = () => process.env.READER_URL ?? '';
const token = () => process.env.READER_TOKEN ?? '';

export const READER_ZOOMS = [1.3, 1.6, 2.0, 2.5] as const;

export type ReaderLayout = {
  surah: number;
  zoom: number;
  column: number;
  rows: {
    top: number;
    height: number;
    y0: number;
    y1: number;
    kind: 'text' | 'header' | 'basmala';
    /** [ayah, first word, last word] for each ayah with words on the row. */
    words: [number, number, number][];
  }[];
};

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

export async function readerLayout(surah: number, zoom: number): Promise<ReaderLayout> {
  return (await call('/layout', { surah, zoom })).json() as Promise<ReaderLayout>;
}

export async function readerRowSvg(
  surah: number,
  zoom: number,
  row: number,
  width: number,
  theme: 'light' | 'dark',
  lit?: { ayah: number; word: number }
): Promise<string> {
  const params: Record<string, string | number> = { surah, zoom, row, width, theme };
  if (lit) {
    params.ayah = lit.ayah;
    params.word = lit.word;
  }
  return (await call('/row', params)).text();
}

export async function readerHit(surah: number, zoom: number, row: number, x: number, y: number) {
  return (await call('/hit', { surah, zoom, row, x, y })).json() as Promise<{
    ayah: number;
    word: number;
  } | null>;
}

export async function readerStars(surah: number): Promise<Record<string, number>> {
  return (await call('/stars', { surah, zoom: 1.6 })).json() as Promise<Record<string, number>>;
}
