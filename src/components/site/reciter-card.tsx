import { useIntl } from 'react-intl';

import type { CatalogueReciter } from '@/lib/dhikr-catalogue';
import { cn } from '@/utils';

/** «قالون عن نافع» → «قالون». */
const shortRiwaya = (riwaya: string) => riwaya.split(/\s+/)[0] ?? riwaya;

/** The riwaya the site starts with (the hero says so); only others are named. */
const HOME_RIWAYA = 'قالون';

const SURAHS = 114;

/**
 * One recitation as a near-square box: the portrait on top, left clear of any
 * label, then the name and one line of what sets it apart. The ranking sits
 * in the photo's start corner (the right in Arabic), the first three in gold.
 * The whole box opens the reciter.
 */
/** The recitation's style in the page's script: «مرتل» is «Murattal» in Latin, «Мураттал» in Cyrillic. */
const STYLES: Record<'latn' | 'cyrl' | 'beng', Record<string, string>> = {
  latn: { مرتل: 'Murattal', مجود: 'Mujawwad', حدر: 'Hadr', معلم: 'Muallim' },
  cyrl: { مرتل: 'Мураттал', مجود: 'Муджаввад', حدر: 'Хадр', معلم: 'Муаллим' },
  beng: { مرتل: 'মুরাত্তাল', مجود: 'মুজাওয়াদ', حدر: 'হাদর', معلم: 'মুআল্লিম' },
};
const styleName = (style: string, locale: string) => {
  if (locale === 'ar' || locale === 'ur' || locale === 'fa') return style;
  const script = locale === 'ru' ? 'cyrl' : locale === 'bn' ? 'beng' : 'latn';
  return STYLES[script][style] ?? style;
};

export function ReciterCard({ reciter }: { reciter: CatalogueReciter }) {
  const { formatMessage, locale } = useIntl();
  const initials = reciter.name.split(/\s+/)[0]?.charAt(0) ?? '';
  const riwaya = shortRiwaya(reciter.riwaya);
  // One line, only what tells this recitation apart from the next. Word by
  // word is on every recitation, so it is said once for the site, not here.
  const facts = [
    riwaya === HOME_RIWAYA ? '' : riwaya,
    styleName(reciter.style, locale),
    reciter.surahTotal >= SURAHS
      ? formatMessage({ id: 'browse.chipComplete' })
      : formatMessage(
          { id: 'browse.surahCount' },
          { count: reciter.surahTotal }
        ),
  ].filter(Boolean);
  const podium = reciter.rank !== null && reciter.rank <= 3;

  return (
    <a
      href={reciter.href}
      className="group flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-2 transition-colors hover:border-border-strong sm:rounded-[28px] sm:p-2.5"
    >
      <span className="relative block aspect-square overflow-hidden rounded-[16px] bg-surface-sunken sm:rounded-[20px]">
        {reciter.portrait ? (
          // Portraits come from our audio server at their own size; next/image
          // would proxy them through the app for no gain.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reciter.portrait}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-[50%_20%] transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-6xl font-black text-ink-subtle"
          >
            {initials}
          </span>
        )}
        {reciter.rank !== null && (
          <span
            className={cn(
              'absolute start-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-2 font-display text-[15px] font-black leading-none shadow-[0_2px_10px_rgb(0_0_0/0.25)] sm:start-2.5 sm:top-2.5 sm:h-8 sm:min-w-8 sm:text-base',
              podium
                ? 'bg-gradient-to-b from-gold-light to-gold text-[#1b1712]'
                : 'bg-white/90 text-[#0b0b0c] backdrop-blur-sm'
            )}
            aria-label={formatMessage(
              { id: 'browse.rank' },
              { rank: reciter.rank }
            )}
          >
            {reciter.rank}
          </span>
        )}
        {reciter.isNew && (
          <span className="absolute end-2 top-2 rounded-full bg-gold-light px-2.5 py-1 text-xs font-bold text-[#1b1712] sm:end-2.5 sm:top-2.5">
            {formatMessage({ id: 'browse.new' })}
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col gap-1 px-1.5 pb-1.5 sm:px-2 sm:pb-2">
        <span className="line-clamp-2 text-[15px] font-bold leading-[1.4] text-ink sm:text-lg">
          {reciter.name}
        </span>
        <span className="mt-auto truncate text-[13px] text-ink-muted sm:text-sm">
          {facts.join(' · ')}
        </span>
      </span>
    </a>
  );
}
