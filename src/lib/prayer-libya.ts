// Server only: Libya's official prayer tables, the open dataset (/prayer-times, its API and downloads).
import data from '@/data/prayer-libya.json';

/**
 * Every Libyan city's yearly table as the Awqaf publishes it: 366 days (29 February
 * included), six times a day, in Libya's time (Africa/Tripoli). Built by
 * scripts/build-prayer-libya.mjs from the apps' tables.
 */
type Raw = { slug: string; name_ar: string; name_en: string; lat: number; lng: number; new_fajr: boolean; times: string };
export type LibyaCity = Omit<Raw, 'times'>;
export type PrayerDay = { month: number; day: number; fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string };

const RAW = data as unknown as {
  title: string;
  title_en: string;
  source: string;
  source_en: string;
  compiled_by: string[];
  license: string;
  timezone: string;
  cities: Raw[];
};

export const PRAYER_LIBYA_META = {
  title: RAW.title,
  title_en: RAW.title_en,
  source: RAW.source,
  source_en: RAW.source_en,
  compiled_by: RAW.compiled_by,
  license: 'CC BY 4.0',
  license_url: 'https://creativecommons.org/licenses/by/4.0/',
  timezone: RAW.timezone,
  site: 'https://dhikr.ly/prayer-times',
  repository: 'https://github.com/Jawad18750/libya-prayer-times',
};

const BY_SLUG = new Map(RAW.cities.map((c) => [c.slug, c]));
const BY_NAME = new Map(RAW.cities.map((c) => [c.name_ar, c]));

export const libyaCities = (): LibyaCity[] => RAW.cities.map(({ times: _, ...c }) => c);

export const libyaCity = (key: string) => BY_SLUG.get(key) ?? BY_NAME.get(decodeURIComponent(key)) ?? null;

/** The index of a date in a 366-day year (1 January = 0, 29 February = 59). */
export function dayIndex(month: number, day: number) {
  const lengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= lengths[month - 1])) return -1;
  return lengths.slice(0, month - 1).reduce((a, b) => a + b, 0) + day - 1;
}

const NAMES = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export function cityDay(city: Raw, month: number, day: number): PrayerDay | null {
  const index = dayIndex(month, day);
  if (index < 0) return null;
  const out: Record<string, string | number> = { month, day };
  for (const [k, n] of NAMES.entries()) {
    const at = index * 24 + k * 4;
    out[n] = `${city.times.slice(at, at + 2)}:${city.times.slice(at + 2, at + 4)}`;
  }
  return out as PrayerDay;
}

export function cityMonth(city: Raw, month: number): PrayerDay[] {
  const out: PrayerDay[] = [];
  for (let d = 1; d <= 31; d++) {
    const day = cityDay(city, month, d);
    if (day) out.push(day);
  }
  return out;
}

/** Today's date in Libya. */
export function libyaToday() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Tripoli', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [y, m, d] = parts.split('-').map(Number);
  return { year: y, month: m, day: d };
}
