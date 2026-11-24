// The calculation methods the Dhikr apps use outside Libya, and each country's default: the
// same rules as أذان وأذكار (adhan_prayer_times.dart; dhikr-web src/lib/prayer.ts). Runs on
// the server (the API) and in the browser (the tool).
import { CalculationMethod, type CalculationParameters, Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan';

export type MethodId =
  | 'MWL'
  | 'Makkah'
  | 'Egypt'
  | 'Karachi'
  | 'ISNA'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Singapore'
  | 'JAKIM'
  | 'Kemenag'
  | 'Turkey'
  | 'Gulf'
  | 'Tunisia'
  | 'Algeria'
  | 'Morocco'
  | 'Jordan'
  | 'Russia'
  | 'France'
  | 'Portugal';

export const METHODS: Record<MethodId, { ar: string; en: string }> = {
  MWL: { ar: 'رابطة العالم الإسلامي', en: 'Muslim World League' },
  Makkah: { ar: 'أم القرى، مكة المكرمة', en: 'Umm al-Qura, Makkah' },
  Egypt: { ar: 'الهيئة المصرية العامة للمساحة', en: 'Egyptian General Authority of Survey' },
  Karachi: { ar: 'جامعة العلوم الإسلامية بكراتشي', en: 'University of Islamic Sciences, Karachi' },
  ISNA: { ar: 'الجمعية الإسلامية لأمريكا الشمالية', en: 'Islamic Society of North America' },
  Dubai: { ar: 'دبي', en: 'Dubai' },
  Qatar: { ar: 'قطر', en: 'Qatar' },
  Kuwait: { ar: 'الكويت', en: 'Kuwait' },
  Singapore: { ar: 'سنغافورة', en: 'Singapore (MUIS)' },
  JAKIM: { ar: 'ماليزيا (جاكيم)', en: 'Malaysia (JAKIM)' },
  Kemenag: { ar: 'إندونيسيا (وزارة الشؤون الدينية)', en: 'Indonesia (Kemenag)' },
  Turkey: { ar: 'رئاسة الشؤون الدينية التركية', en: 'Diyanet, Turkey' },
  Gulf: { ar: 'الخليج', en: 'Gulf region' },
  Tunisia: { ar: 'تونس', en: 'Tunisia' },
  Algeria: { ar: 'الجزائر', en: 'Algeria' },
  Morocco: { ar: 'المغرب', en: 'Morocco' },
  Jordan: { ar: 'الأردن', en: 'Jordan' },
  Russia: { ar: 'روسيا', en: 'Russia' },
  France: { ar: 'فرنسا', en: 'France (UOIF)' },
  Portugal: { ar: 'البرتغال', en: 'Portugal' },
};

/** A country's own method; elsewhere the Muslim World League. Libya uses its official tables. */
export const COUNTRY_METHODS: Record<string, MethodId> = {
  EG: 'Egypt', SD: 'Egypt', TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco', SA: 'Makkah',
  AE: 'Dubai', QA: 'Qatar', KW: 'Kuwait', BH: 'Makkah', OM: 'Gulf', JO: 'Jordan',
  TR: 'Turkey', RU: 'Russia', FR: 'France', PT: 'Portugal', MY: 'JAKIM', ID: 'Kemenag',
  SG: 'Singapore', BN: 'Singapore', PK: 'Karachi', IN: 'Karachi', BD: 'Karachi', AF: 'Karachi',
  US: 'ISNA', CA: 'ISNA',
};
/** Asr by the Hanafi shadow (twice the length) in these countries; elsewhere the majority's (once). */
export const HANAFI_ASR = new Set(['PK', 'IN', 'BD', 'AF']);

export const methodFor = (cc: string): MethodId => COUNTRY_METHODS[cc.toUpperCase()] ?? 'MWL';

function angles(fajr: number, isha: number, ishaInterval = 0) {
  const p = CalculationMethod.Other();
  p.fajrAngle = fajr;
  p.ishaAngle = ishaInterval > 0 ? 0 : isha;
  p.ishaInterval = ishaInterval;
  return p;
}

export function parameters(id: MethodId): CalculationParameters {
  switch (id) {
    case 'Makkah':
      return CalculationMethod.UmmAlQura();
    case 'Egypt':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'ISNA':
      return CalculationMethod.NorthAmerica();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'Singapore':
    case 'JAKIM':
    case 'Kemenag':
      return CalculationMethod.Singapore();
    case 'Turkey':
      return CalculationMethod.Turkey();
    case 'Gulf':
      return angles(19.5, 0, 90);
    case 'Tunisia':
      return angles(18, 18);
    case 'Algeria':
      return angles(18, 17);
    case 'Morocco':
      return angles(19, 17);
    case 'Jordan': {
      const p = angles(18, 18);
      p.methodAdjustments = { ...p.methodAdjustments, maghrib: 5 };
      return p;
    }
    case 'Russia':
      return angles(16, 15);
    case 'France':
      return angles(12, 12);
    case 'Portugal': {
      const p = angles(18, 0, 77);
      p.methodAdjustments = { ...p.methodAdjustments, maghrib: 3 };
      return p;
    }
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
}

/** What a method is, in numbers: the angles or interval, and its fixed adjustments (minutes). */
export function describe(id: MethodId) {
  const p = parameters(id);
  const adjust = Object.fromEntries(Object.entries(p.methodAdjustments).filter(([, v]) => v));
  return {
    id,
    name_ar: METHODS[id].ar,
    name_en: METHODS[id].en,
    fajr_angle: p.fajrAngle,
    isha_angle: p.ishaInterval ? null : p.ishaAngle,
    isha_interval_minutes: p.ishaInterval || null,
    adjustments_minutes: adjust,
    countries: Object.entries(COUNTRY_METHODS)
      .filter(([, m]) => m === id)
      .map(([cc]) => cc),
  };
}

export type Times = { fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string };

const hm = (d: Date, tz: string) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d).replace(/^24/, '00');

/**
 * One day's times at a place: by its country's default (or the method given), Hanafi Asr
 * where that country reads it so, and the middle of the night above 48° latitude.
 */
export function times(
  { lat, lng, tz, cc }: { lat: number; lng: number; tz: string; cc: string },
  date: { y: number; m: number; d: number },
  method?: MethodId,
  madhab?: 'shafi' | 'hanafi'
): Times {
  const p = parameters(method ?? methodFor(cc));
  if (Math.abs(lat) >= 48) p.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
  if (madhab ? madhab === 'hanafi' : HANAFI_ASR.has(cc.toUpperCase())) p.madhab = Madhab.Hanafi;
  // adhan reads the date's year, month and day fields only
  const t = new PrayerTimes(new Coordinates(lat, lng), new Date(date.y, date.m - 1, date.d), p);
  return { fajr: hm(t.fajr, tz), sunrise: hm(t.sunrise, tz), dhuhr: hm(t.dhuhr, tz), asr: hm(t.asr, tz), maghrib: hm(t.maghrib, tz), isha: hm(t.isha, tz) };
}

/** Today's date at a place. */
export function todayIn(tz: string) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-').map(Number);
  return { y, m, d };
}
