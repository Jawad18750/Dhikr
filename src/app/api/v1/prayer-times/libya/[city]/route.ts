import { open, openPreflight } from '@/lib/api-open';
import { cityDay, cityMonth, libyaCity, libyaToday, PRAYER_LIBYA_META } from '@/lib/prayer-libya';

export const runtime = 'nodejs';
export const OPTIONS = openPreflight;

const attribution = { license: PRAYER_LIBYA_META.license, source: PRAYER_LIBYA_META.source_en, site: PRAYER_LIBYA_META.site };

/**
 * One city's times: `?date=YYYY-MM-DD` (or `MM-DD`) for a day, `?month=1..12` for a month,
 * `?year` for all 366 days; nothing for today in Libya. Free, no key.
 */
export async function GET(request: Request, { params }: { params: Promise<{ city: string }> }) {
  const { city: key } = await params;
  const q = new URL(request.url).searchParams;
  return open(request, attribution, () => {
    const city = libyaCity(key);
    if (!city) return null;
    const { times: _, ...meta } = city;
    if (q.has('year')) {
      const days = [];
      for (let m = 1; m <= 12; m++) days.push(...cityMonth(city, m));
      return { city: meta, timezone: PRAYER_LIBYA_META.timezone, days };
    }
    if (q.has('month')) {
      const month = Number(q.get('month'));
      const days = Number.isInteger(month) ? cityMonth(city, month) : [];
      return days.length > 0 ? { city: meta, timezone: PRAYER_LIBYA_META.timezone, month, days } : null;
    }
    const date = q.get('date');
    const found = date ? /^(?:\d{4}-)?(\d{2})-(\d{2})$/.exec(date) : null;
    if (date && !found) return null;
    const today = libyaToday();
    const [month, day] = found ? [Number(found[1]), Number(found[2])] : [today.month, today.day];
    const times = cityDay(city, month, day);
    return times ? { city: meta, timezone: PRAYER_LIBYA_META.timezone, ...times } : null;
  });
}
