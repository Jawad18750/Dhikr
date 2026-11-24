import { open, openPreflight } from '@/lib/api-open';
import { COUNTRY_METHODS, describe, HANAFI_ASR, type MethodId,METHODS } from '@/lib/prayer-methods';

export const runtime = 'nodejs';
export const OPTIONS = openPreflight;

const attribution = { license: 'CC BY 4.0', source: 'Dhikr apps (adhan_prayer_times); adhan-js', site: 'https://dhikr.ly/prayer-methods' };

/** Every calculation method in numbers, and each country's default. Free, no key. */
export async function GET(request: Request) {
  return open(request, attribution, () => ({
    methods: (Object.keys(METHODS) as MethodId[]).map(describe),
    countries: COUNTRY_METHODS,
    default: 'MWL',
    hanafi_asr: [...HANAFI_ASR],
    high_latitude: { from_latitude: 48, rule: 'middle_of_the_night' },
    libya: 'official tables, not calculated: https://dhikr.ly/api/v1/prayer-times/libya',
  }));
}
