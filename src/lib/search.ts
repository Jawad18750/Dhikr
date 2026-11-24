// Server only: the site's search over its texts.
import { SURAHS } from '@/constants';
import { fold, foldLetter } from '@/lib/arabic-fold.mjs';
import { qalunForHafs } from '@/lib/ayah-numbering';
import { databaseAvailable, pool } from '@/lib/database';
import { collection, collections } from '@/lib/hadith';
import { libraryIndex, loadBook, sectionsOf } from '@/lib/library';
import { mawsuahArticle, mawsuahIndex, partsOf, type Run } from '@/lib/mawsuah';
import { qalunSurah } from '@/lib/qalun-text';
import { surahEntries, tafsirs } from '@/lib/tafsir';
import { removeTashkeel } from '@/utils';

/**
 * Search over what the site publishes as text: the Quran (Qalun), the hadith collections,
 * the thematic encyclopedia, the library's books, and the nine tafsirs. The tafsirs (170
 * million letters) are searched in Postgres, through a trigram index the indexer fills
 * (scripts/index-tafsir.mjs); the rest is held in memory.
 *
 * Everything is held in memory, folded the way Arabic is searched: no diacritics or Quranic
 * marks, one alef, ى as ي, ة as ه, hamza seats as their letters. In the Quran, whose
 * spelling is the mushaf's (الرحمٰن, الصلوٰة), alefs and spaces are dropped on both sides
 * as well, so «الرحمن» and «يا أيها» find it.
 */

export const GROUPS = [
  { id: 'quran', title: 'القرآن' },
  { id: 'hadith', title: 'الحديث' },
  { id: 'mawsuah', title: 'التفسير الموضوعي' },
  { id: 'tafsir', title: 'التفاسير' },
  { id: 'library', title: 'المكتبة' },
] as const;
export type Group = (typeof GROUPS)[number]['id'];

type Document = { group: Group; title: string; where: string; href: string; text: string; folded: string; surah?: number; ayah?: number };

/** The Quran's folding: alefs, lone hamzas and spaces dropped too (ءَامَنُواْ is آمنوا). */
const QURAN_DROP = /[ اء]/g;
/** The mushaf's و for alef before a final ة (الصلوٰة، الزكوٰة، الحيوٰة): dropped on both sides. */
const QURAN_WAW = /و(?=ه(?: |$))/g;
const quranFolded = (folded: string) => folded.replace(QURAN_WAW, '').replace(QURAN_DROP, '');
const foldQuran = (text: string) => quranFolded(fold(text));

const surahName = (n: number) => removeTashkeel(SURAHS.find((s) => s.id === n)?.name ?? '').replace(/^سورة\s+/, '');
const flatten = (runs: Run[] | undefined) =>
  (runs ?? []).map((r) => (typeof r === 'string' ? r : r[0] === 'q' ? `﴿${r[1]}﴾` : r[0] === 'a' ? ` ${r[4]}` : '')).join('');


function build(): Document[] {
  const entries: Document[] = [];
  for (let s = 1; s <= 114; s++) {
    for (const a of qalunSurah(s)) {
      entries.push({ group: 'quran', title: `${surahName(s)} ${a.ayah}`, where: `سورة ${surahName(s)}`, href: `/ayah/${s}/${a.ayah}`, text: a.text, folded: foldQuran(a.text), surah: s, ayah: a.ayah });
    }
  }
  for (const meta of collections()) {
    const c = collection(meta.slug);
    for (const h of c?.hadiths ?? []) {
      entries.push({ group: 'hadith', title: `${c!.title} ${h.number}`, where: h.title ?? h.chapter, href: `/hadith/${meta.slug}/${h.number}`, text: h.text, folded: fold(h.text) });
    }
  }
  for (const section of mawsuahIndex()?.sections ?? []) {
    for (const topic of section.topics) {
      const article = mawsuahArticle(topic.id);
      if (!article) continue;
      for (const [n, part] of partsOf(article).entries()) {
        const text = part.blocks
          .map((b) => [flatten(b.r), ...(b.items ?? []).map(flatten), ...(b.rows ?? []).flatMap((row) => row.map(flatten))].join(' '))
          .join('\n');
        entries.push({ group: 'mawsuah', title: topic.title_ar, where: part.title, href: `/mawsuah/${topic.id}/${n + 1}`, text, folded: fold(text) });
      }
    }
  }
  for (const meta of libraryIndex().books) {
    const book = loadBook(meta.id);
    if (!book) continue;
    for (const [n, s] of sectionsOf(book).entries()) {
      const text = s.section.blocks.map((b) => b.text).join('\n');
      entries.push({ group: 'library', title: book.title, where: s.title, href: `/library/${book.id}/${n + 1}`, text, folded: fold(text) });
    }
  }
  return entries;
}

