import type { IconType } from 'react-icons';
import { IoCloudDownloadOutline, IoHeadsetOutline, IoTimeOutline, IoTrophyOutline } from 'react-icons/io5';

import { splitMoshafName } from '@/lib/dhikr-catalogue';
import { flagOf } from '@/lib/reciter-countries';
import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import type { Reciter } from '@/types';
import { LinkSource } from '@/types';

import { CardMark } from './logo-mark';

const COPY = { ar, en, de } as const;

/** Megabytes or gigabytes, in the page's language (Latin digits in Arabic). */
function sizeLabel(bytes: number, locale: SeoLocale) {
  const mb = bytes / 1_048_576;
  const big = mb >= 1024;
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, {
    style: 'unit',
    unit: big ? 'gigabyte' : 'megabyte',
    unitDisplay: 'short',
    maximumFractionDigits: big || mb < 10 ? 1 : 0,
  }).format(big ? mb / 1024 : mb);
}

/**
 * The reciter's black card: portrait and name side by side, the riwaya and country, and
 * the recitation in four figures along its foot. The actions follow just under it.
 */
export function ReciterHero({
  reciter,
  portrait,
  locale,
  country = null,
  figures = null,
}: {
  reciter: Reciter;
  portrait: string | null;
  locale: SeoLocale;
  /** ISO code of the reciter's country, where it has been checked. */
  country?: string | null;
  /** The whole recitation: its length, its size and his place in the listening. */
  figures?: { seconds: number; bytes: number; rank: number | null; listens: number | null } | null;
}) {
  const t = COPY[locale];
  const { riwaya, style } = splitMoshafName(reciter.moshaf.name);
  const cells = [
    figures &&
      figures.listens !== null &&
      figures.listens > 0 && {
        value: new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, {
          notation: 'compact',
          maximumFractionDigits: 1,
        }).format(figures.listens),
        label: t['stats.listens'],
        icon: IoHeadsetOutline,
      },
    figures &&
      figures.seconds > 0 && {
        value: `${Math.floor(figures.seconds / 3600)}:${String(Math.floor((figures.seconds % 3600) / 60)).padStart(2, '0')}`,
        label: `${t['stats.length']}`,
        icon: IoTimeOutline,
      },
    figures && figures.bytes > 0 && { value: sizeLabel(figures.bytes, locale), label: t['stats.size'], icon: IoCloudDownloadOutline },
    figures &&
      figures.rank !== null && { value: `#${figures.rank}`, label: t['stats.rankValue'], icon: IoTrophyOutline },
  ].filter(Boolean) as { value: string; label: string; icon: IconType }[];

  return (
    <section
      data-header-tone="dark"
      aria-labelledby="reciter-title"
      className="relative isolate flex w-full flex-col gap-5 overflow-hidden rounded-[28px] bg-hero p-4 text-on-hero sm:gap-7 sm:rounded-[36px] sm:p-7"
    >
      <CardMark />
      <div className="flex items-center gap-4 sm:gap-7">
        <div className="h-[84px] w-[84px] shrink-0 overflow-hidden rounded-[20px] bg-on-hero/10 shadow-[0_0_0_3px_rgba(230,196,122,0.25)] sm:h-[150px] sm:w-[150px] sm:rounded-[28px] sm:shadow-[0_0_0_5px_rgba(230,196,122,0.25)]">
          {portrait ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={portrait} alt="" className="h-full w-full object-cover object-top" />
          ) : (
            <span
              aria-hidden="true"
              className="font-display flex h-full w-full items-center justify-center text-4xl font-black text-on-hero/40 sm:text-6xl"
            >
              {reciter.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
          <h1
            id="reciter-title"
            className="font-display text-[26px] font-black leading-[1.25] sm:text-[48px]"
          >
            {reciter.name}
          </h1>
          <span className="flex flex-wrap gap-1.5 text-[13px] sm:gap-2 sm:text-[15px]">
            <span className="rounded-full border border-hero-gold/35 px-2.5 py-0.5 text-hero-gold sm:px-3.5 sm:py-1">
              {style ? `${riwaya} · ${style}` : riwaya}
            </span>
            {country && (
              <span className="rounded-full border border-on-hero/20 px-2.5 py-0.5 text-on-hero/80 sm:px-3.5 sm:py-1">
                <span aria-hidden="true">{flagOf(country)} </span>
                {new Intl.DisplayNames([locale], { type: 'region' }).of(country)}
              </span>
            )}
            {reciter.source === LinkSource.DHIKR && (
              <span className="rounded-full border border-on-hero/20 px-2.5 py-0.5 text-on-hero/80 sm:px-3.5 sm:py-1">
                {t['browse.wordByWord']}
              </span>
            )}
          </span>
        </div>
      </div>
      {cells.length > 0 && (
        <dl
          className="grid divide-x divide-on-hero/10 rounded-[18px] bg-on-hero/[0.06] py-3 rtl:divide-x-reverse sm:py-4"
          style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
        >
          {cells.map((cell) => (
            <div key={cell.label} className="flex min-w-0 flex-col items-center gap-0.5 px-1 text-center">
              <dt className="order-last flex min-w-0 flex-col items-center gap-0.5 text-[11px] leading-tight text-on-hero/55 sm:flex-row sm:gap-1 sm:text-[13px]">
                <cell.icon className="h-3 w-3 shrink-0 text-hero-gold/80 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                <span className="text-balance">{cell.label}</span>
              </dt>
              <dd className="truncate text-[16px] font-bold tabular-nums sm:text-[22px]">{cell.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
