import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

import type { AyahTiming, TimingProvider } from './types';

type Row = { ayah: number; start_ms: number; end_ms: number };

/** Our per-ayah timings: /timings/<slug>/NNN.json, ayahs in the Qalun numbering. */
export const dhikrTimings: TimingProvider = {
  async getSurahTimings(moshaf, surah): Promise<AyahTiming[]> {
    const response = await fetch(
      `${DHIKR_AUDIO_BASE}/timings/${encodeURIComponent(moshaf.id)}/${String(surah).padStart(3, '0')}.json`
    );
    if (!response.ok) return [];
    const body = (await response.json()) as { ayahs?: Row[] };
    return (body.ayahs ?? [])
      .filter((row) => row.ayah > 0 && row.end_ms > row.start_ms + 1)
      .map((row) => ({ ayah: row.ayah, startMs: row.start_ms, endMs: row.end_ms }));
  },
};
