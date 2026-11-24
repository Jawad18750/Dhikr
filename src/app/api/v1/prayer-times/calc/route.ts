import { open, openPreflight } from '@/lib/api-open';
import { describe, methodFor, type MethodId, METHODS, times, todayIn } from '@/lib/prayer-methods';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const OPTIONS = openPreflight;

const attribution = { license: 'CC BY 4.0', source: 'Dhikr apps (adhan_prayer_times); adhan-js', site: 'https://dhikr.ly/prayer-methods' };

const validZone = (tz: string) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

/**
 * Times anywhere: ?lat&lng&tz[&date=YYYY-MM-DD][&method=<id>|&country=<ISO>][&madhab=shafi|hanafi].
 * Free, no key.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  return open(request, attribution, () => {
    const lat = Number(q.get('lat'));
    const lng = Number(q.get('lng'));
    const tz = q.get('tz') ?? 'UTC';
    if (!q.has('lat') || !q.has('lng') || !(Math.abs(lat) <= 90) || !(Math.abs(lng) <= 180) || !validZone(tz)) return null;
    const cc = (q.get('country') ?? '').toUpperCase();
    const asked = q.get('method');
    if (asked && !(asked in METHODS)) return null;
    const method = (asked as MethodId | null) ?? methodFor(cc);
    const madhab = q.get('madhab') === 'hanafi' ? 'hanafi' : q.get('madhab') === 'shafi' ? 'shafi' : undefined;
    const date = q.get('date');
    const m = date ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(date) : null;
    if (date && !m) return null;
    const day = m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : todayIn(tz);
    return {
      place: { lat, lng, timezone: tz, country: cc || null },
      method: describe(method),
      date: `${day.y}-${String(day.m).padStart(2, '0')}-${String(day.d).padStart(2, '0')}`,
      times: times({ lat, lng, tz, cc }, day, method, madhab),
    };
  });
}
