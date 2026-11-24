import Link from 'next/link';
import type { IconType } from 'react-icons';
import {
  IoArrowBack,
  IoCloudDownloadOutline,
  IoCodeSlashOutline,
  IoCompassOutline,
  IoDocumentTextOutline,
  IoEarthOutline,
  IoKeyOutline,
  IoMoonOutline,
  IoSwapHorizontalOutline,
  IoTextOutline,
  IoTimeOutline,
} from 'react-icons/io5';

import { SURAHS } from '@/constants';
import world from '@/data/prayer-world.json';
import { cityDay, libyaCities, libyaCity, libyaToday } from '@/lib/prayer-libya';
import { methodFor, METHODS, times, todayIn } from '@/lib/prayer-methods';
import { compassPoint, qiblaBearing, qiblaDistance } from '@/lib/qibla';
import type { SeoLocale } from '@/lib/seo/routes';
import type { Coverage } from '@/lib/tool-coverage';
import { MESSAGES } from '@/locales';
import { cn, getSurahDisplayName } from '@/utils';

import { AyahInk } from './ayah-ink';
import { CardMark } from './logo-mark';
import { AyahTimeline, NumberingConverter, WordLights } from './tools-live';

const COPY = MESSAGES;

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ''));

const pill =
  'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-colors';

const card =
  'group flex flex-col gap-3 rounded-[26px] p-7 transition-transform duration-300 hover:-translate-y-1';

/** Cards are gold (`light`), plain (`neutral`, turning with the section in
 * dark mode) or a dark colour gradient (the default, white ink always). */
type Tone = 'light' | 'neutral';

function CardIcon({ icon: Icon, tone }: { icon: IconType; tone?: Tone }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-110',
        tone === 'light'
          ? 'bg-[#1b1712]/10'
          : tone === 'neutral'
            ? 'bg-on-hero/10'
            : 'bg-white/10'
      )}
    >
      <Icon className="h-[22px] w-[22px]" />
    </span>
  );
}


const TONES = {
  green: {
    card: 'bg-gradient-to-b from-[#1f5a43] via-[#0e2e22] to-[#07150f] text-white',
    body: 'text-[#cbe4d7]',
    idea: 'text-[#a9c9b8]',
    preview: 'bg-white/[0.07]',
    details: 'bg-white/[0.14] text-white hover:bg-white/25',
    track: 'bg-white/10',
    fill: 'bg-[#a9ddbc]',
    icon: undefined,
  },
  blue: {
    card: 'bg-gradient-to-b from-[#2c3550] via-[#151a2a] to-[#0a0c14] text-white',
    body: 'text-[#c9d0e4]',
    idea: 'text-[#a7b0c8]',
    preview: 'bg-white/[0.07]',
    details: 'bg-white/[0.14] text-white hover:bg-white/25',
    track: 'bg-white/10',
    fill: 'bg-gold-light',
    icon: undefined,
  },
  gold: {
    card: 'bg-gradient-to-b from-[#e6c47a] via-[#b78f45] to-[#6b4e1e] text-[#1b1712]',
    body: 'text-[#3a2c14]',
    idea: 'text-[#4a3a1d]',
    preview: 'bg-white/40',
    details: 'bg-[#1b1712]/[0.12] text-[#1b1712] hover:bg-[#1b1712]/20',
    track: 'bg-[#1b1712]/15',
    fill: 'bg-[#1b1712]/70',
    icon: 'light',
  },
  plain: {
    card: 'border border-hero-card-line bg-hero-card',
    body: 'text-on-hero/65',
    idea: 'text-on-hero/50',
    preview: 'bg-[#0b0b0c] text-white',
    details: 'bg-on-hero/[0.08] text-on-hero hover:bg-on-hero/15',
    track: 'bg-on-hero/10',
    fill: 'bg-gold-light',
    icon: 'neutral',
  },
} as const;

/**
 * One tool: what it is and the idea behind it on top; then, at the same height in
 * every card of a row, a live preview of real data, and its links and status.
 */
