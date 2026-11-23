'use client';

import { useIntl } from 'react-intl';

import type { CatalogueReciter } from '@/lib/dhikr-catalogue';

import { ReciterCard } from './reciter-card';

/** Other reciters in the same riwaya, from the same country first: where to go next. */
export function RelatedReciters({ reciters }: { reciters: CatalogueReciter[] }) {
  const { formatMessage } = useIntl();
  if (reciters.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="flex w-full flex-col gap-5 pt-4">
      <h2 id="related-title" className="font-display text-[26px] font-black leading-[1.3] text-ink sm:text-[32px]">
        {formatMessage({ id: 'reciter.related' })}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {reciters.map((reciter) => (
          <ReciterCard key={reciter.slug} reciter={reciter} />
        ))}
      </div>
    </section>
  );
}
