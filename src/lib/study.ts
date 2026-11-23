// Server only: the ayah study pages and their API read through here.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import { hafsForQalun } from '@/lib/ayah-numbering';

/**
 * What the Quranic encyclopedia (quranpedia.net) holds about each ayah, as the Dhikr apps
 * carry it, built per surah by scripts/build-quranpedia.mjs. The source is numbered by
 * Hafs; an ayah of ours gathers every Hafs ayah it reads (al-Fatiha's first, the basmala
 * too), each note once.
 */
const ROOT = process.env.QURANPEDIA_ROOT ?? path.join(process.cwd(), '.content/quranpedia');

export type Study = {
  meanings?: { word: string; meaning: string; book: string }[];
  asbab?: { text: string; book: string | null; author: string | null; from: number; to: number | null }[];
  topics?: string[];
  balagha?: { text: string; source: string | null }[];
  rulings?: { text: string; by: string | null; book: string | null }[];
  similar?: { text: string; ayahs: string }[];
  grammar?: { text: string; book: string; author: string }[];
  abrogation?: { text: string; book: string; author: string; died: number | null }[];
  reflections?: { text: string; by: string | null }[];
  topicNotes?: { text: string; by: string | null }[];
  fatwas?: { title: string; question: string; answer: string; mufti: string | null; url: string | null }[];
  questions?: { set: string | null; question: string; answer: string }[];
};

export type SurahInfo = {
  revelation: string;
  order: number;
  introduction: string;
  names: string;
  purposes: string;
  topics: string;
  virtues: string;
  guidance: string;
};

type SurahFile = { surah: number; info: SurahInfo | null; ayahs: Record<string, Study> };

const cache = new Map<number, SurahFile>();

function surahFile(surah: number): SurahFile | null {
  if (!Number.isInteger(surah) || surah < 1 || surah > 114) return null;
  const held = cache.get(surah);
  if (held) return held;
  const file = path.join(ROOT, `${String(surah).padStart(3, '0')}.json.br`);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(zlib.brotliDecompressSync(fs.readFileSync(file)).toString('utf8')) as SurahFile;
  cache.set(surah, data);
  if (cache.size > 12) cache.delete(cache.keys().next().value as number);
  return data;
}

export const studyAvailable = () => fs.existsSync(path.join(ROOT, 'meta.json'));

export function studyCredits(): Record<string, string> {
  try {
    return (JSON.parse(fs.readFileSync(path.join(ROOT, 'meta.json'), 'utf8')) as { credits: Record<string, string> })
      .credits;
  } catch {
    return {};
  }
}

export const surahInfo = (surah: number) => surahFile(surah)?.info ?? null;

/** Everything about one of our ayahs, and the Hafs ayahs it gathers. */
export function studyFor(surah: number, ayah: number): { hafs: number[]; study: Study } | null {
  const data = surahFile(surah);
  if (!data) return null;
  const hafs = surah === 1 && ayah === 1 ? [1, 2] : hafsForQalun(surah, ayah);
  if (hafs.length === 0) return null;
  const study: Study = {};
  const seen = new Set<string>();
  for (const h of hafs) {
    for (const [section, items] of Object.entries(data.ayahs[String(h)] ?? {})) {
      const list = ((study as Record<string, unknown[]>)[section] ??= []);
      for (const item of items as unknown[]) {
        const key = `${section}:${JSON.stringify(item)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(item);
      }
    }
  }
  return { hafs, study };
}