function ToolCard({
  tone = 'plain',
  icon,
  title,
  body,
  idea,
  ideaLabel,
  href,
  details,
  preview,
  meter,
  extra,
}: {
  tone?: keyof typeof TONES;
  icon: IconType;
  title: string;
  body: string;
  idea: string;
  ideaLabel: string;
  href: string;
  details: string;
  preview: React.ReactNode;
  /** How far the dataset reaches: a short line and a share from 0 to 1. */
  meter?: { label: string; share: number };
  /** A second link beside «learn more», where a card has one. */
  extra?: React.ReactNode;
}) {
  const look = TONES[tone];
  return (
    <article className={cn(card, look.card)}>
      <CardIcon icon={icon} tone={look.icon} />
      <h3 className="text-2xl font-bold leading-[1.35]">{title}</h3>
      <p className={cn('text-base leading-[1.7]', look.body)}>{body}</p>
      <p className={cn('text-[15px] leading-[1.75]', look.idea)}>
        <span className="font-bold">{ideaLabel}: </span>
        {idea}
      </p>
      <div className={cn('mt-auto min-h-[104px] overflow-hidden rounded-2xl px-4 py-3.5 md:h-[104px]', look.preview)}>
        {preview}
      </div>
      {/* A card with no coverage keeps the bar's room, so its preview lines up with its row's. */}
      {!meter && (
        <div aria-hidden="true" className="invisible flex flex-col gap-1.5">
          <div className="h-1.5" />
          <span className="text-[13px]">&nbsp;</span>
        </div>
      )}
      {meter && (
        <div className="flex flex-col gap-1.5">
          <div
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(meter.share * 100)}
            aria-label={meter.label}
            className={cn('h-1.5 overflow-hidden rounded-full', look.track)}
          >
            <span
              className={cn('block h-full rounded-full', look.fill)}
              style={{ width: `${Math.max(2, Math.min(100, meter.share * 100))}%` }}
            />
          </div>
          <span className={cn('text-[13px] tabular-nums', look.idea)}>{meter.label}</span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Link href={href} className={cn(pill, look.details)}>
          {details}
          <IoArrowBack className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
        </Link>
        {extra}
      </div>
    </article>
  );
}

/**
 * Open data and tools for listeners, teachers and developers. Every card runs
 * its own small loop that shows what it holds; what exists links to it, what
 * is still being prepared says so.
 */
export function ToolsSection({
  locale,
  reciterCount,
  coverage,
}: {
  locale: SeoLocale;
  reciterCount: number;
  coverage: Coverage | null;
}) {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? fill(COPY[locale][key], values) : COPY[locale][key];
  const number = (value: number) => new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale).format(value);
  const percent = (share: number) =>
    new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, { style: 'percent', maximumFractionDigits: 0 }).format(share);
  // Measured from the data (lib/tool-coverage); none is shown when it could not be read.
  const meters = {
    ayahs: coverage
      ? {
          share: coverage.timedSurahs / coverage.surahs,
          label: t('tools.coverageTimed', { share: percent(coverage.timedSurahs / coverage.surahs), count: number(coverage.reciters) }),
        }
      : undefined,
    words: coverage
      ? {
          share: coverage.wordReciters / coverage.reciters,
          label: t('tools.coverageReciters', { done: number(coverage.wordReciters), total: number(coverage.reciters) }),
        }
      : undefined,
    text: { share: 1, label: t('tools.coverageAyahs', { done: number(6214), total: number(6214) }) },
    numbering: { share: 1, label: t('tools.coverageBoth', { qalun: number(6214), hafs: number(6236) }) },
    audio: coverage
      ? {
          share: coverage.surahs / (coverage.reciters * 114),
          label: t('tools.coverageAudio', { surahs: number(coverage.surahs), count: number(coverage.reciters) }),
        }
      : undefined,
  };

  return (
    <section
      id="tools"
      data-header-tone="dark"
      aria-labelledby="tools-title"
      className="relative isolate flex scroll-mt-6 flex-col gap-7 overflow-hidden rounded-[28px] bg-hero px-5 py-10 text-on-hero sm:rounded-[40px] sm:px-10 sm:py-14"
    >
      <CardMark />
      <div className="flex flex-col gap-3">
        <h2
          id="tools-title"
          className="text-[32px] font-medium leading-[1.3] sm:text-[48px]"
        >
          {t('tools.title')}
        </h2>
        <p className="max-w-[680px] text-[17px] leading-[1.75] text-on-hero/65 sm:text-lg">
          {t('tools.body')}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link
            href="/account?next=/developers"
            className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-5 text-[15px] font-bold text-[#1b1712]"
          >
            <IoKeyOutline className="h-[17px] w-[17px]" aria-hidden="true" />
            {t('cta.key')}
          </Link>
          <Link
            href="/developers"
            className="flex h-11 items-center gap-2 rounded-full bg-on-hero/[0.08] px-5 text-[15px] font-bold text-on-hero hover:bg-on-hero/15"
          >
            <IoCodeSlashOutline className="h-[17px] w-[17px]" aria-hidden="true" />
            {t('cta.docs')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-4">
        <ToolCard
          tone="green"
          icon={IoTimeOutline}
          title={t('tools.ayahTimings')}
          body={t('tools.ayahTimingsBody')}
          idea={t('tools.ayahTimingsIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#timings"
          details={t('tools.learnMore')}
          preview={<AyahTimeline />}
          meter={meters.ayahs}
        />
        <ToolCard
          tone="blue"
          icon={IoTextOutline}
          title={t('tools.wordTimings')}
          body={t('tools.wordTimingsBody')}
          idea={t('tools.wordTimingsIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#word-timings"
          details={t('tools.learnMore')}
          preview={<WordLights />}
          meter={meters.words}
        />
        <ToolCard
          tone="gold"
          icon={IoDocumentTextOutline}
          title={t('tools.text')}
          body={t('tools.textBody')}
          idea={t('tools.textIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#text"
          details={t('tools.learnMore')}
          preview={
            <div className="flex h-full flex-col justify-between gap-2">
              <p dir="rtl" lang="ar" className="text-[#1b1712]">
                <AyahInk surah={1} ayah={3} text="مَلِكِ يَوْمِ الدِّينِ" line={40} wrap={false} />
              </p>
              <div className="flex flex-wrap gap-1.5 text-[12px] font-bold">
                <span className="rounded-lg bg-white/55 px-2 py-0.5">{t('tools.ayahs', { count: 6214 })}</span>
                <span className="rounded-lg bg-white/55 px-2 py-0.5">{t('tools.surahs', { count: 114 })}</span>
                <span className="rounded-lg bg-white/55 px-2 py-0.5">{t('tools.textDivisions')}</span>
              </div>
            </div>
          }
          meter={meters.text}
        />
        <ToolCard
          icon={IoCodeSlashOutline}
          title={t('tools.api')}
          body={t('tools.apiBody')}
          idea={t('tools.apiIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#reciters"
          details={t('tools.learnMore')}
          preview={
            <div dir="ltr" className="flex h-full flex-col justify-center gap-1 text-left font-mono text-[13px] leading-[1.6]">
              <span className="text-gold-light">
                <span className="tool-anim-type">GET /api/v1/reciters</span>
                <span className="tool-anim-blink">▍</span>
              </span>
              <span className="tool-anim-answer text-white/80">
                <span className="text-[#7fcf9e]">200</span> [{'{'} &quot;slug&quot;: <span className="text-[#e6c47a]">&quot;abdulhamid_algriw&quot;</span>, &quot;surahs&quot;: <span className="text-[#9cc3ff]">114</span> {'}'}, …{reciterCount}]
              </span>
            </div>
          }
        />
        <ToolCard
          icon={IoSwapHorizontalOutline}
          title={t('tools.converter')}
          body={t('tools.converterBody')}
          idea={t('tools.converterIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#converter"
          details={t('tools.learnMore')}
          preview={
            <NumberingConverter
              surahs={SURAHS.map((surah) => getSurahDisplayName(surah, locale))}
              labels={{
                hafs: t('tools.hafs', { ref: '' }).trim(),
                qalun: t('tools.qalun', { ref: '' }).trim(),
                surah: t('tools.convertSurah'),
                ayah: t('tools.convertAyah'),
                swap: t('tools.convertSwap'),
                none: t('tools.convertNone'),
              }}
            />
          }
          meter={meters.numbering}
        />
        <ToolCard
          icon={IoCloudDownloadOutline}
          title={t('tools.audio')}
          body={t('tools.audioBody')}
          idea={t('tools.audioIdea')}
          ideaLabel={t('tools.ideaLabel')}
          href="/developers#audio"
          details={t('tools.learnMore')}
          preview={
            <div className="flex h-full flex-col justify-between gap-2">
              <span dir="ltr" className="flex items-center justify-between font-mono text-[13px] text-white/75">
                <span>abdulhamid_algriw/001.mp3</span>
                <span className="text-white/50">MP3</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="flex h-6 items-end gap-[3px]" aria-hidden="true">
                  {[0, 0.3, 0.15, 0.45, 0.2].map((delay) => (
                    <span
                      key={delay}
                      className="tool-anim-eq h-full w-[4px] rounded-full bg-gold-light"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </span>
                <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span className="tool-anim-fill absolute inset-0 rounded-full bg-gradient-to-l from-gold-light to-gold" />
                </span>
              </div>
            </div>
          }
          meter={meters.audio}
          extra={
            <a href="#reciters" className={cn(pill, 'bg-on-hero/[0.08] text-on-hero hover:bg-on-hero/15')}>
              <IoCloudDownloadOutline aria-hidden="true" />
              {t('tools.audioHow')}
            </a>
          }
        />
        <PrayerCards t={t} />
      </div>
    </section>
  );
}

const PRAYER_NAMES = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];

/** The two prayer-time tools: Libya's official tables, and the world's methods. */
function PrayerCards({ t }: { t: (id: string, values?: Record<string, string | number>) => string }) {
  const today = libyaToday();
  const tripoli = cityDay(libyaCity('tripoli')!, today.month, today.day)!;
  const riyadh = world.find((c) => c.cc === 'SA')!;
  const sa = times(riyadh, todayIn(riyadh.tz));
  const methods = new Set(world.map((c) => methodFor(c.cc))).size;
  return (
    <>
      <ToolCard
        tone="gold"
        icon={IoMoonOutline}
        title={t('tools.prayerLibya')}
        body={t('tools.prayerLibyaBody')}
        idea={t('tools.prayerLibyaIdea')}
        ideaLabel={t('tools.ideaLabel')}
        href="/prayer-times"
        details={t('tools.learnMore')}
        preview={
          <div className="flex h-full flex-col justify-between gap-2">
            <span className="text-[13px] font-bold">طرابلس</span>
            <span dir="rtl" className="grid grid-cols-6 gap-1 text-center">
              {[tripoli.fajr, tripoli.sunrise, tripoli.dhuhr, tripoli.asr, tripoli.maghrib, tripoli.isha].map((time, index) => (
                <span key={PRAYER_NAMES[index]} className="flex flex-col">
                  <span className="text-[10.5px] opacity-70">{PRAYER_NAMES[index]}</span>
                  <span className="text-[13px] font-bold tabular-nums">{time}</span>
                </span>
              ))}
            </span>
          </div>
        }
        meter={{ label: t('tools.prayerLibyaMeter', { n: libyaCities().length, d: 366 }), share: 1 }}
      />
      <ToolCard
        tone="blue"
        icon={IoEarthOutline}
        title={t('tools.prayerWorld')}
        body={t('tools.prayerWorldBody')}
        idea={t('tools.prayerWorldIdea')}
        ideaLabel={t('tools.ideaLabel')}
        href="/prayer-methods"
        details={t('tools.learnMore')}
        preview={
          <div className="flex h-full flex-col justify-between gap-2">
            <span className="flex items-center justify-between text-[13px]">
              <span className="font-bold">{riyadh.name_ar}</span>
              <span className="opacity-70">{METHODS[methodFor('SA')].ar}</span>
            </span>
            <span className="grid grid-cols-6 gap-1 text-center">
              {[sa.fajr, sa.sunrise, sa.dhuhr, sa.asr, sa.maghrib, sa.isha].map((time, index) => (
                <span key={PRAYER_NAMES[index]} className="flex flex-col">
                  <span className="text-[10.5px] opacity-70">{PRAYER_NAMES[index]}</span>
                  <span className="text-[13px] font-bold tabular-nums">{time}</span>
                </span>
              ))}
            </span>
          </div>
        }
        meter={{ label: t('tools.prayerWorldMeter', { n: world.length, m: methods }), share: 1 }}
      />
      <QiblaCard t={t} />
    </>
  );
}

/** The qibla tool's card: Tripoli's direction, drawn. */
function QiblaCard({ t }: { t: (id: string, values?: Record<string, string | number>) => string }) {
  const city = libyaCity('tripoli')!;
  const bearing = qiblaBearing(city.lat, city.lng);
  return (
    <ToolCard
      tone="green"
      icon={IoCompassOutline}
      title={t('tools.qibla')}
      body={t('tools.qiblaBody')}
      idea={t('tools.qiblaIdea')}
      ideaLabel={t('tools.ideaLabel')}
      href="/qibla"
      details={t('tools.learnMore')}
      preview={
        <div className="flex h-full items-center gap-4">
          <svg viewBox="-40 -40 80 80" className="h-[76px] w-[76px] flex-none" aria-hidden="true">
            <circle r="36" fill="none" stroke="currentColor" strokeOpacity="0.3" />
            <text y="-24" textAnchor="middle" className="fill-current text-[10px] font-bold">
              ش
            </text>
            <line x1="0" y1="0" x2="0" y2="-28" stroke="var(--gold-light)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${bearing})`} />
            <circle r="3.5" fill="var(--gold-light)" />
          </svg>
          <span className="flex flex-col gap-0.5">
            <span className="text-[13px] font-bold">{city.name_ar}</span>
            <span className="text-[22px] font-bold tabular-nums">{bearing.toFixed(1)}°</span>
            <span className="text-[12.5px] opacity-75">
              {compassPoint(bearing)} · {Math.round(qiblaDistance(city.lat, city.lng)).toLocaleString('en')} km
            </span>
          </span>
        </div>
      }
      meter={{ label: t('tools.qiblaMeter', { n: libyaCities().length + world.length - 1 }), share: 1 }}
    />
  );
}
