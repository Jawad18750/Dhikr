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

/** A recitation's files as our audio server lists them. */
export type RecitationFiles = {
  name: string;
  riwaya: string;
  /** Surah number → bytes of its MP3. */
  sizes: Map<number, number>;
};

type ApiReciters = {
  reciters: {
    name: string;
    moshaf: { name: string; server: string; slug?: string; surah_audio?: string }[];
  }[];
};

/**
 * One recitation's surahs and their sizes, from the catalogue's `surah_audio`
 * ("surah:bytes:hash,…"), revalidated hourly. Null for a slug we do not serve.
 */
export async function getRecitationFiles(slug: string): Promise<RecitationFiles | null> {
  try {
    const response = await fetch(`${DHIKR_AUDIO_BASE}/api/v3/reciters`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ApiReciters;
    for (const reciter of data.reciters) {
      for (const moshaf of reciter.moshaf) {
        const own = moshaf.slug ?? moshaf.server.replace(/\/+$/, '').split('/').pop();
        if (own !== slug) continue;
        const sizes = new Map<number, number>();
        for (const part of (moshaf.surah_audio ?? '').split(',')) {
          const [surah, bytes] = part.split(':');
          const s = Number(surah), b = Number(bytes);
          if (Number.isInteger(s) && s >= 1 && s <= 114 && b > 0) sizes.set(s, b);
        }
        return { name: reciter.name, riwaya: moshaf.name.split(/\s+-\s+/)[0] ?? '', sizes };
      }
    }
    return null;
  } catch {
    return null;
  }
}
