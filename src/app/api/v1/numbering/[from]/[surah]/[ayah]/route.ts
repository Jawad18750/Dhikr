import { keyed, preflight } from '@/lib/api-v1';
import { hafsForQalun, qalunForHafs } from '@/lib/ayah-numbering';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** One ayah's number in the other count: /numbering/hafs/2/286 → Qalun 2:285, and back. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ from: string; surah: string; ayah: string }> }
) {
  const { from, surah: s, ayah: a } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    const ayah = Number(a);
    if ((from !== 'hafs' && from !== 'qalun') || !Number.isInteger(surah) || surah < 1 || surah > 114)
      return null;
    if (!Number.isInteger(ayah)) return null;
    const ayahs = from === 'hafs' ? qalunForHafs(surah, ayah) : hafsForQalun(surah, ayah);
    if (ayahs.length === 0 && !(from === 'hafs' && surah === 1 && ayah === 1)) return null;
    return {
      from,
      to: from === 'hafs' ? 'qalun' : 'hafs',
      surah,
      ayah,
      ayahs,
      ...(ayahs.length === 0 ? { note: 'The basmala of al-Fatiha has no ayah number in Qalun.' } : {}),
    };
  });
}
