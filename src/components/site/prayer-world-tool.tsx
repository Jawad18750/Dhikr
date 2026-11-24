'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { IoLocateOutline, IoSearchOutline } from 'react-icons/io5';

import { describe, methodFor, type MethodId, METHODS, times, todayIn } from '@/lib/prayer-methods';
import { cn } from '@/utils';

export type WorldCountry = { cc: string; capital: string; lat: number; lng: number; tz: string; name_ar: string; name_en: string };

const PRAYERS: [keyof ReturnType<typeof times>, string][] = [
  ['fajr', 'الفجر'],
  ['sunrise', 'الشروق'],
  ['dhuhr', 'الظهر'],
  ['asr', 'العصر'],
  ['maghrib', 'المغرب'],
  ['isha', 'العشاء'],
];
// One colour per method on the map; the Muslim World League, the default, stays quiet.
const COLOURS: Record<MethodId, string> = {
  MWL: '#9a9184', Makkah: '#1f7a4d', Egypt: '#c0392b', Karachi: '#8e44ad', ISNA: '#2471a3', Dubai: '#d4a017',
  Qatar: '#7d3c98', Kuwait: '#16a085', Singapore: '#e67e22', JAKIM: '#e67e22', Kemenag: '#e67e22', Turkey: '#b03a2e',
  Gulf: '#117864', Tunisia: '#c0392b', Algeria: '#27ae60', Morocco: '#a93226', Jordan: '#2e4053', Russia: '#5d6d7e',
  France: '#1a5276', Portugal: '#196f3d',
};

/**
 * The world's prayer-time conventions, as the Dhikr apps apply them: every country's capital
 * on the map, coloured by its default method; a country's method in numbers and its times
 * today; the same day under every method, side by side; and your own place.
 */
