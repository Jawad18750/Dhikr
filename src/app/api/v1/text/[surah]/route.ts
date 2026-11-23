import { SURAHS } from '@/constants';
import text from '@/data/qalun-text.json';
import { keyed, preflight } from '@/lib/api-v1';
import { removeTashkeel } from '@/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

type Ayah = { ayah: number; text: string; juz: number; thumun?: number; hizb?: number };
const TEXT = text as Record<string, Ayah[]>;

/**
 * A surah's text in Qalun, ayah by ayah as the Jamahiriya mushaf prints them (6214 in
 * all), with the juz each ayah is in and where a thumun (and so a hizb) begins.
 */
export async function GET(request: Request, { params }: { params: Promise<{ surah: string }> }) {
  const { surah: s } = await params;
  return keyed(request, async () => {
    const surah = Number(s);
    const ayahs = Number.isInteger(surah) ? TEXT[String(surah)] : undefined;
    if (!ayahs) return null;
    const meta = SURAHS.find((item) => item.id === surah);
    return {
      surah,
      name: meta ? removeTashkeel(meta.name) : null,
      riwaya: 'qalun',
      count: ayahs.length,
      ayahs,
    };
  });
}