let index: Document[] | null = null;
let building: Promise<Document[]> | null = null;
/** Built once, on the first search (a few seconds), then kept. */
async function documents(): Promise<Document[]> {
  if (index) return index;
  building ??= new Promise((resolve) => {
    setImmediate(() => {
      index = build();
      resolve(index);
    });
  });
  return building;
}

/** The text around the first match, as written (diacritics and all). */
function snippet(text: string, terms: string[], quran: boolean, size = 110): { before: string; match: string; after: string } {
  // Fold the text letter by letter, remembering where each folded letter came from.
  let folded = '';
  const from: number[] = [];
  let index_ = 0;
  for (const ch of text) {
    let f = foldLetter(ch);
    if (quran && (f === 'ا' || f === ' ' || f === 'ء')) f = '';
    for (const c of f) {
      folded += c;
      from.push(index_);
    }
    index_ += ch.length;
  }
  // The first term found, in the order given (the phrase, then the longest word).
  let at = -1;
  let length = 0;
  for (const term of terms) {
    const found = folded.indexOf(term);
    if (found !== -1) {
      at = found;
      length = term.length;
      break;
    }
  }
  if (at === -1) return { before: '', match: '', after: text.slice(0, size * 2) };
  const start = from[at];
  // The match runs to the last letter's end, its marks included.
  let end = at + length < from.length ? from[at + length] : text.length;
  while (end > start && /\s/.test(text[end - 1])) end--;
  const left = Math.max(0, start - size);
  const right = Math.min(text.length, end + size);
  return {
    before: (left > 0 ? '…' : '') + text.slice(left, start).replace(/^\S*\s/, left > 0 ? '' : '$&'),
    match: text.slice(start, end),
    after: text.slice(end, right).replace(/\s\S*$/, right < text.length ? '' : '$&') + (right < text.length ? '…' : ''),
  };
}

export type Hit = {
  group: Group;
  title: string;
  where: string;
  href: string;
  surah?: number;
  ayah?: number;
  text?: string;
  before: string;
  match: string;
  after: string;
};

export type Results = { query: string; counts: Record<Group, number>; hits: Hit[]; total: number };

const CAP = 1000;

/** The tafsir passages holding every word, phrase matches first: a page of them and how many. */
async function tafsirMatches(phrase: string, words: string[], offset: number, limit: number) {
  const none = { count: 0, hits: [] as Hit[] };
  // Only a word of three letters or more can use the index; without one, no scan of it all.
  if (!databaseAvailable() || !words.some((w) => w.length > 2)) return none;
  // Folded text holds letters, digits and spaces only, so nothing in it is a LIKE wildcard.
  const values: string[] = [];
  const conditions = words.map((w) => {
    values.push(w.length > 2 ? `%${w}%` : `% ${w} %`);
    return w.length > 2 ? `folded LIKE $${values.length}` : `(' ' || folded || ' ') LIKE $${values.length}`;
  });
  values.push(`%${phrase}%`);
  const exact = `$${values.length}`;
  const order = tafsirs().map((t) => t.id);
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '4s'");
    const { rows } = await client.query<{ tafsir: string; surah: number; hafs: number; n: string }>(
      // A passage the source files under each ayah it covers is shown once, at its first.
      `WITH m AS (
         SELECT tafsir, surah, hafs, folded LIKE ${exact} AS exact, md5(folded) AS same
         FROM tafsir_passages WHERE ${conditions.join(' AND ')} LIMIT ${CAP}),
       d AS (SELECT DISTINCT ON (tafsir, surah, same) tafsir, surah, hafs, exact FROM m ORDER BY tafsir, surah, same, hafs)
       SELECT tafsir, surah, hafs, count(*) OVER () AS n FROM d
       ORDER BY exact DESC, array_position($${values.length + 1}::text[], tafsir), surah, hafs
       OFFSET ${offset} LIMIT ${limit}`,
      [...values, order]
    );
    await client.query('COMMIT');
    const count = rows.length > 0 ? Number(rows[0].n) : 0;
    const titles = new Map(tafsirs().map((t) => [t.id, t.title]));
    return {
      count,
      hits: rows.map((r): Hit => {
        const text = (surahEntries(r.tafsir, r.surah) ?? []).find(([h]) => h === r.hafs)?.[1] ?? '';
        const ours = qalunForHafs(r.surah, r.hafs)[0] ?? 1;
        return {
          group: 'tafsir',
          title: `${surahName(r.surah)} ${ours}`,
          where: titles.get(r.tafsir) ?? r.tafsir,
          href: `/tafsir/${r.tafsir}/${r.surah}/${ours}`,
          ...snippet(text, [phrase, ...words.toSorted((a, b) => b.length - a.length)], false),
        };
      }),
    };
  } catch {
    await client.query('ROLLBACK').catch(() => {});
    return none;
  } finally {
    client.release();
  }
}

