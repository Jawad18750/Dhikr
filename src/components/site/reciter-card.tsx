import { useIntl } from 'react-intl';

import type { CatalogueReciter } from '@/lib/dhikr-catalogue';

/** «قالون عن نافع» → «قالون»: the pill keeps the riwaya's first name. */
const shortRiwaya = (riwaya: string) => riwaya.split(/\s+/)[0] ?? riwaya;

/**
 * One recitation: the portrait, its place in the listening ranking, the
 * name, and what it offers. The whole card opens the reciter.
 */
export function ReciterCard({ reciter }: { reciter: CatalogueReciter }) {
  const { formatMessage } = useIntl();
  const initials = reciter.name.split(/\s+/)[0]?.charAt(0) ?? '';

  return (
    <a
      href={reciter.href}
      className="group flex flex-col gap-3 rounded-[22px] border border-[#ece8e1] bg-surface p-2 transition-colors hover:border-border-strong dark:border-border sm:rounded-[28px] sm:p-2.5"
    >
      <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-surface-sunken sm:rounded-[20px]">
        {reciter.portrait ? (
          // Portraits come from our audio server at their own size; next/image
          // would proxy them through the app for no gain.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reciter.portrait}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-240 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-display flex h-full w-full items-center justify-center text-6xl font-black text-ink-subtle"
          >
            {initials}
          </span>
        )}
        {reciter.rank !== null && (
          <span
            className="absolute end-3 top-3 flex h-[30px] min-w-[30px] items-center justify-center rounded-full bg-[#0b0b0c]/75 px-2 text-sm font-bold text-gold-light"
            aria-label={formatMessage(
              { id: 'browse.rank' },
              { rank: reciter.rank }
            )}
          >
            {reciter.rank}
          </span>
        )}
        {reciter.isNew && (
          <span className="absolute start-3 top-3 rounded-full bg-gold-light px-2.5 py-1 text-xs font-bold text-[#1b1712]">
            {formatMessage({ id: 'browse.new' })}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 px-1.5 pb-1.5 sm:gap-2.5 sm:px-2 sm:pb-2">
        <span className="text-base font-bold leading-[1.4] text-ink sm:text-xl">
          {reciter.name}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted sm:px-3 sm:text-[13px]">
            {shortRiwaya(reciter.riwaya)}
            {reciter.style ? ` · ${reciter.style}` : ''}
          </span>
          <span className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs text-ink-muted sm:px-3 sm:text-[13px]">
            {formatMessage(
              { id: 'browse.surahCount' },
              { count: reciter.surahTotal }
            )}
          </span>
          <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs text-primary sm:px-3 sm:text-[13px]">
            {formatMessage({ id: 'browse.wordByWord' })}
          </span>
        </div>
      </div>
    </a>
  );
}
