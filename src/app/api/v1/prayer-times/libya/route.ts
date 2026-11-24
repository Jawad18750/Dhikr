import { open, openPreflight } from '@/lib/api-open';
import { libyaCities, PRAYER_LIBYA_META } from '@/lib/prayer-libya';

export const runtime = 'nodejs';
export const OPTIONS = openPreflight;

const attribution = { license: PRAYER_LIBYA_META.license, source: PRAYER_LIBYA_META.source_en, site: PRAYER_LIBYA_META.site };

/** The Libyan cities with an official table: free, no key. */
export async function GET(request: Request) {
  return open(request, attribution, () => ({
    ...PRAYER_LIBYA_META,
    cities: libyaCities().map((c) => ({ ...c, url: `https://dhikr.ly/api/v1/prayer-times/libya/${c.slug}` })),
  }));
}
