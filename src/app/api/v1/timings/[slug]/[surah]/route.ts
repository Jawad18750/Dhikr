import { keyed, preflight } from '@/lib/api-v1';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** When each ayah of a surah starts and ends in this recitation, in milliseconds. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; surah: string }> }
) {
  const { slug, surah: s } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    if (!/^[a-z0-9_]+$/.test(slug) || !Number.isInteger(surah) || surah < 1 || surah > 114) return null;
    const response = await fetch(`${DHIKR_AUDIO_BASE}/timings/${slug}/ayahs.json`, {
      next: { revalidate: 86_400 },
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { surahs?: Record<string, [number, number, number][]> };
    const rows = data.surahs?.[String(surah)];
    if (!rows) return null;
    return {
      slug,
      surah,
      // Row 0, where a recitation has it, is what precedes the first ayah (the basmala).
      ayahs: rows.map(([ayah, start, end]) => ({ ayah, start, end })),
    };
  });
}
