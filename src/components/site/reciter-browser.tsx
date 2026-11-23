'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  IoChevronBack,
  IoChevronDown,
  IoChevronUp,
  IoSearchOutline,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { SURAHS } from '@/constants';
import type { CatalogueReciter } from '@/lib/dhikr-catalogue';
import { flagOf } from '@/lib/reciter-countries';
import { cn, getSurahDisplayName, normalizeArabicText } from '@/utils';

import { ReciterCard } from './reciter-card';

type Mode = 'reciter' | 'surah';

/** How many cards show before «show all»: the most listened. */
const FIRST_ROW = 12;

const matches = (text: string, query: string) =>
  normalizeArabicText(text.toLowerCase()).includes(
    normalizeArabicText(query.toLowerCase())
  );

/**
 * One search field with a reciter/surah switch, a line of filters with counts, and the
 * reciter grid. A surah opens its own page: every reciter who has it.
 */
export function ReciterBrowser({ reciters }: { reciters: CatalogueReciter[] }) {
  const { formatMessage, locale } = useIntl();
  const [mode, setMode] = useState<Mode>('reciter');
  const [query, setQuery] = useState('');
  const [riwaya, setRiwaya] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // The filters: by riwaya and by country, each with its counts. A country chip
  // appears only for reciters whose country has been checked
  // (lib/reciter-countries.ts).
  const riwayat = useMemo(() => countBy(reciters, (r) => r.riwaya), [reciters]);
  const countries = useMemo(() => countBy(reciters, (r) => r.country), [reciters]);
  const countryName = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return (code: string) => names.of(code) ?? code;
  }, [locale]);

  const filtered = useMemo(
    () =>
      reciters.filter((r) => {
        if (riwaya && r.riwaya !== riwaya) return false;
        if (country && r.country !== country) return false;
        return mode !== 'reciter' || !query.trim() || matches(r.name, query);
      }),
    [reciters, riwaya, country, mode, query]
  );

  const filtering = riwaya || country || (mode === 'reciter' && query.trim());
  const shown = filtering || expanded ? filtered : filtered.slice(0, FIRST_ROW);

  const surahs = useMemo(
    () =>
      SURAHS.filter(
        (surah) =>
          !query.trim() ||
          String(surah.id) === query.trim() ||
          matches(getSurahDisplayName(surah, 'ar'), query) ||
          matches(surah.englishName, query)
      ),
    [query]
  );

  return (
    <section
      id="reciters"
      aria-labelledby="reciters-title"
      className="flex scroll-mt-6 flex-col gap-7"
    >
      <div className="flex flex-col gap-3">
        {/* One field; what it searches is a small switch at its end. */}
        <div className="flex h-14 items-center gap-2 rounded-full border border-border bg-surface pe-1.5 ps-5 transition-colors focus-within:border-border-strong">
          <label className="flex min-w-0 flex-1 items-center gap-3">
            <IoSearchOutline
              className="h-5 w-5 shrink-0 text-ink-muted"
              aria-hidden="true"
            />
            <span className="sr-only">
              {formatMessage({ id: 'browse.searchLabel' })}
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={formatMessage({
                id:
                  mode === 'reciter'
                    ? 'browse.placeholderReciter'
                    : 'browse.placeholderSurah',
              })}
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[17px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-0"
            />
          </label>
          <div
            role="group"
            aria-label={formatMessage({ id: 'browse.mode' })}
            className="flex shrink-0 rounded-full bg-surface-sunken p-1"
          >
            {(['reciter', 'surah'] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
                className={cn(
                  'h-9 rounded-full px-3.5 text-sm transition-colors',
                  mode === item
                    ? 'bg-ink font-bold text-background'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                {formatMessage({
                  id:
                    item === 'reciter'
                      ? 'browse.modeReciter'
                      : 'browse.modeSurah',
                })}
              </button>
            ))}
          </div>
        </div>

        {mode === 'reciter' && (
          <div
            role="group"
            aria-label={formatMessage({ id: 'browse.filters' })}
            className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
          >
            <FilterChip
              active={!riwaya && !country}
              onClick={() => {
                setRiwaya(null);
                setCountry(null);
              }}
              label={formatMessage({ id: 'browse.chipAll' })}
              count={reciters.length}
            />
            {riwayat.map(([value, count]) => (
              <FilterChip
                key={value}
                active={riwaya === value}
                onClick={() => setRiwaya(riwaya === value ? null : value)}
                label={value}
                count={count}
              />
            ))}
            {countries.length > 0 && (
              <span aria-hidden="true" className="mx-1 w-px shrink-0 self-stretch bg-border" />
            )}
            {countries.map(([code, count]) => (
              <FilterChip
                key={code}
                active={country === code}
                onClick={() => setCountry(country === code ? null : code)}
                label={`${flagOf(code)} ${countryName(code)}`}
                count={count}
              />
            ))}
          </div>
        )}
      </div>

      {mode === 'reciter' ? (
        <>
          <h2
            id="reciters-title"
            className="font-display text-[32px] font-black leading-[1.3] text-ink sm:text-[44px]"
          >
            {formatMessage({
              id: filtering ? 'browse.results' : 'browse.popular',
            })}
          </h2>
          {shown.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
              {shown.map((reciter) => (
                <ReciterCard key={reciter.slug} reciter={reciter} />
              ))}
            </div>
          ) : (
            <p className="text-ink-muted">
              {formatMessage({ id: 'browse.empty' })}
            </p>
          )}
          {!filtering && filtered.length > FIRST_ROW && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex h-12 items-center gap-2 self-center rounded-full border-[1.5px] border-ink px-6 text-base font-bold text-ink hover:bg-surface-sunken"
            >
              {expanded ? (
                <IoChevronUp className="h-[18px] w-[18px]" aria-hidden="true" />
              ) : (
                <IoChevronDown
                  className="h-[18px] w-[18px]"
                  aria-hidden="true"
                />
              )}
              {expanded
                ? formatMessage({ id: 'browse.showLess' })
                : formatMessage(
                    { id: 'browse.showAll' },
                    { count: filtered.length }
                  )}
            </button>
          )}
        </>
      ) : (
        <>
          <h2
            id="reciters-title"
            className="font-display text-[32px] font-black leading-[1.3] text-ink sm:text-[44px]"
          >
            {formatMessage({ id: 'library.title' })}
          </h2>
          {surahs.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {surahs.map((surah) => (
                <Link
                  key={surah.id}
                  href={`/surah/${surah.id}`}
                  className="flex items-center gap-3 rounded-[18px] border border-border px-3.5 py-3 hover:border-border-strong"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-[15px] font-bold text-ink">
                    {surah.id}
                  </span>
                  <span className="flex-1 text-lg font-bold leading-[1.4] text-ink">
                    {getSurahDisplayName(surah, locale)}
                  </span>
                  <IoChevronBack
                    className="h-5 w-5 shrink-0 text-ink-muted ltr:rotate-180"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink-muted">
              {formatMessage({ id: 'browse.empty' })}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** Values of [pick] over [list] with how many have each, most first. */
function countBy<T>(list: T[], pick: (item: T) => string | null): [string, number][] {
  const counts = new Map<string, number>();
  for (const item of list) {
    const value = pick(item);
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]);
}

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm transition-colors sm:px-3.5',
        active
          ? 'bg-ink font-bold text-background'
          : 'border border-border text-ink hover:border-border-strong'
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'opacity-70' : 'text-ink-subtle')}>
        {count}
      </span>
    </button>
  );
}