/**
 * Every word of the query must be there (in any order); a document holding the words as
 * one phrase comes first. `group` narrows to one kind; `page` is 1-based, `per` a page.
 */
export async function search(query: string, group: Group | null, page = 1, per = 20): Promise<Results> {
  const counts = Object.fromEntries(GROUPS.map((g) => [g.id, 0])) as Record<Group, number>;
  const phrase = fold(query).slice(0, 120);
  const words = phrase.split(' ').filter((w) => w.length >= 2);
  if (words.length === 0) return { query, counts, hits: [], total: 0 };
  const quranPhrase = quranFolded(phrase);
  // A word of two letters (يا، في، من) counts only as a word, not inside others.
  const has = (folded: string, w: string) => (w.length > 2 ? folded.includes(w) : ` ${folded} `.includes(` ${w} `));
  const entries = await documents();
  const found: { doc: Document; rank: number }[] = [];
  for (const document_ of entries) {
    if (counts[document_.group] >= CAP) continue;
    let rank: number;
    if (document_.group === 'quran') {
      if (quranPhrase.length < 2 || !document_.folded.includes(quranPhrase)) continue;
      rank = 0;
    } else {
      if (!words.every((w) => has(document_.folded, w))) continue;
      rank = document_.folded.includes(phrase) ? 0 : 1;
    }
    counts[document_.group]++;
    if (!group || document_.group === group) found.push({ doc: document_, rank });
  }
  // Phrase matches first; otherwise the texts' own order (mushaf, book, chapter).
  found.sort((a, b) => a.rank - b.rank);
  // The tafsirs from Postgres: a page of them when they are asked for, else the first four
  // (and their count, for the tab, even when another kind is shown).
  const tafsir = await tafsirMatches(phrase, words, group === 'tafsir' ? (page - 1) * per : 0, group === 'tafsir' ? per : 4);
  counts.tafsir = tafsir.count;
  const shown = group ? found.slice((page - 1) * per, page * per) : GROUPS.flatMap((g) => found.filter((f) => f.doc.group === g.id).slice(0, 4));
  const hits: Hit[] = shown.map(({ doc }) => ({
      group: doc.group,
      title: doc.title,
      where: doc.where,
      href: doc.href,
      // An ayah is found by its text but shown in ink: neither it nor a snippet leaves here.
      ...(doc.group === 'quran'
        ? { surah: doc.surah, ayah: doc.ayah, before: '', match: '', after: '' }
        : snippet(doc.text, [phrase, ...words.toSorted((a, b) => b.length - a.length)], false)),
  }));
  // The tafsirs take their place among the kinds.
  const ordered =
    group === 'tafsir'
      ? tafsir.hits
      : group
        ? hits
        : GROUPS.flatMap((g) => (g.id === 'tafsir' ? tafsir.hits : hits.filter((h) => h.group === g.id)));
  return {
    query,
    counts,
    total: group ? counts[group] : Object.values(counts).reduce((a, b) => a + b, 0),
    hits: ordered,
  };
}
