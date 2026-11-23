import { keyed, preflight } from '@/lib/api-v1';
import { getDhikrCatalogue } from '@/lib/dhikr-catalogue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = preflight;

/** Every recitation: who, which riwaya, from where, how many surahs, its page. */
export async function GET(request: Request) {
  return keyed(request, async () =>
    (await getDhikrCatalogue()).map((r) => ({
      slug: r.slug,
      name: r.name,
      riwaya: r.riwaya,
      style: r.style || null,
      country: r.country,
      surahs: r.surahTotal,
      rank: r.rank,
      portrait: r.cataloguePortrait,
      page: `https://dhikr.ly${r.href}`,
    }))
  );
}
