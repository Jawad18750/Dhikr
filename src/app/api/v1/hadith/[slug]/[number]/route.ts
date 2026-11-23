import { keyed, preflight } from '@/lib/api-v1';
import { collection } from '@/lib/hadith';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** One hadith by its number in the collection. */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string; number: string }> }) {
  const { slug, number } = await params;
  return keyed(request, async () => {
    const c = collection(slug);
    const hadith = c?.hadiths.find((h) => h.number === Number(number));
    if (!c || !hadith) return null;
    return { collection: c.slug, ...hadith, page: `https://dhikr.ly/hadith/${c.slug}/${hadith.number}` };
  });
}
