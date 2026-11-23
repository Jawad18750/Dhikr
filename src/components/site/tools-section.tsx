import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import { DHIKR_AUDIO_BASE } from '@/services/reciters/dhikr.adapter';

const COPY: Record<SeoLocale, Record<string, string>> = { ar, en, de };

const fill = (text: string, values: Record<string, string | number>) =>
  text.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? ''));

const pill =
  'inline-flex h-9 items-center rounded-full px-4 text-sm font-bold transition-colors';

/**
 * Open data and tools for listeners, teachers and developers: what exists
 * links to it; what is still being prepared says so.
 */
export function ToolsSection({
  locale,
  sampleSlug,
}: {
  locale: SeoLocale;
  /** A recitation whose surah 1 timings serve as the JSON sample. */
  sampleSlug?: string;
}) {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? fill(COPY[locale][key], values) : COPY[locale][key];
  const inProgress = (
    <span className={`${pill} self-start bg-white/10 text-white/80`}>
      {t('tools.inProgress')}
    </span>
  );

  return (
    <section
      id="tools"
      aria-labelledby="tools-title"
      className="flex scroll-mt-6 flex-col gap-7 rounded-[28px] bg-hero px-5 py-10 text-on-hero dark:ring-1 dark:ring-border sm:rounded-[36px] sm:px-10 sm:py-12"
    >
      <div className="flex flex-col gap-3">
        <h2
          id="tools-title"
          className="font-display text-[32px] font-black leading-[1.3] sm:text-[44px]"
        >
          {t('tools.title')}
        </h2>
        <p className="max-w-[640px] text-[17px] leading-[1.75] text-[#bdb7ac]">
          {t('tools.body')}
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-4">
        <article className="flex min-h-[290px] flex-col gap-3 rounded-[26px] bg-gradient-to-b from-[#1f5a43] via-[#0e2e22] to-[#07150f] p-7">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.ayahTimings')}
          </h3>
          <p className="text-base leading-[1.7] text-[#cbe4d7]">
            {t('tools.ayahTimingsBody')}
          </p>
          <div
            className="mt-auto flex flex-col gap-2 rounded-2xl bg-white/[0.07] px-4 py-3.5"
            aria-hidden="true"
          >
            <div className="relative h-2 rounded-full bg-white/[0.12]">
              <span className="absolute inset-y-0 start-0 w-[12%] rounded-full bg-[#6fbf8f]" />
              <span className="absolute inset-y-0 start-[13%] w-[21%] rounded-full bg-[#a9ddbc]" />
              <span className="absolute inset-y-0 start-[35%] w-[9%] rounded-full bg-[#6fbf8f]" />
              <span className="absolute inset-y-0 start-[45%] w-[30%] rounded-full bg-[#a9ddbc]" />
            </div>
            <span dir="ltr" className="text-left text-[13px] text-[#a9c9b8]">
              timings/&lt;reciter&gt;/001.json
            </span>
          </div>
          {sampleSlug ? (
            <a
              href={`${DHIKR_AUDIO_BASE}/timings/${encodeURIComponent(sampleSlug)}/001.json`}
              className={`${pill} self-start bg-white/[0.14] text-white hover:bg-white/25`}
            >
              JSON
            </a>
          ) : (
            inProgress
          )}
        </article>

        <article className="flex min-h-[290px] flex-col gap-3 rounded-[26px] bg-gradient-to-b from-[#2c3550] via-[#151a2a] to-[#0a0c14] p-7">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.wordTimings')}
          </h3>
          <p className="text-base leading-[1.7] text-[#c9d0e4]">
            {t('tools.wordTimingsBody')}
          </p>
          <div
            className="mt-auto flex gap-1 rounded-2xl bg-white/[0.07] px-4 py-3.5"
            aria-hidden="true"
          >
            <span className="bg-gold-light/90 h-6 flex-[3] rounded-lg" />
            <span className="bg-gold-light/55 h-6 flex-[2] rounded-lg" />
            <span className="h-6 flex-[4] rounded-lg bg-white/[0.18]" />
            <span className="h-6 flex-[2] rounded-lg bg-white/[0.18]" />
            <span className="h-6 flex-[3] rounded-lg bg-white/[0.18]" />
          </div>
          {inProgress}
        </article>

        <article className="flex min-h-[290px] flex-col gap-3 rounded-[26px] bg-gradient-to-b from-[#e6c47a] via-[#b78f45] to-[#6b4e1e] p-7 text-[#1b1712]">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.text')}
          </h3>
          <p className="text-base leading-[1.7] text-[#3a2c14]">
            {t('tools.textBody')}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 text-sm font-bold">
            <span className="rounded-xl bg-white/55 px-3 py-2">
              {t('tools.ayahs', { count: 6214 })}
            </span>
            <span className="rounded-xl bg-white/55 px-3 py-2">
              {t('tools.surahs', { count: 114 })}
            </span>
            <span className="rounded-xl bg-white/55 px-3 py-2">
              {t('tools.textDivisions')}
            </span>
          </div>
          <span className={`${pill} self-start bg-[#1b1712]/[0.14]`}>
            {t('tools.inProgress')}
          </span>
        </article>

        <article className="flex min-h-[250px] flex-col gap-3 rounded-[26px] border border-[#2e2c27] bg-[#1a1916] p-7">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.api')}
          </h3>
          <p className="text-base leading-[1.7] text-[#bdb7ac]">
            {t('tools.apiBody')}
          </p>
          <code
            dir="ltr"
            className="mt-auto rounded-2xl bg-[#0b0b0c] px-4 py-3.5 text-left font-mono text-sm text-gold-light"
          >
            GET /api/v3/reciters
          </code>
          <a
            href={`${DHIKR_AUDIO_BASE}/api/v3/reciters`}
            className={`${pill} self-start bg-white/[0.14] text-white hover:bg-white/25`}
          >
            {t('tools.apiOpen')}
          </a>
        </article>

        <article className="flex min-h-[250px] flex-col gap-3 rounded-[26px] border border-[#2e2c27] bg-[#1a1916] p-7">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.converter')}
          </h3>
          <p className="text-base leading-[1.7] text-[#bdb7ac]">
            {t('tools.converterBody')}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2.5 text-[15px]">
            <span className="rounded-xl bg-[#0b0b0c] px-3.5 py-2.5">
              {t('tools.hafs', { ref: '2:286' })}
            </span>
            <svg
              width="22"
              height="12"
              viewBox="0 0 22 12"
              aria-hidden="true"
              className="rtl:-scale-x-100"
            >
              <path
                d="M2 6 L20 6 M15 1 L20 6 L15 11"
                fill="none"
                stroke="#E6C47A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="rounded-xl bg-[#0b0b0c] px-3.5 py-2.5 text-gold-light">
              {t('tools.qalun', { ref: '2:285' })}
            </span>
          </div>
          {inProgress}
        </article>

        <article className="flex min-h-[250px] flex-col gap-3 rounded-[26px] border border-[#2e2c27] bg-[#1a1916] p-7">
          <h3 className="text-2xl font-black leading-[1.35]">
            {t('tools.audio')}
          </h3>
          <p className="text-base leading-[1.7] text-[#bdb7ac]">
            {t('tools.audioBody')}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 text-sm">
            <span className="rounded-xl bg-[#0b0b0c] px-3 py-2">MP3</span>
          </div>
          <a
            href="#reciters"
            className={`${pill} self-start bg-white/[0.14] text-white hover:bg-white/25`}
          >
            {t('tools.audioHow')}
          </a>
        </article>
      </div>
    </section>
  );
}
