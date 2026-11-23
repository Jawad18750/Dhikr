import data from '@/data/ayah-numbering.json';

/**
 * Ayah numbers between the Jamahiriya mushaf (Qalun, the Madinan count as it is printed:
 * 6214 ayahs) and Hafs (the Kufan count, 6236), both ways.
 *
 * The tables are the apps' own (dhikr-app qalun_hafs_ayah_map.dart, checked against the
 * printed fihris), exported unchanged; every ayah of both counts round-trips. An ayah of
 * one count can hold more than one of the other, so each answer is a list.
 */
type Ranges = Record<string, [number, number, number][]>;
const MUSHAF_TO_HAFS = data.mushaf_to_hafs as unknown as Ranges;
const HAFS_TO_MUSHAF = data.hafs_to_mushaf as unknown as Ranges;
const MERGE = data.merge as Record<string, number[]>;
const SPLIT = data.split as Record<string, number[]>;
export const AYAH_COUNTS = data.counts as { qalun: Record<string, number>; hafs: Record<string, number> };

const offset = (ranges: Ranges, surah: number, ayah: number) => {
  for (const [start, end, by] of ranges[String(surah)] ?? []) {
    if (ayah >= start && ayah <= end) return ayah + by;
  }
  return ayah;
};

/** The Hafs ayah(s) a Qalun ayah reads. Al-Fatiha's basmala, unnumbered in Qalun, is left out. */
export function hafsForQalun(surah: number, ayah: number): number[] {
  if (!(ayah >= 1 && ayah <= (AYAH_COUNTS.qalun[String(surah)] ?? 0))) return [];
  const all = [offset(MUSHAF_TO_HAFS, surah, ayah), ...(MERGE[`${surah}:${ayah}`] ?? [])];
  return surah === 1 ? all.filter((hafs) => hafs !== 1) : all;
}

/** The Qalun ayah(s) holding a Hafs ayah. Hafs 1:1, the basmala, has no Qalun number. */
export function qalunForHafs(surah: number, ayah: number): number[] {
  if (!(ayah >= 1 && ayah <= (AYAH_COUNTS.hafs[String(surah)] ?? 0))) return [];
  if (surah === 1 && ayah === 1) return [];
  return [offset(HAFS_TO_MUSHAF, surah, ayah), ...(SPLIT[`${surah}:${ayah}`] ?? [])];
}
