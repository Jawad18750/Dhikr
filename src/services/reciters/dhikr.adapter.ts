import { Language } from '@/constants/language';
import type { Moshaf, Playlist, Reciter } from '@/types';
import { LinkSource } from '@/types';

import { resolveRiwaya } from './mp3quran.helpers';
import type { Mp3QuranApiResponse } from './mp3quran.types';
import type { ReciterSource } from './reciter-source';
import { retryFetch } from './shared-fetch';

/**
 * Our own audio server: Libyan reciters, mostly Qalun, with ayah timings. Its catalogue
 * follows mp3quran's v3 shape, plus `slug` per moshaf and a `portraits` map.
 */
export const DHIKR_AUDIO_BASE = 'https://quran-audio.abdeljawad.com';

type DhikrApiResponse = Mp3QuranApiResponse & {
  portraits?: Record<string, string | null>;
};

export const DhikrAdapter = {
  source: LinkSource.DHIKR,

  async getReciters(lang: Language): Promise<Reciter[]> {
    const response = await retryFetch(`${DHIKR_AUDIO_BASE}/api/v3/reciters`);
    const data: DhikrApiResponse = await response.json();
    const reciters: Reciter[] = [];

    for (const apiReciter of data.reciters) {
      for (const apiMoshaf of apiReciter.moshaf) {
        const slug = (apiMoshaf as { slug?: string }).slug;
        reciters.push({
          id: `${LinkSource.DHIKR}-${apiReciter.id}`,
          name: apiReciter.name,
          source: LinkSource.DHIKR,
          moshaf: {
            id: slug ?? String(apiMoshaf.id),
            name: apiMoshaf.name,
            riwaya: resolveRiwaya(apiMoshaf.name, lang),
            server: apiMoshaf.server,
            surah_total: String(apiMoshaf.surah_total),
            surahIds: apiMoshaf.surah_list,
            playlist: [],
          },
        });
      }
    }

    return reciters;
  },

  async getPlaylist(moshaf: Moshaf): Promise<Playlist> {
    if (!moshaf.server) return [];
    const ids = moshaf.surahIds?.split(',').filter(Boolean) ?? [];
    return ids.map((id) => ({
      surahId: id,
      link: `${moshaf.server}${id.padStart(3, '0')}.mp3`,
    }));
  },
} satisfies ReciterSource;
