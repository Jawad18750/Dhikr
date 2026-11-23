// Server only: the tools cards' coverage bars.
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

/**
 * How far each open dataset reaches, measured from the data itself (re-read daily), so
 * the bars on the home page are never a promise: timed surahs over recorded surahs, and
 * reciters with word timings over all reciters.
 */
export type Coverage = {
  reciters: number;
  /** Surahs recorded across all recitations, and how many of them have ayah timings. */
  surahs: number;
  timedSurahs: number;
  /** Recitations with word timings. */
  wordReciters: number;
};

const WORD_TIMING_BASE = 'https://qalun-timing.abdeljawad.com/timing-data-nemo';

export async function toolCoverage(): Promise<Coverage | null> {
  try {
    const response = await fetch(`${DHIKR_AUDIO_BASE}/api/v3/reciters`, { next: { revalidate: 86_400 } });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      reciters: { moshaf: { slug?: string; surah_total?: number; surah_list?: string; timing_surahs?: string }[] }[];
    };
    const moshafs = data.reciters.flatMap((reciter) => reciter.moshaf);
    const count = (list?: string) => (list ? list.split(',').filter(Boolean).length : 0);
    const words = await Promise.all(
      moshafs.map(async (moshaf) => {
        if (!moshaf.slug) return false;
        try {
          const probe = await fetch(`${WORD_TIMING_BASE}/${moshaf.slug}/001.json`, {
            method: 'HEAD',
            next: { revalidate: 86_400 },
          });
          return probe.ok;
        } catch {
          return false;
        }
      })
    );
    return {
      reciters: moshafs.length,
      surahs: moshafs.reduce((sum, m) => sum + (m.surah_total ?? count(m.surah_list)), 0),
      timedSurahs: moshafs.reduce((sum, m) => sum + count(m.timing_surahs), 0),
      wordReciters: words.filter(Boolean).length,
    };
  } catch {
    return null;
  }
}
