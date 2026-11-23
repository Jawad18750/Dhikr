import { keyed, preflight } from '@/lib/api-v1';
import { qalunSurah } from '@/lib/qalun-text';
import { studyCredits, studyFor } from '@/lib/study';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/**
 * Everything the Quranic encyclopedia (quranpedia.net) holds about one of our ayahs (Qalun):
 * word meanings, occasions of revelation, topics, rhetoric, rulings, similar verses, grammar,
 * abrogation, reflections, fatwas and questions, with the Hafs ayahs they are filed under.
 */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string; ayah: string }> }) {
  const { surah: s, ayah: a } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    const ayah = Number(a);
    const found = Number.isInteger(surah) && qalunSurah(surah).some((x) => x.ayah === ayah) ? studyFor(surah, ayah) : null;
    if (!found) return null;
    return { surah, ayah, hafs: found.hafs, study: found.study, source: 'quranpedia.net', credits: studyCredits() };
  });
}
