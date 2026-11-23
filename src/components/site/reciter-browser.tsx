'use client';

import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import {
  IoChevronDown,
  IoChevronUp,
  IoPlayOutline,
  IoSearchOutline,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { SURAHS } from '@/constants';
import { selectedReciterAtom } from '@/jotai/atom';
import type { CatalogueReciter } from '@/lib/dhikr-catalogue';
import { reciterRouteFor } from '@/lib/reciter-route';
import { cn, getSurahDisplayName, normalizeArabicText } from '@/utils';

import { ReciterCard } from './reciter-card';

type Mode = 'reciter' | 'surah';
type Chip = 'all' | 'murattal' | 'hadr' | 'complete';

/** How many cards show before «show all»: the most listened. */
const FIRST_ROW = 12;

const matches = (text: string, query: string) =>
  normalizeArabicText(text.toLowerCase()).includes(
    normalizeArabicText(query.toLowerCase())
  );

/**
 * One search field with a reciter/surah switch, a line of filters with counts, and the
 * reciter grid. Searching by surah opens it with the reciter last played,
 * or the most listened one.
 */
export function ReciterBrowser({ reciters }: { reciters: CatalogueReciter[] }) {
  const { formatMessage, locale } = useIntl();
  const lastReciter = useAtomValue(selectedReciterAtom);
  const [mode, setMode] = useState<Mode>('reciter');
  const [query, setQuery] = useState('');
  const [chip, setChip] = useState<Chip>('all');
  const [expanded, setExpanded] = useState(false);

  const chips = useMemo(
    () =>
      [
        {
          id: 'all',
          label: 'browse.chipAll',
          count: reciters.length,
        },
        {
          id: 'murattal',
          label: 'browse.chipMurattal',
          count: reciters.filter((r) => r.style === 'مرتل').length,
        },
        {
          id: 'hadr',
          label: 'browse.chipHadr',
          count: reciters.filter((r) => r.style === 'حدر').length,
        },
        {
          id: 'complete',
          label: 'browse.chipComplete',
          count: reciters.filter((r) => r.surahTotal === 114).length,
        },
      ].filter((item) => item.count > 0) as {
        id: Chip;
        label: string;
        count: number;
      }[],
    [reciters]
  );

  const filtered = useMemo(
    () =>
      reciters.filter((r) => {
        if (chip === 'murattal' && r.style !== 'مرتل') return false;
        if (chip === 'hadr' && r.style !== 'حدر') return false;
        if (chip === 'complete' && r.surahTotal !== 114) return false;
        return mode !== 'reciter' || !query.trim() || matches(r.name, query);
      }),
    [reciters, chip, mode, query]
  );

  const filtering = chip !== 'all' || (mode === 'reciter' && query.trim());
  const shown = filtering || expanded ? filtered : filtered.slice(0, FIRST_ROW);

  // Surah search plays with the last reciter, else the most listened one.
  const surahHost = useMemo(() => {
    if (lastReciter) {
      return { href: reciterRouteFor(lastReciter), name: lastReciter.name };
    }
    const top = reciters[0];
    return top ? { href: top.href, name: top.name } : null;
  }, [lastReciter, reciters]);

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
            {chips.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={chip === item.id}
                onClick={() => setChip(item.id)}
                className={cn(
                  'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm transition-colors sm:px-3.5',
                  chip === item.id
                    ? 'bg-ink font-bold text-background'
                    : 'border border-border text-ink hover:border-border-strong'
                )}
              >
                {formatMessage({ id: item.label })}
                <span
                  className={cn(
                    'tabular-nums',
                    chip === item.id ? 'opacity-70' : 'text-ink-subtle'
                  )}
                >
                  {item.count}
                </span>
              </button>
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
            {formatMessage({ id: 'browse.modeSurah' })}
            {surahHost && (
              <span className="ms-3 text-lg font-medium text-ink-muted">
                {formatMessage(
                  { id: 'browse.surahWith' },
                  { name: surahHost.name }
                )}
              </span>
            )}
          </h2>
          {surahs.length > 0 && surahHost ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2.5">
              {surahs.map((surah) => (
                <a
                  key={surah.id}
                  href={`${surahHost.href}&surah=${surah.id}`}
                  className="flex items-center gap-3 rounded-[18px] border border-border px-3.5 py-3 hover:border-border-strong"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-sunken text-[15px] font-bold text-ink">
                    {surah.id}
                  </span>
                  <span className="flex-1 text-lg font-bold leading-[1.4] text-ink">
                    {getSurahDisplayName(surah, locale)}
                  </span>
                  <IoPlayOutline
                    className="h-5 w-5 shrink-0 text-ink-muted"
                    aria-hidden="true"
                  />
                </a>
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
