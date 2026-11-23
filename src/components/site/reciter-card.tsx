import { IoCheckmarkDoneOutline, IoSparkles } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import type { CatalogueReciter } from '@/lib/dhikr-catalogue';

/** «قالون عن نافع» → «قالون». */
const shortRiwaya = (riwaya: string) => riwaya.split(/\s+/)[0] ?? riwaya;

/** The riwaya the site starts with (the hero says so); only others are named. */
const HOME_RIWAYA = 'قالون';

const SURAHS = 114;

/**
 * One recitation as a near-square box: the portrait on top, left clear of any
 * label, then the name and what it offers. The ranking sits in the photo's
 * corner, away from the face. The whole box opens the reciter.
 */
export function ReciterCard({ reciter }: { reciter: CatalogueReciter }) {
  const { formatMessage } = useIntl();
  const initials = reciter.name.split(/\s+/)[0]?.charAt(0) ?? '';
  const riwaya = shortRiwaya(reciter.riwaya);
  const complete = reciter.surahTotal >= SURAHS;
  // One line, only what tells this recitation apart from the next. A full
  // khatma is the double check its filter chip uses, so the words fit three
  // to a row on a phone.
  const facts = [
    riwaya === HOME_RIWAYA ? '' : riwaya,
    reciter.style,
    complete
      ? ''
      : formatMessage(
          { id: 'browse.surahCount' },
          { count: reciter.surahTotal }
        ),
  ].filter(Boolean);
  const khatma = formatMessage({ id: 'browse.chipComplete' });
  const wordByWord = formatMessage({ id: 'browse.wordByWord' });

  return (
    <a
      href={reciter.href}
      className="group flex flex-col gap-2 rounded-[16px] border border-border bg-surface p-1.5 transition-colors hover:border-border-strong sm:gap-3 sm:rounded-[28px] sm:p-2.5"
    >
      <span className="relative block aspect-square overflow-hidden rounded-[11px] bg-surface-sunken sm:rounded-[20px]">
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
            className="absolute end-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/60 px-1.5 text-[11px] font-bold text-gold-light backdrop-blur-sm sm:end-2.5 sm:top-2.5 sm:h-7 sm:min-w-7 sm:px-2 sm:text-[13px]"
            aria-label={formatMessage(
              { id: 'browse.rank' },
              { rank: reciter.rank }
            )}
          >
            {reciter.rank}
          </span>
        )}
        {reciter.isNew && (
          <span className="absolute start-1.5 top-1.5 rounded-full bg-gold-light px-1.5 py-0.5 text-[10px] font-bold text-[#1b1712] sm:start-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-xs">
            {formatMessage({ id: 'browse.new' })}
          </span>
        )}
      </span>

      <span className="flex flex-1 flex-col gap-0.5 px-1 pb-1 sm:gap-1 sm:px-2 sm:pb-2">
        <span className="line-clamp-2 text-[13px] font-bold leading-[1.4] text-ink sm:text-lg">
          {reciter.name}
        </span>
        <span className="mt-auto flex min-w-0 items-center gap-1 text-[11px] text-ink-muted sm:gap-1.5 sm:text-sm">
          <span className="truncate">{facts.join(' · ')}</span>
          {complete && (
            <IoCheckmarkDoneOutline
              className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
              role="img"
              aria-label={khatma}
              title={khatma}
            />
          )}
          <IoSparkles
            className="h-3 w-3 shrink-0 text-gold sm:h-3.5 sm:w-3.5"
            role="img"
            aria-label={wordByWord}
            title={wordByWord}
          />
        </span>
      </span>
    </a>
  );
}
