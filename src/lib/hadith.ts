// Server only: the hadith pages and API read the collections through here.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * The hadith collections the أذان وأذكار app carries, read from its own files:
 *   app/assets/data/hadith/index.json          the collections
 *   app/assets/data/hadith/<slug>.json.br      one collection's hadiths, in order
 * A hadith's chapter is its `chapter_ar` (اللؤلؤ والمرجان: the كتاب, with the باب as its
 * title) or else its `title_ar`.
 */
const ROOT = process.env.CONTENT_ROOT ?? path.join(process.cwd(), '.content');
const DIR = path.join(ROOT, 'app/assets/data/hadith');

export type Collection = { id: number; slug: string; title: string; count: number };
export type Hadith = {
  number: number;
  chapter: string;
  /** The باب, where it is not the chapter itself. */
  title: string | null;
  text: string;
  narrator: string | null;
  grade: string | null;
  reference: string | null;
};
export type Chapter = { n: number; title: string; from: number; to: number; count: number };
type Loaded = Collection & { source: { name: string; url: string } | null; hadiths: Hadith[]; chapters: Chapter[] };

/** What the site says of each collection: its author, and what it is. */
export const ABOUT: Record<string, { author: string; about: string }> = {
  lulu_marjan: { author: 'محمد فؤاد عبد الباقي', about: 'ما اتفق عليه البخاري ومسلم.' },
  riyad_salihin: { author: 'يحيى بن شرف النووي', about: 'أحاديث في الآداب والرقائق والأخلاق، مبوّبة.' },
  bulugh_maram: { author: 'ابن حجر العسقلاني', about: 'أحاديث الأحكام، على أبواب الفقه.' },
  adab_mufrad: { author: 'محمد بن إسماعيل البخاري', about: 'أحاديث الأدب والأخلاق، بأسانيدها.' },
  shamail_tirmidhi: { author: 'أبو عيسى الترمذي', about: 'صفة النبي صلى الله عليه وسلم وأخلاقه وشمائله.' },
  nawawi_40: { author: 'يحيى بن شرف النووي', about: 'اثنان وأربعون حديثًا جامعة لقواعد الدين.' },
  qudsi_40: { author: '', about: 'أربعون حديثًا قدسيًّا.' },
};

let index: { at: number; list: Collection[] } | null = null;
export function collections(): Collection[] {
  if (index && Date.now() - index.at < 10 * 60_000) return index.list;
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8')) as {
      collections: { id: number; slug: string; name_ar: string; hadith_count: number }[];
    };
    const list = raw.collections
      .filter((c) => /^[a-z0-9_]+$/.test(c.slug) && fs.existsSync(path.join(DIR, `${c.slug}.json.br`)))
      .map((c) => ({ id: c.id, slug: c.slug, title: c.name_ar, count: c.hadith_count }));
    // The two Sahihs' common ground first, then the larger works, then the forties.
    const order = ['lulu_marjan', 'riyad_salihin', 'bulugh_maram', 'adab_mufrad', 'shamail_tirmidhi', 'nawawi_40', 'qudsi_40'];
    list.sort((a, b) => (order.indexOf(a.slug) + 99) % 99 - (order.indexOf(b.slug) + 99) % 99);
    index = { at: Date.now(), list };
  } catch {
    return [];
  }
  return index.list;
}

const cache = new Map<string, Loaded>();
export function collection(slug: string): Loaded | null {
  const meta = collections().find((c) => c.slug === slug);
  if (!meta) return null;
  const held = cache.get(slug);
  if (held) return held;
  const raw = JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(DIR, `${slug}.json.br`))).toString('utf8')) as {
    source?: { name: string; url: string };
    hadiths: {
      number: number;
      chapter_ar?: string;
      title_ar?: string | null;
      text_ar: string;
      narrator_ar?: string | null;
      grade_ar?: string | null;
      reference?: string | null;
    }[];
  };
  const hadiths: Hadith[] = raw.hadiths
    .sort((a, b) => a.number - b.number)
    .map((h) => {
      const chapter = (h.chapter_ar || h.title_ar || meta.title).trim();
      const title = h.chapter_ar && h.title_ar && h.title_ar.trim() !== chapter ? h.title_ar.trim() : null;
      return {
        number: h.number,
        chapter,
        title,
        text: h.text_ar.replace(/‏|‎|‍/g, '').trim(),
        narrator: h.narrator_ar || null,
        grade: h.grade_ar || null,
        reference: h.reference || null,
      };
    });
  const chapters: Chapter[] = [];
  for (const h of hadiths) {
    const last = chapters.at(-1);
    if (last?.title === h.chapter) {
      last.to = h.number;
      last.count++;
    } else chapters.push({ n: chapters.length + 1, title: h.chapter, from: h.number, to: h.number, count: 1 });
  }
  const loaded = { ...meta, source: raw.source ? { name: raw.source.name, url: raw.source.url } : null, hadiths, chapters };
  cache.set(slug, loaded);
  if (cache.size > 4) cache.delete(cache.keys().next().value as string);
  return loaded;
}

export const hadithsOfChapter = (c: Loaded, chapter: Chapter) => c.hadiths.filter((h) => h.number >= chapter.from && h.number <= chapter.to);
