// Server only: the library pages and its API read the books through here.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * The library: the books the Dhikr apps carry, read from the apps' own files (the same
 * bytes the apps ship), so the site and the apps never hold two different texts.
 *
 * CONTENT_ROOT points at a copy of the apps' data (scripts/sync-content.sh puts one on the
 * server; locally, the apps' checkout or the default .content folder). Layout, as in the apps:
 *   app/assets/data/library/index.json          categories and books
 *   app/assets/data/library/books/<id>.json.br  one book: chapters → sections → blocks
 *   app/assets/images/library/<cover>           covers
 */
const ROOT = process.env.CONTENT_ROOT ?? path.join(process.cwd(), '.content');
const LIBRARY = path.join(ROOT, 'app/assets/data/library');

export type Category = { id: string; title: string; subtitle: string; order: number };

export type BookMeta = {
  id: string;
  category: string;
  title: string;
  shortTitle: string | null;
  author: string | null;
  subtitle: string | null;
  /** Blocks of text (paragraphs, headings …): how big the book is. */
  items: number;
  hasCover: boolean;
  order: number;
};

export type Block = {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'footnote';
  text: string;
  /** The printed page, where the book records it. */
  page?: number;
  /** A heading's entry in the contents. */
  toc?: string;
  level?: number;
};

export type Section = { id: string; number: number; title: string; blocks: Block[] };
export type Chapter = { id: string; number: number; title: string; sections: Section[] };
export type Book = BookMeta & { source: { name: string; url: string }; chapters: Chapter[] };

type RawBlock = {
  id: string;
  type: Block['type'];
  text_ar: string;
  page?: number;
  toc_title_ar?: string;
  level?: number;
};
type RawBook = {
  source?: { name?: string; url?: string };
  chapters: {
    id: string;
    number: number;
    title_ar: string;
    sections: { id: string; number: number; title_ar: string; blocks: RawBlock[] }[];
  }[];
};
type RawIndex = {
  categories: { id: string; title_ar: string; subtitle_ar?: string; sort_order: number }[];
  books: {
    id: string;
    category_id: string;
    type: string;
    title_ar: string;
    short_title_ar?: string;
    author_ar?: string;
    subtitle_ar?: string;
    cover_asset?: string;
    status?: string;
    source_kind?: string;
    item_count?: number;
    sort_order?: number;
  }[];
};

const readJson = <T>(file: string): T => {
  const bytes = fs.readFileSync(file);
  return JSON.parse((file.endsWith('.br') ? zlib.brotliDecompressSync(bytes) : bytes).toString('utf8')) as T;
};

let indexCache: { at: number; categories: Category[]; books: BookMeta[]; covers: Map<string, string> } | null =
  null;

/** The categories and the books that can be read here (prose books with their text). */
export function libraryIndex() {
  if (indexCache && Date.now() - indexCache.at < 10 * 60_000) return indexCache;
  const raw = readJson<RawIndex>(path.join(LIBRARY, 'index.json'));
  const covers = new Map<string, string>();
  const books: BookMeta[] = [];
  for (const b of raw.books) {
    // Every cover, the tafsirs' too; the reader below is for prose books.
    const cover = b.cover_asset ? path.join(ROOT, 'app', b.cover_asset) : null;
    if (cover && fs.existsSync(cover)) covers.set(b.id, cover);
    if (b.type !== 'proseBook' || b.source_kind !== 'asset' || b.status === 'placeholder') continue;
    if (!fs.existsSync(path.join(LIBRARY, 'books', `${b.id}.json.br`))) continue;
    books.push({
      id: b.id,
      category: b.category_id,
      title: b.title_ar,
      shortTitle: b.short_title_ar ?? null,
      author: b.author_ar || null,
      subtitle: b.subtitle_ar || null,
      items: b.item_count ?? 0,
      hasCover: covers.has(b.id),
      order: b.sort_order ?? 0,
    });
  }
  const categories = raw.categories
    .map((c) => ({ id: c.id, title: c.title_ar, subtitle: c.subtitle_ar ?? '', order: c.sort_order }))
    .filter((c) => books.some((b) => b.category === c.id) || c.id === 'tafsir' || c.id === 'hadith')
    .sort((a, b) => a.order - b.order);
  indexCache = { at: Date.now(), categories, books: books.sort((a, b) => a.order - b.order), covers };
  return indexCache;
}

export const coverPath = (id: string) => libraryIndex().covers.get(id) ?? null;

// A few books parsed at a time; the rest are read again when asked for.
const books = new Map<string, Book>();
const KEEP = 6;

export function loadBook(id: string): Book | null {
  if (!/^[a-z0-9_]+$/.test(id)) return null;
  const cached = books.get(id);
  if (cached) {
    books.delete(id);
    books.set(id, cached);
    return cached;
  }
  const meta = libraryIndex().books.find((b) => b.id === id);
  if (!meta) return null;
  const raw = readJson<RawBook>(path.join(LIBRARY, 'books', `${id}.json.br`));
  const book: Book = {
    ...meta,
    source: { name: raw.source?.name ?? '', url: raw.source?.url ?? '' },
    chapters: raw.chapters.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title_ar,
      sections: c.sections.map((s) => ({
        id: s.id,
        number: s.number,
        title: s.title_ar,
        blocks: s.blocks.map((b) => ({
          id: b.id,
          type: b.type,
          text: b.text_ar,
          ...(b.page ? { page: b.page } : {}),
          ...(b.toc_title_ar ? { toc: b.toc_title_ar } : {}),
          ...(b.level ? { level: b.level } : {}),
        })),
      })),
    })),
  };
  books.set(id, book);
  if (books.size > KEEP) books.delete(books.keys().next().value as string);
  return book;
}

/** Every section in reading order, with the title the contents should show. */
export function sectionsOf(book: Book) {
  return book.chapters.flatMap((chapter) =>
    chapter.sections.map((section) => {
      const heading = section.blocks.find((b) => b.toc);
      const paged = /^صفحة \d+$/.test(section.title);
      return {
        chapter,
        section,
        // A section cut at a printed page is named by its first heading, where it has one.
        title: paged && heading?.toc ? heading.toc : section.title,
        headings: section.blocks.filter((b) => b.toc).map((b) => b.toc as string),
      };
    })
  );
}

/** A section's URL segment: its number within the book, from 1. */
export function sectionAt(book: Book, n: number) {
  const all = sectionsOf(book);
  return n >= 1 && n <= all.length ? { ...all[n - 1], index: n, total: all.length } : null;
}
