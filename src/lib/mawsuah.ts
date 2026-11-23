// Server only: the encyclopedia's pages and API read it through here.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import { hafsForQalun, qalunForHafs } from '@/lib/ayah-numbering';

/**
 * موسوعة التفسير الموضوعي (مركز تفسير للدراسات القرآنية), as the masahif app ships it
 * (scripts/pack_mawsuah.py there), published with the publisher's written permission.
 *   masahif_app/assets/data/library/mawsuah/_index.json         sections → topics
 *   masahif_app/assets/data/library/mawsuah/<id>.json.br        one topic: blocks and notes
 *   masahif_app/assets/data/library/mawsuah/_ayah_topics.json.br  Hafs ayah → topics
 * A paragraph is a list of runs: prose, ["q", quote], ["a", surah, from, to, label] (Hafs
 * numbers) and ["f", footnote].
 */
const ROOT = process.env.CONTENT_ROOT ?? '/Users/jawad/Developer/dhikr/dhikr-app';
const DIR = path.join(ROOT, 'masahif_app/assets/data/library/mawsuah');

export type Run = string | ['q', string] | ['a', number, number, number, string] | ['f', number];
export type MawsuahBlock = {
  k: 'h' | 'p' | 'q' | 'v' | 'x' | 'l' | 't';
  l?: number;
  r?: Run[];
  rows?: Run[][][];
  items?: Run[][];
  ord?: boolean;
  toc?: string;
};
export type Article = { id: number; sec: number; title: string; blocks: MawsuahBlock[]; notes: { n: number; r: Run[] }[] };
export type Topic = { id: number; title_ar: string; headings: string[]; bytes: number };
export type MawsuahIndex = {
  title_ar: string;
  publisher_ar: string;
  license_ar: string;
  sections: { id: number; title_ar: string; topics: Topic[] }[];
};

let index: MawsuahIndex | null = null;
export function mawsuahIndex(): MawsuahIndex | null {
  if (index) return index;
  try {
    index = JSON.parse(fs.readFileSync(path.join(DIR, '_index.json'), 'utf8')) as MawsuahIndex;
  } catch {
    return null;
  }
  return index;
}

export function topicOf(id: number) {
  for (const section of mawsuahIndex()?.sections ?? []) {
    const topic = section.topics.find((t) => t.id === id);
    if (topic) return { section, topic };
  }
  return null;
}

const articles = new Map<number, Article>();
export function mawsuahArticle(id: number): Article | null {
  if (!Number.isInteger(id) || !topicOf(id)) return null;
  const held = articles.get(id);
  if (held) return held;
  const file = path.join(DIR, `${id}.json.br`);
  if (!fs.existsSync(file)) return null;
  const article = JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString('utf8')) as Article;
  articles.set(id, article);
  if (articles.size > 8) articles.delete(articles.keys().next().value as number);
  return article;
}

let ayahIndex: { k: number[]; o: number[]; p: number[] } | null = null;
function hits(key: number): { topic: number; heading: number }[] {
  ayahIndex ??= (() => {
    try {
      return JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(path.join(DIR, '_ayah_topics.json.br'))).toString('utf8'));
    } catch {
      return { k: [], o: [0], p: [] };
    }
  })();
  const { k, o, p } = ayahIndex!;
  let low = 0;
  let high = k.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    if (k[mid] === key) {
      const out = [];
      for (let index_ = o[mid]; index_ < o[mid + 1]; index_++) out.push({ topic: p[index_ * 2], heading: p[index_ * 2 + 1] });
      return out;
    }
    if (k[mid] < key) low = mid + 1;
    else high = mid - 1;
  }
  return [];
}

/** The topics, and the heading within each, that discuss one of our (Qalun) ayahs. */
export function topicsForAyah(surah: number, ayah: number) {
  const hafs = surah === 1 && ayah === 1 ? [1, 2] : hafsForQalun(surah, ayah);
  const seen = new Set<string>();
  const out: { id: number; title: string; heading: number; headingTitle: string | null }[] = [];
  for (const h of hafs) {
    for (const hit of hits(surah * 1000 + h)) {
      const key = `${hit.topic}:${hit.heading}`;
      const found = topicOf(hit.topic);
      if (seen.has(key) || !found) continue;
      seen.add(key);
      out.push({ id: hit.topic, title: found.topic.title_ar, heading: hit.heading, headingTitle: found.topic.headings[hit.heading] ?? null });
    }
  }
  return out;
}

/** Where a Hafs citation lands in our count: the first Qalun ayah holding it. */
export function qalunCitation(surah: number, from: number): number | null {
  return qalunForHafs(surah, from)[0] ?? (surah === 1 && from === 1 ? 1 : null);
}

/** A topic in parts, one per top-level heading (what the ayah index points at). */
export function partsOf(article: Article): { title: string; blocks: MawsuahBlock[] }[] {
  const parts: { title: string; blocks: MawsuahBlock[] }[] = [];
  for (const block of article.blocks) {
    if ((block.k === 'h' && (block.l ?? 1) === 1) || parts.length === 0) {
      const title = block.k === 'h' ? (block.r ?? []).filter((r): r is string => typeof r === 'string').join('') : article.title;
      parts.push({ title, blocks: [] });
    }
    parts.at(-1)!.blocks.push(block);
  }
  return parts;
}
