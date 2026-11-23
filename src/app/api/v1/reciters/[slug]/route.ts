import { SURAHS } from '@/constants';
import { keyed, preflight } from '@/lib/api-v1';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';
import { getRecitationFiles, getSurahFacts } from '@/lib/dhikr-surah-facts';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { removeTashkeel } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

const pad = (n: number) => String(n).padStart(3, '0');

/** One recitation and its surahs: ayahs in this numbering, length, size and audio link. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return keyed(request, async () => {
    if (!/^[a-z0-9_]+$/.test(slug)) return null;
    const reciter = (await getDhikrCatalogue()).find((r) => r.slug === slug);
    const [files, facts] = await Promise.all([getRecitationFiles(slug), getSurahFacts(slug)]);
    if (!reciter || !files) return null;
    return {
      slug,
      name: reciter.name,
      riwaya: reciter.riwaya,
      style: reciter.style || null,
      country: reciter.country,
      page: `https://dhikr.ly${reciter.href}`,
      surahs: [...files.sizes.entries()]
        .sort(([a], [b]) => a - b)
        .map(([id, bytes]) => {
          const surah = SURAHS.find((s) => s.id === id);
          return {
            surah: id,
            name: surah ? removeTashkeel(surah.name) : null,
            ayahs: facts[id]?.ayahs ?? null,
            seconds: facts[id]?.seconds ?? null,
            bytes,
            audio: `${DHIKR_AUDIO_BASE}/audio/${slug}/${pad(id)}.mp3`,
          };
        }),
    };
  });
}
