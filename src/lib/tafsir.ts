// Server only: the tafsir pages and their API read through here.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import { hafsForQalun } from '@/lib/ayah-numbering';

/**
 * The tafsirs the apps carry, from the apps' own files (one per surah: [Hafs ayah, text]),
 * shown against our ayahs (Qalun, as the Jamahiriya mushaf numbers them) through the same
 * numbering tables the converter uses. An entry may explain several ayahs at once (al-
 * Jalalayn groups them): it is filed under the first, and covers up to the next entry.
 */
const ROOT = process.env.CONTENT_ROOT ?? '/Users/jawad/Developer/dhikr/dhikr-app';
const LIBRARY = path.join(ROOT, 'app/assets/data/library');

export type TafsirMeta = { id: string; folder: string; title: string; author: string; hasCover: boolean };

type RawIndex = {
  books: { id: string; type: string; title_ar: string; author_ar?: string; asset?: string; cover_asset?: string }[];
};

let metaCache: TafsirMeta[] | null = null;

/** The tafsirs, in the apps' order; `id` is the URL name (saadi, ibn_kathir …). */
export function tafsirs(): TafsirMeta[] {
  if (metaCache) return metaCache;
  const raw = JSON.parse(fs.readFileSync(path.join(LIBRARY, 'index.json'), 'utf8')) as RawIndex;
  metaCache = raw.books
    .filter((b) => b.type === 'tafsirBook' && b.asset)
    .map((b) => {
      const folder = path.basename(b.asset as string);
      return {
        id: folder,
        folder,
        title: b.title_ar,
        author: b.author_ar ?? '',
        hasCover: Boolean(b.cover_asset && fs.existsSync(path.join(ROOT, 'app', b.cover_asset))),
      };
    })
    .filter((t) => fs.existsSync(path.join(LIBRARY, 'tafsir', t.folder)));
  return metaCache;
}

/** The book id the library index uses for a tafsir (its cover is filed under it). */
export const libraryIdOf = (id: string) => `tafsir_${id}`;

const surahs = new Map<string, [number, string][]>();

function surahEntries(id: string, surah: number): [number, string][] | null {
  const meta = tafsirs().find((t) => t.id === id);
  if (!meta || !Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  const key = `${id}:${surah}`;
  const cached = surahs.get(key);
  if (cached) return cached;
  const file = path.join(LIBRARY, 'tafsir', meta.folder, `${String(surah).padStart(3, '0')}.json.br`);
  if (!fs.existsSync(file)) return null;
  const entries = (JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString('utf8')) as [
    number,
    string,
  ][]).map(([ayah, text]) => [ayah, clean(text)] as [number, string]);
  surahs.set(key, entries);
  if (surahs.size > 40) surahs.delete(surahs.keys().next().value as string);
  return entries;
}

/** Printing artefacts left in the sources: Ibn ʿAṭiyya's «(p-١١٠)» page marks. */
const clean = (text: string) => text.replace(/\(p-[\d٠-٩]+\)/g, '').trim();

export type TafsirPassage = {
  /** The Hafs ayahs this passage explains (one, or a group). */
  hafs: [number, number];
  text: string;
};

/**
 * The commentary on one of our ayahs: every passage whose Hafs range meets the Hafs ayahs
 * the Qalun ayah reads, each once.
 */
export function tafsirFor(id: string, surah: number, ayah: number): TafsirPassage[] | null {
  const entries = surahEntries(id, surah);
  if (!entries) return null;
  // Al-Fatiha's first ayah also carries the commentary on the basmala, unnumbered in Qalun.
  const wanted = surah === 1 && ayah === 1 ? [1, 2] : hafsForQalun(surah, ayah);
  if (wanted.length === 0) return null;
  const out: TafsirPassage[] = [];
  for (const [index, [start, text]] of entries.entries()) {
    const end = index + 1 < entries.length ? entries[index + 1][0] - 1 : Math.max(start, ...wanted);
    if (wanted.some((h) => h >= start && h <= end) && text) out.push({ hafs: [start, end], text });
  }
  return out;
}
