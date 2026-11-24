import { open, openPreflight } from '@/lib/api-open';
import { cityDay, libyaCities, libyaCity, libyaToday, PRAYER_LIBYA_META } from '@/lib/prayer-libya';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = openPreflight;

const attribution = { license: PRAYER_LIBYA_META.license, source: PRAYER_LIBYA_META.source_en, site: PRAYER_LIBYA_META.site };

/** Today's times in every Libyan city, at once. Free, no key. */
export async function GET(request: Request) {
  return open(request, attribution, () => {
    const { year, month, day } = libyaToday();
    return {
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      timezone: PRAYER_LIBYA_META.timezone,
      cities: libyaCities().map((c) => ({ ...c, ...cityDay(libyaCity(c.slug)!, month, day) })),
    };
  });
}
