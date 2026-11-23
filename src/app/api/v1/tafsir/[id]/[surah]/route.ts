import { keyed, preflight } from '@/lib/api-v1';
import { qalunSurah } from '@/lib/qalun-text';
import { tafsirFor, tafsirs } from '@/lib/tafsir';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/**
 * A surah in one tafsir, by our ayahs (Qalun): each with the passages that explain it and
 * the Hafs ayahs each passage is filed under in the source.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; surah: string }> }) {
  const { id, surah: s } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    const t = tafsirs().find((x) => x.id === id);
    const ayahs = Number.isInteger(surah) ? qalunSurah(surah) : [];
    if (!t || ayahs.length === 0) return null;
    return {
      tafsir: t.id,
      title: t.title,
      author: t.author,
      surah,
      ayahs: ayahs.map((a) => ({
        ayah: a.ayah,
        passages: (tafsirFor(t.id, surah, a.ayah) ?? []).map((p) => ({ hafs: p.hafs, text: p.text })),
      })),
    };
  });
}
