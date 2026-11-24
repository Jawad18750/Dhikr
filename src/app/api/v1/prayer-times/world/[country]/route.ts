import countries from '@/data/prayer-world.json';
import { open, openPreflight } from '@/lib/api-open';
import { describe, HANAFI_ASR, methodFor, times, todayIn } from '@/lib/prayer-methods';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = openPreflight;

const attribution = { license: 'CC BY 4.0', source: 'Dhikr apps (adhan_prayer_times); GeoNames capitals', site: 'https://dhikr.ly/prayer-methods' };

/** A country: its default method and today's (or ?date=YYYY-MM-DD) times at its capital. Free, no key. */
export async function GET(request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const q = new URL(request.url).searchParams;
  return open(request, attribution, () => {
    const c = countries.find((x) => x.cc === country.toUpperCase());
    if (!c) return null;
    const date = q.get('date');
    const m = date ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
    if (date && !m) return null;
    const day = m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : todayIn(c.tz);
    return {
      country: { code: c.cc, name_ar: c.name_ar, name_en: c.name_en },
      capital: { name: c.capital, lat: c.lat, lng: c.lng, timezone: c.tz },
      method: describe(methodFor(c.cc)),
      asr: HANAFI_ASR.has(c.cc) ? 'hanafi' : 'shafi',
      date: `${day.y}-${String(day.m).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`,
      times: times(c, day),
      ...(c.cc === 'LY' ? { note: 'Libya uses official tables: /api/v1/prayer-times/libya' } : {}),
    };
  });
}
