'use client';

import { useEffect, useMemo, useState } from 'react';
import { IoCompassOutline, IoLocateOutline, IoSearchOutline } from 'react-icons/io5';

import { compassPoint, KAABA, qiblaBearing, qiblaDistance, qiblaPath } from '@/lib/qibla';
import { cn } from '@/utils';

export type QiblaPlace = { key: string; name: string; sub: string; lat: number; lng: number };

const number = new Intl.NumberFormat('ar-u-nu-latn');

/**
 * The qibla from anywhere: a dial with the Kaaba's direction from true north, the distance,
 * the great-circle path on the world, and on a phone, the dial turning with the device.
 */
export function QiblaTool({ places, land }: { places: QiblaPlace[]; land: { path: string; width: number; height: number } }) {
  const [place, setPlace] = useState<QiblaPlace>(places.find((p) => p.key === 'ly-tripoli') ?? places[0]);
  const [query, setQuery] = useState('');
  const [heading, setHeading] = useState<number | null>(null);
  const [live, setLive] = useState(false);
  const bearing = qiblaBearing(place.lat, place.lng);
  const distance = qiblaDistance(place.lat, place.lng);

  const found = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? places.filter((p) => p.name.includes(query.trim()) || p.sub.toLowerCase().includes(q)).slice(0, 8) : [];
  }, [query, places]);

  // The device's heading, where it offers one (iOS asks first, on a tap).
  useEffect(() => {
    if (!live) return;
    const on = (e: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      const h = e.webkitCompassHeading ?? (e.absolute && e.alpha !== null ? 360 - e.alpha : null);
      if (h !== null && h !== undefined) setHeading(h);
    };
    window.addEventListener('deviceorientationabsolute', on as (event: Event) => void);
    window.addEventListener('deviceorientation', on as (event: Event) => void);
    return () => {
      window.removeEventListener('deviceorientationabsolute', on as (event: Event) => void);
      window.removeEventListener('deviceorientation', on as (event: Event) => void);
    };
  }, [live]);

  const startLive = async () => {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof D?.requestPermission === 'function') {
      const answer = await D.requestPermission().catch(() => 'denied');
      if (answer !== 'granted') return;
    }
    setLive(true);
  };

  const locate = () =>
    navigator.geolocation?.getCurrentPosition((p) =>
      setPlace({ key: 'here', name: 'موقعك', sub: `${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`, lat: p.coords.latitude, lng: p.coords.longitude })
    );

  // The dial turns with the device so its needle points at the Kaaba in the room.
  const dial = heading === null ? 0 : -heading;
  const facing = heading !== null && Math.abs(((bearing - heading + 540) % 360) - 180) < 5;
  const px = ([lng, lat]: number[]) => `${((lng + 180) * 2).toFixed(1)},${((90 - lat) * 2).toFixed(1)}`;
  const path = qiblaPath(place.lat, place.lng);
  // A path that crosses the date line is drawn in two pieces.
  const pieces: number[][][] = [[]];
  for (const [index, p] of path.entries()) {
    if (index > 0 && Math.abs(p[0] - path[index - 1][0]) > 180) pieces.push([]);
    pieces.at(-1)!.push(p);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <IoSearchOutline className="pointer-events-none absolute start-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مدينة ليبية أو بلد…"
            className="h-11 w-full rounded-full border border-border bg-background pe-4 ps-10 text-[15px] text-ink outline-none focus:border-border-strong"
          />
          {found.length > 0 && (
            <ul className="absolute inset-x-0 top-12 z-10 overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
              {found.map((p) => (
                <li key={p.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setPlace(p);
                      setQuery('');
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-start text-[15px] hover:bg-surface-sunken"
                  >
                    <span className="text-ink">{p.name}</span>
                    <span className="text-[13px] text-ink-subtle">{p.sub}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" onClick={locate} className="flex h-11 items-center gap-2 rounded-full border border-border px-4 text-[14px] font-bold text-ink hover:border-border-strong">
          <IoLocateOutline className="h-[18px] w-[18px]" aria-hidden="true" />
          موقعي
        </button>
        <button
          type="button"
          onClick={startLive}
          className={cn('flex h-11 items-center gap-2 rounded-full px-4 text-[14px] font-bold', live ? 'bg-ink text-background' : 'border border-border text-ink hover:border-border-strong')}
        >
          <IoCompassOutline className="h-[18px] w-[18px]" aria-hidden="true" />
          البوصلة الحيّة
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section className="flex flex-col items-center gap-4 rounded-[26px] bg-hero p-6 text-on-hero" aria-live="polite">
          <div className="flex w-full items-baseline justify-between gap-3">
            <h2 className="font-display text-[28px] font-black">{place.name}</h2>
            <span className="text-[13px] text-on-hero/55">{place.sub}</span>
          </div>
          <svg viewBox="-110 -110 220 220" className="w-full max-w-[320px]" role="img" aria-label={`القبلة ${bearing.toFixed(1)}° من الشمال`}>
            <g style={{ transform: `rotate(${dial}deg)`, transition: 'transform 200ms linear' }}>
              <circle r="100" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
              <circle r="84" fill="none" stroke="currentColor" strokeOpacity="0.08" />
              {Array.from({ length: 72 }, (_, index) => (
                <line key={index} x1="0" y1={-100} x2="0" y2={index % 6 === 0 ? -90 : -95} stroke="currentColor" strokeOpacity={index % 6 === 0 ? 0.6 : 0.25} transform={`rotate(${index * 5})`} />
              ))}
              {(
                [
                  ['ش', 0, -70],
                  ['ق', 70, 0],
                  ['ج', 0, 70],
                  ['غ', -70, 0],
                ] as const
              ).map(([l, x, y]) => (
                <text key={l} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-current text-[14px] font-bold" style={{ opacity: l === 'ش' ? 1 : 0.6 }}>
                  {l}
                </text>
              ))}
              <g transform={`rotate(${bearing})`}>
                <line x1="0" y1="0" x2="0" y2="-82" stroke="var(--hero-gold, #e6c47a)" strokeWidth="4" strokeLinecap="round" />
                <rect x="-9" y="-104" width="18" height="18" rx="2" fill="#111" stroke="var(--hero-gold, #e6c47a)" strokeWidth="2" />
                <line x1="-9" y1="-99" x2="9" y2="-99" stroke="var(--hero-gold, #e6c47a)" strokeWidth="2" />
              </g>
            </g>
            <circle r="6" fill="var(--hero-gold, #e6c47a)" />
            <path d="M0,-108 l-5,-0 l5,-8 l5,8z" fill="currentColor" opacity={heading === null ? 0 : 0.9} />
          </svg>
          <div className="grid w-full grid-cols-2 gap-2 text-center">
            <div className="rounded-2xl bg-on-hero/[0.07] p-3">
              <div className="text-[13px] opacity-70">الاتجاه من الشمال</div>
              <div className="text-[24px] font-bold tabular-nums">{bearing.toFixed(1)}°</div>
              <div className="text-[13px] opacity-70">نحو {compassPoint(bearing)}</div>
            </div>
            <div className="rounded-2xl bg-on-hero/[0.07] p-3">
              <div className="text-[13px] opacity-70">المسافة إلى الكعبة</div>
              <div className="text-[24px] font-bold tabular-nums">{number.format(Math.round(distance))}</div>
              <div className="text-[13px] opacity-70">كيلومترًا</div>
            </div>
          </div>
          <p className={cn('text-[13.5px]', facing ? 'font-bold text-hero-gold' : 'text-on-hero/55')}>
            {live ? (heading === null ? 'حرّك الهاتف قليلًا ليعرف اتجاهه…' : facing ? 'أنت تتجه إلى القبلة' : 'أدر الهاتف حتى يشير السهم إلى الكعبة') : 'من الشمال الحقيقي. على الهاتف: «البوصلة الحيّة».'}
          </p>
        </section>

        <section className="flex flex-col gap-3 rounded-[26px] border border-border bg-surface p-4 sm:p-5" aria-label="الطريق إلى الكعبة">
          <svg viewBox={`0 0 ${land.width} ${land.height - 60}`} className="w-full" role="img" aria-label="أقصر طريق على سطح الأرض إلى الكعبة">
            <path d={land.path} fill="var(--surface-sunken)" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.5" className="text-ink" />
            {pieces.map((piece, index) => (
              <polyline key={index} points={piece.map(px).join(' ')} fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray="5 3" />
            ))}
            <circle cx={(place.lng + 180) * 2} cy={(90 - place.lat) * 2} r="5" fill="var(--foreground)" stroke="white" strokeWidth="1.5" />
            <rect x={(KAABA.lng + 180) * 2 - 4} y={(90 - KAABA.lat) * 2 - 4} width="8" height="8" fill="#111" stroke="var(--gold)" strokeWidth="1.5" />
          </svg>
          <p className="text-[14px] leading-[1.8] text-ink-muted">
            الخط المتقطّع أقصر طريق على سطح الأرض إلى الكعبة (الدائرة العظمى)، وأوّله هو اتجاه القبلة. لذلك يبدو منحنيًا على الخريطة
            المسطّحة.
          </p>
        </section>
      </div>
    </div>
  );
}
