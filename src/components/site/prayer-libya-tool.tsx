'use client';

import { useEffect, useMemo, useState } from 'react';
import { IoSearchOutline } from 'react-icons/io5';

import { cn } from '@/utils';

export type ToolCity = {
  slug: string;
  name_ar: string;
  name_en: string;
  lat: number;
  lng: number;
  new_fajr: boolean;
  today: string[];
};
type Outline = { path: string; width: number; height: number; lngMin: number; latMax: number; k: number; scale: number };

const PRAYERS = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m) % 60).padStart(2, '0')}`;

/** Now in Libya, in minutes since midnight (and seconds). */
function libyaNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tripoli', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    .formatToParts(new Date())
    .reduce<Record<string, number>>((accumulator, p) => (p.type === 'literal' ? accumulator : { ...accumulator, [p.type]: Number(p.value) }), {});
  return (parts.hour % 24) * 60 + parts.minute + parts.second / 60;
}

type Day = { month: number; day: number; fajr: string; sunrise: string; dhuhr: string; asr: string; maghrib: string; isha: string };
const row = (d: Day) => [d.fajr, d.sunrise, d.dhuhr, d.asr, d.maghrib, d.isha];

/**
 * Libya's prayer tables, live: every city on the map coloured by today's Maghrib (the sun
 * leaves the east first), the chosen city's day with the time left to the next prayer, its
 * whole year as curves, and any month as a table.
 */
export function PrayerLibyaTool({ cities, outline, today }: { cities: ToolCity[]; outline: Outline; today: { month: number; day: number } }) {
  const [slug, setSlug] = useState('tripoli');
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState(today.month);
  const [year, setYear] = useState<Day[] | null>(null);
  const [now, setNow] = useState<number | null>(null);
  const city = cities.find((c) => c.slug === slug) ?? cities[0];

  useEffect(() => {
    setNow(libyaNow());
    const timer = setInterval(() => setNow(libyaNow()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let live = true;
    setYear(null);
    fetch(`/api/v1/prayer-times/libya/${city.slug}?year`)
      .then((r) => r.json())
      .then((index) => live && setYear(index.data.days as Day[]))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [city.slug]);

  // The map: lng/lat to the outline's own frame.
  const at = (c: ToolCity) => ({ x: (c.lng - outline.lngMin) * outline.k * outline.scale, y: (outline.latMax - c.lat) * outline.scale });
  const maghribs = cities.map((c) => minutes(c.today[4]));
  const [early, late] = [Math.min(...maghribs), Math.max(...maghribs)];
  const shade = (m: number) => {
    const t = late === early ? 0 : (m - early) / (late - early);
    return `color-mix(in oklab, var(--gold-light) ${Math.round((1 - t) * 100)}%, #7a4a12)`;
  };
  const east = cities.reduce((a, c) => (minutes(c.today[4]) < minutes(a.today[4]) ? c : a));
  const west = cities.reduce((a, c) => (minutes(c.today[4]) > minutes(a.today[4]) ? c : a));

  const found = useMemo(() => {
    const q = query.trim();
    return q ? cities.filter((c) => c.name_ar.includes(q) || c.name_en.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : [];
  }, [query, cities]);

  // The next prayer (sunrise counts as the end of Fajr's time, not a prayer).
  const times = city.today.map(minutes);
  const nextIndex = now === null ? -1 : [0, 2, 3, 4, 5].find((index) => times[index] > now) ?? 0;
  const left = now === null ? 0 : (times[nextIndex] - now + 1440) % 1440;

  const monthDays = year?.filter((d) => d.month === month) ?? [];

  // The year as six curves: x = day of the year, y = time of day.
  const W = 720;
  const H = 260;
  const lo = 3 * 60;
  const hi = 22 * 60;
  const curve = (k: number) =>
    year
      ? year
          .map((d, index) => `${index === 0 ? 'M' : 'L'}${((index / 365) * W).toFixed(1)},${(((minutes(row(d)[k]) - lo) / (hi - lo)) * H).toFixed(1)}`)
          .join('')
      : '';
  const todayIndex = year ? year.findIndex((d) => d.month === today.month && d.day === today.day) : -1;
  const colours = ['#3b6aa8', '#e0a43a', '#c98a2b', '#b07028', '#8a3f2a', '#3a2f5c'];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* The map */}
        <section className="flex flex-col gap-3 rounded-[26px] border border-border bg-surface p-4 sm:p-5" aria-label="خريطة المدن">
          <div className="relative">
            <IoSearchOutline className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`ابحث في ${cities.length} مدينة…`}
              className="h-11 w-full rounded-full border border-border bg-background pe-4 ps-10 text-[15px] text-ink outline-none focus:border-border-strong"
            />
            {found.length > 0 && (
              <ul className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
                {found.map((c) => (
                  <li key={c.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setSlug(c.slug);
                        setQuery('');
                      }}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-start text-[15px] hover:bg-surface-sunken"
                    >
                      <span className="text-ink">{c.name_ar}</span>
                      <span dir="ltr" className="text-[13px] text-ink-subtle">
                        {c.name_en}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <svg viewBox={`-10 -10 ${outline.width + 20} ${outline.height + 20}`} className="w-full" role="img" aria-label="ليبيا ومدنها، ملوّنة بوقت المغرب اليوم">
            <path d={outline.path} fill="var(--surface-sunken, #f3efe6)" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.2" className="text-ink" />
            {cities.map((c) => {
              const p = at(c);
              const on = c.slug === city.slug;
              return (
                <g key={c.slug} onClick={() => setSlug(c.slug)} className="cursor-pointer">
                  <title>{`${c.name_ar} · المغرب ${c.today[4]}`}</title>
                  <circle cx={p.x} cy={p.y} r={on ? 9 : 5.5} fill={shade(minutes(c.today[4]))} stroke={on ? 'var(--foreground, #111)' : 'white'} strokeWidth={on ? 2.5 : 1} />
                </g>
              );
            })}
            {(() => {
              const p = at(city);
              return (
                <text x={p.x} y={p.y - 14} textAnchor="middle" className="fill-ink text-[18px] font-bold" style={{ paintOrder: 'stroke', stroke: 'var(--background, #fff)', strokeWidth: 4 }}>
                  {city.name_ar}
                </text>
              );
            })()}
          </svg>
          <div className="flex flex-col gap-1.5 text-[13.5px] text-ink-muted">
            <div className="flex items-center gap-2">
              <span>{clock(early)}</span>
              <span className="h-2 flex-1 rounded-full" style={{ background: `linear-gradient(to left, ${shade(early)}, ${shade(late)})` }} />
              <span>{clock(late)}</span>
            </div>
            <p className="leading-[1.8]">
              المغرب اليوم: تغرب الشمس على {east.name_ar} أولًا ({east.today[4]})، وعلى {west.name_ar} آخرًا ({west.today[4]})، بفارق{' '}
              {late - early} دقيقة في البلد الواحد.
            </p>
          </div>
        </section>

        {/* The chosen city's day */}
        <section className="flex flex-col gap-4 rounded-[26px] bg-hero p-5 text-on-hero sm:p-6" aria-live="polite">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[30px] font-black">{city.name_ar}</h2>
            <span dir="ltr" className="text-[13px] text-on-hero/55">
              {city.lat.toFixed(3)}, {city.lng.toFixed(3)}
            </span>
          </div>
          {now !== null && (
            <p className="text-[15px] text-on-hero/75">
              بقي على {PRAYERS[nextIndex]}{' '}
              <span className="font-bold tabular-nums text-hero-gold" dir="ltr">
                {Math.floor(left / 60)}:{String(Math.floor(left % 60)).padStart(2, '0')}
              </span>
            </p>
          )}
          <ul className="grid grid-cols-3 gap-2">
            {city.today.map((t, index) => (
              <li
                key={PRAYERS[index]}
                className={cn('flex flex-col items-center gap-1 rounded-2xl px-2 py-3', index === nextIndex ? 'bg-hero-gold text-[#1b1712]' : 'bg-on-hero/[0.07]')}
              >
                <span className="text-[13px] opacity-80">{PRAYERS[index]}</span>
                <span className="text-[22px] font-bold tabular-nums">{t}</span>
              </li>
            ))}
          </ul>
          {city.new_fajr && (
            <p className="text-[13px] leading-[1.8] text-on-hero/60">الفجر هنا على الفجر الصادق (نحو ١٥° تحت الأفق) كما عدّلته الأوقاف لمدن الشرق والجنوب.</p>
          )}
          <p className="mt-auto text-[13px] text-on-hero/50">بتوقيت ليبيا · من الجدول الرسمي للمدينة</p>
        </section>
      </div>

      {/* The year */}
      <section className="flex flex-col gap-3 rounded-[26px] border border-border bg-surface p-4 sm:p-6" aria-label="السنة كاملة">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[22px] font-black text-ink">سنة {city.name_ar}</h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            {PRAYERS.map((p, index) => (
              <li key={p} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: colours[index] }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <svg viewBox={`-34 -6 ${W + 40} ${H + 26}`} className="w-full" role="img" aria-label="أوقات الصلاة على مدار السنة">
          {[4, 8, 12, 16, 20].map((h) => {
            const y = ((h * 60 - lo) / (hi - lo)) * H;
            return (
              <g key={h}>
                <line x1={0} x2={W} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.08" className="text-ink" />
                <text x={-6} y={y + 4} textAnchor="end" className="fill-ink-subtle text-[11px]">{`${h}:00`}</text>
              </g>
            );
          })}
          {MONTHS.map((m, index) => (
            <text key={m} x={((index + 0.5) / 12) * W} y={H + 18} textAnchor="middle" className="fill-ink-subtle text-[10px]">
              {m.slice(0, 3)}
            </text>
          ))}
          {year && [0, 1, 2, 3, 4, 5].map((k) => <path key={k} d={curve(k)} fill="none" stroke={colours[k]} strokeWidth="2" />)}
          {todayIndex >= 0 && <line x1={(todayIndex / 365) * W} x2={(todayIndex / 365) * W} y1={0} y2={H} stroke="currentColor" strokeOpacity="0.4" strokeDasharray="4 4" className="text-ink" />}
        </svg>
      </section>

      {/* A month */}
      <section className="flex flex-col gap-3" aria-label="جدول الشهر">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-[22px] font-black text-ink">
            {MONTHS[month - 1]} في {city.name_ar}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {MONTHS.map((m, index) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonth(index + 1)}
                className={cn('rounded-full px-3 py-1.5 text-[13px] font-bold', month === index + 1 ? 'bg-ink text-background' : 'bg-surface-sunken text-ink hover:bg-border')}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full border-collapse text-center text-[13px] tabular-nums sm:text-[14.5px]">
            <thead className="bg-surface-sunken text-ink">
              <tr>
                <th className="px-1 py-2.5 font-bold sm:px-2">اليوم</th>
                {PRAYERS.map((p) => (
                  <th key={p} className="px-1 py-2.5 font-bold sm:px-2">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthDays.map((d) => (
                <tr key={d.day} className={cn('border-t border-border', d.month === today.month && d.day === today.day && 'bg-gold/15 font-bold')}>
                  <td className="px-1 py-1.5 text-ink-muted sm:px-2">{d.day}</td>
                  {row(d).map((t, index) => (
                    <td key={index} className="px-1 py-1.5 text-ink sm:px-2">
                      {t}
                    </td>
                  ))}
                </tr>
              ))}
              {!year && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-ink-subtle">
                    …
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
