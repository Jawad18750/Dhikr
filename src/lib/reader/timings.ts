// Server only: imported by the reader's API routes alone.

/**
 * A recitation's word timings, from the NeMo corpus (qalun-timing), in the mushaf's own
 * word count: [start ms, end ms, ayah, word], in reciting order.
 *
 * The corpus's times are relative to their segment (absolute = time_from + start). It
 * counts «۞» as a word, which the mushaf's index does not (2:233 and 2:245 still carry the
 * stars of 2:234 and 2:246 there, as the apps' spokenIndexForTiming says). The isti'adha and
 * basmala segments are left out. Out-of-order strays (al-Fatiha's basmala tail filed as
 * 1:2 before 1:1, a re-read) are dropped by keeping the longest run in mushaf order.
 */
export type WordTiming = [number, number, number, number];

type Segment = {
  time_from?: number;
  special_type?: string | null;
  words?: { location?: string; start?: number; end?: number }[];
};

const TIMING_BASE = 'https://qalun-timing.abdeljawad.com/timing-data-nemo';

export async function fetchWordTimings(
  slug: string,
  surah: number,
  stars: Record<string, number>
): Promise<WordTiming[]> {
  const response = await fetch(`${TIMING_BASE}/${slug}/${String(surah).padStart(3, '0')}.json`, {
    next: { revalidate: 86_400 },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { segments?: Segment[] };
  const raw: WordTiming[] = [];
  for (const segment of data.segments ?? []) {
    if (segment.special_type) continue;
    const base = segment.time_from ?? 0;
    for (const word of segment.words ?? []) {
      const [s, a, w] = (word.location ?? '').split(':').map(Number);
      if (s !== surah || !a || !w) continue;
      let star: number | undefined;
      if (surah === 2 && (a === 233 || a === 245)) star = 1;
      else if (!(surah === 2 && (a === 234 || a === 246))) star = stars[String(a)];
      if (star !== undefined && w === star) continue; // the «۞» itself: no audio
      const index = star !== undefined && w > star ? w - 1 : w;
      raw.push([
        Math.round((base + (word.start ?? 0)) * 1000),
        Math.round((base + (word.end ?? word.start ?? 0)) * 1000),
        a,
        index,
      ]);
    }
  }
  raw.sort((x, y) => x[0] - y[0]);
  return longestInOrder(raw);
}

/** The longest subsequence whose (ayah, word) never goes back (patience sorting). */
function longestInOrder(items: WordTiming[]): WordTiming[] {
  const key = (t: WordTiming) => t[2] * 1000 + t[3];
  const tails: number[] = [];
  const tailAt: number[] = [];
  const parent = new Array<number>(items.length).fill(-1);
  for (let index = 0; index < items.length; index++) {
    const k = key(items[index]);
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] <= k) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) parent[index] = tailAt[lo - 1];
    tails[lo] = k;
    tailAt[lo] = index;
  }
  const out: WordTiming[] = [];
  for (let index = tailAt[tails.length - 1] ?? -1; index >= 0; index = parent[index]) out.push(items[index]);
  return out.reverse();
}
