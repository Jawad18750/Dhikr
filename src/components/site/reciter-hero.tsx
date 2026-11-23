import { splitMoshafName } from '@/lib/dhikr-catalogue';
import type { SeoLocale } from '@/lib/seo/routes';
import ar from '@/locales/ar.json';
import de from '@/locales/de.json';
import en from '@/locales/en.json';
import type { Reciter } from '@/types';
import { LinkSource } from '@/types';

const COPY = { ar, en, de } as const;

/**
 * The reciter's black card: portrait, name, riwaya and how many surahs. The
 * player below it holds the actions (play, download, share).
 */
export function ReciterHero({
  reciter,
  portrait,
  locale,
}: {
  reciter: Reciter;
  portrait: string | null;
  locale: SeoLocale;
}) {
  const t = COPY[locale];
  const { riwaya, style } = splitMoshafName(reciter.moshaf.name);
  const surahs = Number(reciter.moshaf.surah_total) || 0;

  return (
    <section
      data-header-tone="dark"
      aria-labelledby="reciter-title"
      className="flex w-full flex-wrap items-center gap-6 rounded-[28px] bg-hero p-5 text-on-hero dark:ring-1 dark:ring-border sm:gap-8 sm:rounded-[36px] sm:p-8"
    >
      <div className="h-[120px] w-[120px] shrink-0 overflow-hidden rounded-[24px] bg-white/10 shadow-[0_0_0_5px_rgba(230,196,122,0.25)] sm:h-[180px] sm:w-[180px] sm:rounded-[28px]">
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portrait}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display flex h-full w-full items-center justify-center text-6xl font-black text-white/40"
          >
            {reciter.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 basis-[260px] flex-col gap-3">
        <span className="border-gold-light/35 self-start rounded-full border px-3.5 py-1 text-[15px] text-gold-light">
          {style ? `${riwaya} · ${style}` : riwaya}
        </span>
        <h1
          id="reciter-title"
          className="font-display text-[34px] font-black leading-[1.3] sm:text-[52px]"
        >
          {reciter.name}
        </h1>
        {surahs > 0 && (
          <span className="text-[17px] text-[#cfcac0]">
            {t['reciter.surahCount'].replace('{count}', String(surahs))}
            {reciter.source === LinkSource.DHIKR &&
              ` · ${t['browse.wordByWord']}`}
          </span>
        )}
      </div>
    </section>
  );
}
