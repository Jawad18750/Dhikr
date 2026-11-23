import {
  IoBookOutline,
  IoListOutline,
  IoSparklesOutline,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import type { CatalogueReciter } from '@/lib/dhikr-catalogue';
import { cn } from '@/utils';

/** «قالون عن نافع» → «قالون»: the pill keeps the riwaya's first name. */
const shortRiwaya = (riwaya: string) => riwaya.split(/\s+/)[0] ?? riwaya;

const pill =
  'flex items-center gap-1 rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-ink-muted sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[13px]';

/**
 * One recitation as a near-square box: the portrait on top, left clear of any
 * label, then the name and what it offers. The ranking sits in the photo's
 * corner, away from the face. The whole box opens the reciter.
 */
export function ReciterCard({ reciter }: { reciter: CatalogueReciter }) {
  const { formatMessage } = useIntl();
  const initials = reciter.name.split(/\s+/)[0]?.charAt(0) ?? '';

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
            className="absolute end-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-black/60 px-2 text-[13px] font-bold text-gold-light backdrop-blur-sm sm:end-2.5 sm:top-2.5"
            aria-label={formatMessage(
              { id: 'browse.rank' },
              { rank: reciter.rank }
            )}
          >
            {reciter.rank}
          </span>
        )}
        {reciter.isNew && (
          <span className="absolute start-2 top-2 rounded-full bg-gold-light px-2.5 py-1 text-xs font-bold text-[#1b1712] sm:start-2.5 sm:top-2.5">
            {formatMessage({ id: 'browse.new' })}
          </span>
        )}
      </span>

      <span className="flex flex-col gap-2 px-1.5 pb-1.5 sm:px-2 sm:pb-2">
        <span className="text-[15px] font-bold leading-[1.4] text-ink sm:text-lg">
          {reciter.name}
        </span>
        <span className="flex flex-wrap gap-1 sm:gap-1.5">
          <span className={pill}>
            <IoBookOutline aria-hidden="true" />
            {shortRiwaya(reciter.riwaya)}
            {reciter.style ? ` · ${reciter.style}` : ''}
          </span>
          <span className={pill}>
            <IoListOutline aria-hidden="true" />
            {formatMessage(
              { id: 'browse.surahCount' },
              { count: reciter.surahTotal }
            )}
          </span>
          <span className={cn(pill, 'bg-primary-soft text-primary')}>
            <IoSparklesOutline aria-hidden="true" />
            {formatMessage({ id: 'browse.wordByWord' })}
          </span>
        </span>
      </span>
    </a>
  );
}
