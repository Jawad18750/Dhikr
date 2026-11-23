import { keyed, preflight } from '@/lib/api-v1';
import { readerAvailable, readerStars } from '@/lib/reader/service';
import { fetchWordTimings } from '@/lib/reader/timings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** When each word starts and ends, in milliseconds, numbered as the Qalun mushaf counts. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; surah: string }> }
) {
  const { slug, surah: s } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    if (!/^[a-z0-9_]+$/.test(slug) || !Number.isInteger(surah) || surah < 1 || surah > 114) return null;
    if (!readerAvailable()) throw new Error('reader unavailable');
    const words = await fetchWordTimings(slug, surah, await readerStars(surah));
    if (words.length === 0) return null;
    return {
      slug,
      surah,
      words: words.map(([start, end, ayah, word]) => ({ ayah, word, start, end })),
    };
  });
}
