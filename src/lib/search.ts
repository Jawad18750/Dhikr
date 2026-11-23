// Server only: the site's search over its texts.
import { SURAHS } from '@/constants';
import { qalunForHafs } from '@/lib/ayah-numbering';
import { collection, collections } from '@/lib/hadith';
import { libraryIndex, loadBook, sectionsOf } from '@/lib/library';
import { mawsuahArticle, mawsuahIndex, partsOf, type Run } from '@/lib/mawsuah';
import { qalunSurah } from '@/lib/qalun-text';
import { surahEntries, tafsirs } from '@/lib/tafsir';
import { removeTashkeel } from '@/utils';

/**
 * Search over what the site publishes as text: the Quran (Qalun), the hadith collections,
 * the thematic encyclopedia, the library's books and the short tafsirs. The long tafsirs
 * (Ibn Kathir, al-Qurtubi, al-Shawkani …, 260 million letters) are left out: they are read
 * by ayah.
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

/** Diacritics, Quranic marks and tatweel: not searched. */
const isMark = (c: number) =>
  (c >= 0x0610 && c <= 0x061a) || (c >= 0x064b && c <= 0x065f) || c === 0x0670 || (c >= 0x06d6 && c <= 0x06ed) || c === 0x0640 || (c >= 0x08d3 && c <= 0x08ff);

/** One letter folded: '' to drop it, else what it is searched as. */
function foldLetter(ch: string): string {
  const c = ch.codePointAt(0) ?? 0;
  if (isMark(c)) return '';
  switch (ch) {
    case 'أ':
    case 'إ':
    case 'آ':
    case 'ٱ':
      return 'ا';
    case 'ى':
    case 'ئ':
    case 'ے':
    case 'ی':
      return 'ي';
    case 'ؤ':
      return 'و';
    case 'ة':
      return 'ه';
  }
  if (c >= 0x0621 && c <= 0x064a) return ch;
  if ((c >= 0x30 && c <= 0x39) || (c >= 0x61 && c <= 0x7a)) return ch;
  if (c >= 0x41 && c <= 0x5a) return ch.toLowerCase();
  if (c >= 0x0660 && c <= 0x0669) return String(c - 0x0660);
  return /\p{L}/u.test(ch) ? ch : ' ';
}

export function fold(text: string): string {
  let out = '';
  for (const ch of text) out += foldLetter(ch);
  return out.replace(/\s+/g, ' ').trim();
}

/** The Quran's folding: alefs, lone hamzas and spaces dropped too (ءَامَنُواْ is آمنوا). */
const QURAN_DROP = /[ اء]/g;
/** The mushaf's و for alef before a final ة (الصلوٰة، الزكوٰة، الحيوٰة): dropped on both sides. */
const QURAN_WAW = /و(?=ه(?: |$))/g;
const quranFolded = (folded: string) => folded.replace(QURAN_WAW, '').replace(QURAN_DROP, '');
const foldQuran = (text: string) => quranFolded(fold(text));

const surahName = (n: number) => removeTashkeel(SURAHS.find((s) => s.id === n)?.name ?? '').replace(/^سورة\s+/, '');
const flatten = (runs: Run[] | undefined) =>
  (runs ?? []).map((r) => (typeof r === 'string' ? r : r[0] === 'q' ? `﴿${r[1]}﴾` : r[0] === 'a' ? ` ${r[4]}` : '')).join('');

/** The short tafsirs, searched whole. */
const SHORT_TAFSIRS = ['muyassar', 'mukhtasar', 'jalalayn'];

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
  for (const t of tafsirs().filter((x) => SHORT_TAFSIRS.includes(x.id))) {
    for (let s = 1; s <= 114; s++) {
      for (const [hafs, text] of surahEntries(t.id, s) ?? []) {
        if (!text) continue;
        const ours = qalunForHafs(s, hafs)[0] ?? 1;
        entries.push({ group: 'tafsir', title: `${surahName(s)} ${ours}`, where: t.title, href: `/tafsir/${t.id}/${s}/${ours}`, text, folded: fold(text) });
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
  const shown = group ? found.slice((page - 1) * per, page * per) : GROUPS.flatMap((g) => found.filter((f) => f.doc.group === g.id).slice(0, 4));
  return {
    query,
    counts,
    total: group ? counts[group] : Object.values(counts).reduce((a, b) => a + b, 0),
    hits: shown.map(({ doc }) => ({
      group: doc.group,
      title: doc.title,
      where: doc.where,
      href: doc.href,
      ...(doc.group === 'quran' ? { surah: doc.surah, ayah: doc.ayah, text: doc.text } : {}),
      ...snippet(doc.text, doc.group === 'quran' ? [quranPhrase] : [phrase, ...words.toSorted((a, b) => b.length - a.length)], doc.group === 'quran'),
    })),
  };
}
