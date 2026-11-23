import type { IconType } from 'react-icons';
import {
  IoCloudDownloadOutline,
  IoCodeSlashOutline,
  IoDocumentTextOutline,
  IoSwapHorizontalOutline,
  IoTextOutline,
  IoTimeOutline,
} from 'react-icons/io5';

import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';
import { cn } from '@/utils';

const COPY: Record<SeoLocale, Record<string, string>> = { ar, en, de };

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

/**
 * Open data and tools for listeners, teachers and developers. Every card runs
 * its own small loop that shows what it holds; what exists links to it, what
 * is still being prepared says so.
 */
export function ToolsSection({
  locale,
  sampleSlug,
  reciterCount,
}: {
  locale: SeoLocale;
  /** A recitation whose surah 1 timings serve as the JSON sample. */
  sampleSlug?: string;
  reciterCount: number;
}) {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? fill(COPY[locale][key], values) : COPY[locale][key];
  const inProgress = (tone?: Tone) => (
    <span
      className={cn(
        pill,
        'self-start',
        tone === 'light'
          ? 'bg-[#1b1712]/[0.14]'
          : tone === 'neutral'
            ? 'bg-on-hero/10 text-on-hero/80'
            : 'bg-white/10 text-white/80'
      )}
    >
      <span
        className="tool-anim-blink h-1.5 w-1.5 rounded-full bg-current"
        aria-hidden="true"
      />
      {t('tools.inProgress')}
    </span>
  );

  return (
    <section
      id="tools"
      data-header-tone="dark"
      aria-labelledby="tools-title"
      className="flex scroll-mt-6 flex-col gap-7 rounded-[28px] bg-hero px-5 py-10 text-on-hero sm:rounded-[40px] sm:px-10 sm:py-14"
    >
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
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-4">
        {/* Ayah timings: a recitation's ayahs on a timeline, a playhead crossing it. */}
        <article
          className={cn(
            card,
            'min-h-[320px] bg-gradient-to-b from-[#1f5a43] via-[#0e2e22] to-[#07150f] text-white'
          )}
        >
          <CardIcon icon={IoTimeOutline} />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.ayahTimings')}
          </h3>
          <p className="text-base leading-[1.7] text-[#cbe4d7]">
            {t('tools.ayahTimingsBody')}
          </p>
          <div
            className="mt-auto flex flex-col gap-2 rounded-2xl bg-white/[0.07] px-4 py-3.5"
            aria-hidden="true"
          >
            <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.1]">
              {[
                ['0%', '12%', '0s'],
                ['13%', '21%', '0.6s'],
                ['35%', '9%', '1.6s'],
                ['45%', '30%', '2.1s'],
                ['76%', '23%', '3.6s'],
              ].map(([start, width, delay]) => (
                <span
                  key={start}
                  className="tool-anim-light absolute inset-y-0 rounded-full bg-[#a9ddbc]"
                  style={{
                    insetInlineStart: start,
                    width,
                    animationDelay: delay,
                  }}
                />
              ))}
              <span className="tool-anim-playhead absolute inset-0">
                <span className="absolute inset-y-0 start-0 w-[3px] rounded-full bg-white" />
              </span>
            </div>
            <span
              dir="ltr"
              className="text-left font-mono text-[13px] text-[#a9c9b8]"
            >
              timings/&lt;reciter&gt;/001.json
            </span>
          </div>
          {sampleSlug ? (
            <a
              href={`${DHIKR_AUDIO_BASE}/timings/${encodeURIComponent(sampleSlug)}/001.json`}
              className={cn(
                pill,
                'self-start bg-white/[0.14] text-white hover:bg-white/25'
              )}
            >
              <IoDocumentTextOutline aria-hidden="true" />
              JSON
            </a>
          ) : (
            inProgress()
          )}
        </article>

        {/* Word timings: words lighting one after another, as a reciter reads them. */}
        <article
          className={cn(
            card,
            'min-h-[320px] bg-gradient-to-b from-[#2c3550] via-[#151a2a] to-[#0a0c14] text-white'
          )}
        >
          <CardIcon icon={IoTextOutline} />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.wordTimings')}
          </h3>
          <p className="text-base leading-[1.7] text-[#c9d0e4]">
            {t('tools.wordTimingsBody')}
          </p>
          <div
            className="mt-auto flex flex-wrap gap-1.5 rounded-2xl bg-white/[0.07] px-4 py-3.5"
            aria-hidden="true"
          >
            {[3, 2, 4, 2, 3, 5, 2].map((size, index) => (
              <span
                key={index}
                className="tool-anim-word h-6 rounded-lg"
                style={{
                  width: `${size * 12}px`,
                  animationDelay: `${index * 0.45}s`,
                }}
              />
            ))}
          </div>
          {inProgress()}
        </article>

        {/* The Qalun text: lines being written in turn. */}
        <article
          className={cn(
            card,
            'min-h-[320px] bg-gradient-to-b from-[#e6c47a] via-[#b78f45] to-[#6b4e1e] text-[#1b1712]'
          )}
        >
          <CardIcon icon={IoDocumentTextOutline} tone="light" />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.text')}
          </h3>
          <p className="text-base leading-[1.7] text-[#3a2c14]">
            {t('tools.textBody')}
          </p>
          <div
            className="mt-auto flex flex-col gap-2 rounded-2xl bg-white/40 px-4 py-3.5"
            aria-hidden="true"
          >
            {['100%', '82%', '64%'].map((width, index) => (
              <span
                key={width}
                className="tool-anim-grow h-2 rounded-full bg-[#1b1712]/55"
                style={{ width, animationDelay: `${index * 0.5}s` }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-xl bg-white/55 px-3 py-1.5">
              {t('tools.ayahs', { count: 6214 })}
            </span>
            <span className="rounded-xl bg-white/55 px-3 py-1.5">
              {t('tools.surahs', { count: 114 })}
            </span>
            <span className="rounded-xl bg-white/55 px-3 py-1.5">
              {t('tools.textDivisions')}
            </span>
          </div>
          {inProgress('light')}
        </article>

        {/* The API: a request typed, its answer arriving. */}
        <article
          className={cn(
            card,
            'min-h-[280px] border border-hero-card-line bg-hero-card'
          )}
        >
          <CardIcon icon={IoCodeSlashOutline} tone="neutral" />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.api')}
          </h3>
          <p className="text-base leading-[1.7] text-on-hero/65">
            {t('tools.apiBody')}
          </p>
          <div
            dir="ltr"
            className="mt-auto flex flex-col gap-1.5 rounded-2xl bg-[#0b0b0c] px-4 py-3.5 text-left font-mono text-sm text-white"
            aria-hidden="true"
          >
            <span className="text-gold-light">
              <span className="tool-anim-type">GET /api/v3/reciters</span>
              <span className="tool-anim-blink">▍</span>
            </span>
            <span className="tool-anim-answer text-[#7fcf9e]">
              {t('tools.apiAnswer', { count: reciterCount })}
            </span>
          </div>
          <a
            href={`${DHIKR_AUDIO_BASE}/api/v3/reciters`}
            className={cn(
              pill,
              'self-start bg-on-hero/[0.08] text-on-hero hover:bg-on-hero/15'
            )}
          >
            <IoCodeSlashOutline aria-hidden="true" />
            {t('tools.apiOpen')}
          </a>
        </article>

        {/* The numbering converter: one ayah, its two numbers, the arrow between. */}
        <article
          className={cn(
            card,
            'min-h-[280px] border border-hero-card-line bg-hero-card'
          )}
        >
          <CardIcon icon={IoSwapHorizontalOutline} tone="neutral" />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.converter')}
          </h3>
          <p className="text-base leading-[1.7] text-on-hero/65">
            {t('tools.converterBody')}
          </p>
          <div
            className="mt-auto flex flex-wrap items-center gap-2.5 text-[15px] [perspective:400px]"
            aria-hidden="true"
          >
            <span className="rounded-xl bg-[#0b0b0c] px-3.5 py-2.5 text-white">
              {t('tools.hafs', { ref: '2:286' })}
            </span>
            <IoSwapHorizontalOutline className="tool-anim-nudge h-5 w-5 text-gold-light" />
            <span className="tool-anim-flip rounded-xl bg-[#0b0b0c] px-3.5 py-2.5 text-gold-light">
              {t('tools.qalun', { ref: '2:285' })}
            </span>
          </div>
          {inProgress('neutral')}
        </article>

        {/* Audio: a recitation playing and a download filling. */}
        <article
          className={cn(
            card,
            'min-h-[280px] border border-hero-card-line bg-hero-card'
          )}
        >
          <CardIcon icon={IoCloudDownloadOutline} tone="neutral" />
          <h3 className="text-2xl font-bold leading-[1.35]">
            {t('tools.audio')}
          </h3>
          <p className="text-base leading-[1.7] text-on-hero/65">
            {t('tools.audioBody')}
          </p>
          <div
            className="mt-auto flex items-center gap-4 rounded-2xl bg-[#0b0b0c] px-4 py-3.5 text-white"
            aria-hidden="true"
          >
            <span className="flex h-6 items-end gap-[3px]">
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
            <span className="text-sm text-white/70">MP3</span>
          </div>
          <a
            href="#reciters"
            className={cn(
              pill,
              'self-start bg-on-hero/[0.08] text-on-hero hover:bg-on-hero/15'
            )}
          >
            <IoCloudDownloadOutline aria-hidden="true" />
            {t('tools.audioHow')}
          </a>
        </article>
      </div>
    </section>
  );
}
