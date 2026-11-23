import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

/** One surah of one recitation: its ayahs in this numbering (Qalun) and length. */
export type SurahFacts = { ayahs: number; seconds: number };

type AyahsFile = { surahs?: Record<string, [number, number, number][]> };

/**
 * What a recitation's ayah timings say about each of its surahs: how many ayahs
 * it reads (rows with a start, the basmala row 0 left out) and where the last
 * one ends. Read on the server from the compact `ayahs.json`, revalidated daily.
 */
export async function getSurahFacts(slug: string): Promise<Record<number, SurahFacts>> {
  try {
    const response = await fetch(`${DHIKR_AUDIO_BASE}/timings/${slug}/ayahs.json`, {
      next: { revalidate: 86_400 },
    });
    if (!response.ok) return {};
    const data = (await response.json()) as AyahsFile;
    const out: Record<number, SurahFacts> = {};
    for (const [surah, rows] of Object.entries(data.surahs ?? {})) {
      const ayahs = rows.filter((row) => row[0] > 0);
      const end = rows.reduce((max, row) => Math.max(max, row[2] ?? 0), 0);
      out[Number(surah)] = { ayahs: ayahs.length, seconds: Math.round(end / 1000) };
    }
    return out;
  } catch {
    return {};
  }
}