export function PrayerWorldTool({ countries, land }: { countries: WorldCountry[]; land: { path: string; width: number; height: number } }) {
  const [cc, setCc] = useState('SA');
  const [query, setQuery] = useState('');
  const [here, setHere] = useState<WorldCountry | null>(null);
  const [override, setOverride] = useState<MethodId | null>(null);
  const country = here ?? countries.find((c) => c.cc === cc) ?? countries[0];
  const method = override ?? methodFor(country.cc);
  const day = todayIn(country.tz);
  const today = times(country, day, method);
  const info = describe(method);
  const libya = country.cc === 'LY' && !here;

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? countries.filter((c) => c.name_ar.includes(query.trim()) || c.name_en.toLowerCase().includes(q) || c.capital.toLowerCase().includes(q)).slice(0, 8) : [];
  }, [query, countries]);

  const used = [...new Set(countries.map((c) => methodFor(c.cc)))];
  const all = (Object.keys(METHODS) as MethodId[]).filter((m) => !['JAKIM', 'Kemenag'].includes(m));

  const locate = () =>
    navigator.geolocation?.getCurrentPosition((p) => {
      setOverride(null);
      setHere({
        cc: '',
        capital: 'موقعك',
        name_ar: 'موقعك',
        name_en: 'Your location',
        lat: Math.round(p.coords.latitude * 1e4) / 1e4,
        lng: Math.round(p.coords.longitude * 1e4) / 1e4,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    });

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-[26px] border border-border bg-surface p-4 sm:p-5" aria-label="خريطة الطرق">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[220px] flex-1">
            <IoSearchOutline className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`ابحث في ${countries.length} بلدًا…`}
              className="h-11 w-full rounded-full border border-border bg-background pe-4 ps-10 text-[15px] text-ink outline-none focus:border-border-strong"
            />
            {found.length > 0 && (
              <ul className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
                {found.map((c) => (
                  <li key={c.cc}>
                    <button
                      type="button"
                      onClick={() => {
                        setCc(c.cc);
                        setHere(null);
                        setOverride(null);
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-start text-[15px] hover:bg-surface-sunken"
                    >
                      <span className="text-ink">{c.name_ar}</span>
                      <span dir="ltr" className="text-[13px] text-ink-subtle">
                        {c.capital}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={locate}
            className="flex h-11 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold text-ink hover:border-border-strong"
          >
            <IoLocateOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            موقعي
          </button>
        </div>
        <svg viewBox={`0 0 ${land.width} ${land.height - 60}`} className="w-full" role="img" aria-label="عواصم العالم ملوّنة بطريقة الحساب">
          <path d={land.path} fill="var(--surface-sunken)" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" className="text-ink" />
          {countries.map((c) => {
            const on = !here && c.cc === country.cc;
            return (
              <circle
                key={c.cc}
                cx={(c.lng + 180) * 2}
                cy={(90 - c.lat) * 2}
                r={on ? 6 : 3}
                fill={c.cc === 'LY' ? 'var(--gold)' : COLOURS[methodFor(c.cc)]}
                stroke={on ? 'var(--foreground)' : 'white'}
                strokeWidth={on ? 1.5 : 0.5}
                className="cursor-pointer"
                onClick={() => {
                  setCc(c.cc);
                  setHere(null);
                  setOverride(null);
                }}
              >
                <title>{`${c.name_ar} · ${c.cc === 'LY' ? 'الجداول الرسمية' : METHODS[methodFor(c.cc)].ar}`}</title>
              </circle>
            );
          })}
        </svg>
        <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-[12.5px] text-ink-muted">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'var(--gold)' }} />
            ليبيا: الجداول الرسمية
          </li>
          {used.map((m) => (
            <li key={m} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOURS[m] }} />
              {METHODS[m].ar}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="flex flex-col gap-4 rounded-[26px] bg-hero p-5 text-on-hero sm:p-6" aria-live="polite">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[28px] font-black">{country.name_ar}</h2>
            <span dir="ltr" className="text-[13px] text-on-hero/55">
              {country.capital} · {country.lat}, {country.lng} · {country.tz}
            </span>
          </div>
          {libya ? (
            <p className="text-[15px] leading-[1.8] text-on-hero/75">
              في ليبيا لا تُحسب المواقيت: لكل مدينة جدولها الرسمي من الأوقاف.{' '}
              <Link href="/prayer-times" className="font-bold text-hero-gold underline">
                جداول المدن الليبية
              </Link>
            </p>
          ) : null}
          <ul className="grid grid-cols-3 gap-2">
            {PRAYERS.map(([k, label]) => (
              <li key={k} className="flex flex-col items-center gap-1 rounded-2xl bg-on-hero/[0.07] px-2 py-3">
                <span className="text-[13px] opacity-80">{label}</span>
                <span className="text-[22px] font-bold tabular-nums">{today[k]}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-on-hero/50">
            اليوم بتوقيت {country.tz}، بطريقة {METHODS[method].ar}
            {libya ? ' (للمقارنة فقط)' : ''}
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-[26px] border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-[22px] font-black text-ink">{info.name_ar}</h2>
          <dl className="grid grid-cols-2 gap-3 text-[15px]">
            <div className="rounded-2xl bg-surface-sunken p-3">
              <dt className="text-[13px] text-ink-subtle">زاوية الفجر</dt>
              <dd className="text-[20px] font-bold tabular-nums text-ink">{info.fajr_angle}°</dd>
            </div>
            <div className="rounded-2xl bg-surface-sunken p-3">
              <dt className="text-[13px] text-ink-subtle">العشاء</dt>
              <dd className="text-[20px] font-bold tabular-nums text-ink">
                {info.isha_interval_minutes ? `${info.isha_interval_minutes} دقيقة بعد المغرب` : `${info.isha_angle}°`}
              </dd>
            </div>
            <div className="rounded-2xl bg-surface-sunken p-3">
              <dt className="text-[13px] text-ink-subtle">العصر</dt>
              <dd className="text-[16px] font-bold text-ink">{country.cc && ['PK', 'IN', 'BD', 'AF'].includes(country.cc) ? 'الحنفي (ظل المثلين)' : 'الجمهور (ظل المثل)'}</dd>
            </div>
            <div className="rounded-2xl bg-surface-sunken p-3">
              <dt className="text-[13px] text-ink-subtle">فوق خط عرض ٤٨°</dt>
              <dd className="text-[16px] font-bold text-ink">منتصف الليل</dd>
            </div>
          </dl>
          {Object.keys(info.adjustments_minutes).length > 0 && (
            <p className="text-[14px] text-ink-muted">
              تعديلات ثابتة:{' '}
              {Object.entries(info.adjustments_minutes)
                .map(([k, v]) => `${PRAYERS.find(([p]) => p === k)?.[1] ?? k} ${v > 0 ? '+' : ''}${v} د`)
                .join('، ')}
            </p>
          )}
          <label className="flex flex-col gap-1.5 text-[14px] text-ink-muted">
            جرّب طريقة أخرى
            <select
              value={method}
              onChange={(e) => setOverride(e.target.value as MethodId)}
              className="h-11 rounded-full border border-border bg-background px-4 text-[15px] text-ink"
            >
              {all.map((m) => (
                <option key={m} value={m}>
                  {METHODS[m].ar}
                </option>
              ))}
            </select>
          </label>
        </section>
      </div>

      <section className="flex flex-col gap-3" aria-label="اليوم بكل الطرق">
        <h2 className="font-display text-[22px] font-black text-ink">اليوم في {country.name_ar}، بكل طريقة</h2>
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full border-collapse text-center text-[13px] tabular-nums sm:text-[14.5px]">
            <thead className="bg-surface-sunken text-ink">
              <tr>
                <th className="px-2 py-2.5 text-start font-bold">الطريقة</th>
                {PRAYERS.filter(([k]) => k !== 'sunrise' && k !== 'dhuhr').map(([k, label]) => (
                  <th key={k} className="px-1 py-2.5 font-bold sm:px-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {all.map((m) => {
                const t = times(country, day, m);
                return (
                  <tr key={m} className={cn('border-t border-border', m === method && 'bg-gold/15 font-bold')}>
                    <td className="px-2 py-1.5 text-start text-ink">{METHODS[m].ar}</td>
                    {(['fajr', 'asr', 'maghrib', 'isha'] as const).map((k) => (
                      <td key={k} className="px-1 py-1.5 text-ink sm:px-2">
                        {t[k]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
