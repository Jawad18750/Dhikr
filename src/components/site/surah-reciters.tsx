'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { IoChevronBack, IoPause, IoPlay } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { SURAHS } from '@/constants';
import { flagOf } from '@/lib/reciter-countries';
import { cn, getSurahDisplayName } from '@/utils';

import { clock, type PlayerAlbum, usePlayer } from './site-player';

/** One reciter of this surah, as the surah page lists him. */
export type SurahReciter = {
  slug: string;
  name: string;
  href: string;
  portrait: string | null;
  country: string | null;
  style: string;
  /** This surah's length in his recitation, seconds (0 when unknown). */
  seconds: number;
  /** Every surah he has, in order: his queue in the player. */
  surahs: number[];
  /** Where his MP3s are, ending in a slash. */
  server: string;
};

const pad = (n: number) => String(n).padStart(3, '0');

/**
 * Everyone who recites this surah, most listened first. A tap plays it in the site's
 * player, which then carries on through that reciter's recitation; the arrow opens his
 * page.
 */
export function SurahReciters({ surah, reciters }: { surah: number; reciters: SurahReciter[] }) {
  const { formatMessage, locale } = useIntl();
  const player = usePlayer();
  const names = useMemo(() => {
    const out = new Map<number, string>();
    for (const s of SURAHS) out.set(s.id, getSurahDisplayName(s, locale));
    return out;
  }, [locale]);

  const albumOf = (reciter: SurahReciter): PlayerAlbum => ({
    slug: reciter.slug,
    reciter: reciter.name,
    href: reciter.href,
    portrait: reciter.portrait,
    tracks: reciter.surahs.map((id) => ({
      id,
      name: names.get(id) ?? String(id),
      link: `${reciter.server}${pad(id)}.mp3`,
    })),
  });

  return (
    <ol className="grid w-full grid-cols-1 gap-2.5 md:grid-cols-2">
      {reciters.map((reciter) => {
        const active = player.album?.slug === reciter.slug && player.trackId === surah;
        const playing = active && player.playing;
        return (
          <li
            key={reciter.slug}
            className={cn(
              'group flex items-center rounded-[20px] border transition-colors',
              active ? 'border-gold/60 bg-gold/[0.08]' : 'border-border bg-surface hover:border-border-strong'
            )}
          >
            <button
              type="button"
              onClick={() =>
                active ? player.toggle() : player.start(albumOf(reciter), reciter.surahs.indexOf(surah))
              }
              aria-current={active ? 'true' : undefined}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-[20px] py-2.5 pe-2 ps-2.5 text-start"
            >
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[14px] bg-surface-sunken">
                {reciter.portrait ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={reciter.portrait} alt="" className="h-full w-full object-cover object-top" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-display flex h-full w-full items-center justify-center text-xl font-black text-ink-subtle"
                  >
                    {reciter.name.charAt(0)}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 flex items-center justify-center bg-black/45 text-white transition-opacity',
                    active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  )}
                >
                  {playing ? <IoPause className="h-5 w-5" /> : <IoPlay className="h-5 w-5" />}
                </span>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[17px] font-bold text-ink">{reciter.name}</span>
                <span className="truncate text-[13px] text-ink-subtle">
                  {[
                    reciter.style,
                    reciter.country &&
                      `${flagOf(reciter.country)} ${new Intl.DisplayNames([locale], { type: 'region' }).of(reciter.country)}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              {reciter.seconds > 0 && (
                <span className="shrink-0 text-[13px] tabular-nums text-ink-subtle">
                  {clock(reciter.seconds)}
                </span>
              )}
            </button>
            <Link
              href={reciter.href}
              aria-label={`${formatMessage({ id: 'surah.reciterPage' })}: ${reciter.name}`}
              className="me-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
            >
              <IoChevronBack className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
