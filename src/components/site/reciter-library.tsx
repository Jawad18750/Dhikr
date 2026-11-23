'use client';

import { useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  IoCheckmark,
  IoCloudDownloadOutline,
  IoPause,
  IoPlay,
  IoSearchOutline,
  IoShareSocialOutline,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { SURAHS } from '@/constants';
import { selectedReciterAtom } from '@/jotai/atom';
import type { SurahFacts } from '@/lib/dhikr-surah-facts';
import { type SeoLocale, withLocale } from '@/lib/seo/routes';
import type { Reciter } from '@/types';
import { cn, getSurahDisplayName, normalizeArabicText } from '@/utils';

import { clock, type PlayerAlbum, readResume, type Resume, usePlayer } from './site-player';

/**
 * A reciter's whole library: every surah he has, searchable, each with its
 * ayahs in this numbering and its length, and one player bar along the foot of
 * the screen. A tap on a surah plays it; the next one follows by itself.
 */
export function ReciterLibrary({
  reciter,
  facts,
  sizes,
  initialSurah,
}: {
  reciter: Reciter;
  facts: Record<number, SurahFacts>;
  /** Surah → bytes of its MP3, for the download sizes. */
  sizes: Record<number, number>;
  initialSurah?: number;
}) {
  const { formatMessage, locale } = useIntl();
  const setSelectedReciter = useSetAtom(selectedReciterAtom);
  const playlist = reciter.moshaf.playlist;
  const slug = reciter.moshaf.id;

  const player = usePlayer();
  const mine = player.album?.slug === slug;
  const index = mine ? player.index : null;
  const playing = mine && player.playing;
  const [query, setQuery] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  // Download mode: surahs ticked for one archive.
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  // Separate files being saved, one after another: how many of how many.
  const [saving, setSaving] = useState<{ done: number; total: number } | null>(null);
  const saveSeparately = async (ids: number[]) => {
    setSaving({ done: 0, total: ids.length });
    for (const [at, id] of ids.entries()) {
      const link = document.createElement('a');
      link.href = `/api/download/${slug}/${id}`;
      link.download = '';
      document.body.append(link);
      link.click();
      link.remove();
      setSaving({ done: at + 1, total: ids.length });
      // A breath between them, so the browser takes each as its own download.
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    setSaving(null);
  };

  // The reciter is the "last played" one for the home's surah search.
  useEffect(() => {
    setSelectedReciter(reciter);
  }, [reciter, setSelectedReciter]);

  useEffect(() => {
    const saved = readResume(slug);
    if (saved && saved.index < playlist.length) setResume(saved);
  }, [slug, playlist]);

  const rows = useMemo(
    () =>
      playlist.map((item, at) => {
        const id = Number(item.surahId);
        const surah = SURAHS.find((s) => s.id === id);
        return {
          at,
          id,
          name: surah ? getSurahDisplayName(surah, locale) : String(id),
          searchable: surah ? `${surah.name} ${surah.englishName} ${id}` : String(id),
          link: item.link,
          facts: facts[id],
          meccan: surah ? surah.revelationType === 'Meccan' : null,
        };
      }),
    [playlist, facts, locale]
  );

  const shown = useMemo(() => {
    const q = normalizeArabicText(query.trim().toLowerCase());
    if (!q) return rows;
    return rows.filter((row) =>
      normalizeArabicText(row.searchable.toLowerCase()).includes(q)
    );
  }, [rows, query]);

  // The queue the site's player takes: this recitation's surahs, in order.
  const album = useMemo<PlayerAlbum>(
    () => ({
      slug,
      reciter: reciter.name,
      href: withLocale(locale as SeoLocale, `/reciter/${reciter.id}?moshafId=${slug}`),
      tracks: rows.map((row) => ({ id: row.id, name: row.name, link: row.link })),
    }),
    [slug, reciter.name, reciter.id, rows, locale]
  );
  const play = (at: number, from = 0) => player.start(album, at, from);
  const toggle = () => {
    if (mine) player.toggle();
    else if (resume) play(resume.index, resume.time);
    else play(0);
  };

  // A shared link to one surah opens on it, unless something is already playing.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || !initialSurah || player.playing) return;
    opened.current = true;
    const at = rows.findIndex((row) => row.id === initialSurah);
    if (at >= 0) player.start(album, at);
  }, [initialSurah, rows, album, player]);

  const share = async (url: string, title: string) => {
    const full = new URL(url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, url: full });
        return;
      }
      await navigator.clipboard.writeText(full);
      setToast(formatMessage({ id: 'library.copied' }));
      window.setTimeout(() => setToast(null), 2200);
    } catch {
      /* dismissed */
    }
  };

  const bytesOf = (ids: Iterable<number>) => {
    let total = 0;
    for (const id of ids) total += sizes[id] ?? 0;
    return total;
  };
  const sizeLabel = (bytes: number) => {
    const mb = bytes / 1_048_576;
    const big = mb >= 1024;
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-u-nu-latn' : locale, {
      style: 'unit',
      unit: big ? 'gigabyte' : 'megabyte',
      unitDisplay: locale === 'ar' ? 'long' : 'short',
      maximumFractionDigits: big || mb < 10 ? 1 : 0,
    }).format(big ? mb / 1024 : mb);
  };
  const allIds = rows.map((row) => row.id);
  const pickedIds = allIds.filter((id) => picked.has(id));
  const downloadHref =
    pickedIds.length === 0
      ? undefined
      : `/api/download/${slug}?s=${pickedIds.length === allIds.length ? 'all' : pickedIds.join(',')}`;
  const toggleId = (id: number) =>
    setPicked((held) => {
      const next = new Set(held);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const resumeRow = resume ? rows[resume.index] : null;

  return (
    <>
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2.5 truncate whitespace-nowrap rounded-full bg-gradient-to-b from-gold-light to-gold px-6 text-[16px] font-bold text-[#1b1712] transition-transform active:scale-95 sm:h-[52px] sm:flex-none sm:px-7 sm:text-[17px]"
        >
          {playing ? (
            <IoPause className="h-[18px] w-[18px]" aria-hidden="true" />
          ) : (
            <IoPlay className="h-[18px] w-[18px]" aria-hidden="true" />
          )}
          {playing
            ? formatMessage({ id: 'library.pause' })
            : index === null && resumeRow
              ? formatMessage({ id: 'library.resume' }, { surah: resumeRow.name })
              : formatMessage({ id: 'library.listen' })}
        </button>
        {allIds.length > 1 && (
          <button
            type="button"
            onClick={() => {
              // The khatma: every surah ticked, then one ZIP or separate files below.
              setPicking(true);
              setPicked(new Set(allIds));
              document.getElementById('library-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            aria-label={`${formatMessage({ id: 'library.khatma' })} · ${sizeLabel(bytesOf(allIds))}`}
            className="flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-full border-[1.5px] border-border text-[15px] font-bold text-ink transition-colors hover:border-border-strong sm:h-[52px] sm:w-auto sm:px-5"
          >
            <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            <span className="hidden sm:inline">{formatMessage({ id: 'library.khatma' })}</span>
            {bytesOf(allIds) > 0 && (
              <span className="hidden font-medium text-ink-subtle sm:inline">
                {sizeLabel(bytesOf(allIds))}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={() => void share(window.location.pathname + window.location.search, reciter.name)}
          aria-label={formatMessage({ id: 'library.share' })}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border text-ink transition-colors hover:border-border-strong sm:h-[52px] sm:w-[52px]"
        >
          <IoShareSocialOutline className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <section aria-labelledby="library-title" className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="library-title"
            className="scroll-mt-28 font-display text-[28px] font-black leading-[1.3] text-ink sm:text-[36px]"
          >
            {formatMessage({ id: 'library.title' })}
            <span className="ms-3 align-middle text-base font-medium text-ink-subtle">
              {formatMessage({ id: 'library.count' }, { count: playlist.length })}
            </span>
          </h2>
          <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-border bg-surface px-4 transition-colors focus-within:border-border-strong sm:w-[280px] sm:flex-none">
            <IoSearchOutline className="h-[18px] w-[18px] shrink-0 text-ink-muted" aria-hidden="true" />
            <span className="sr-only">{formatMessage({ id: 'library.search' })}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={formatMessage({ id: 'library.search' })}
              className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-0"
            />
          </label>
          <button
            type="button"
            aria-pressed={picking}
            onClick={() => {
              setPicking((on) => !on);
              setPicked(new Set());
            }}
            className={cn(
              'flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[15px] font-bold transition-colors',
              picking
                ? 'border-transparent bg-ink text-background'
                : 'border-border text-ink hover:border-border-strong'
            )}
          >
            <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
            {formatMessage({ id: picking ? 'download.close' : 'download.open' })}
          </button>
          </div>
        </div>

        {picking && (
          <div className="download-bar flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-surface-sunken px-4 py-3">
            <span className="min-w-0 flex-1 text-[15px] text-ink-muted">
              {pickedIds.length === 0
                ? formatMessage({ id: 'download.hint' })
                : formatMessage(
                    { id: 'download.summary' },
                    { count: pickedIds.length, size: sizeLabel(bytesOf(pickedIds)) }
                  )}
            </span>
            <button
              type="button"
              onClick={() =>
                setPicked(pickedIds.length === allIds.length ? new Set() : new Set(allIds))
              }
              className="h-10 rounded-full px-3 text-[15px] font-bold text-ink hover:bg-surface"
            >
              {formatMessage({
                id: pickedIds.length === allIds.length ? 'download.none' : 'download.all',
              })}
            </button>
            {saving ? (
              <span className="flex h-10 items-center px-2 text-[15px] font-bold tabular-nums text-ink">
                {formatMessage(
                  { id: 'download.downloadingShort' },
                  { completed: saving.done, total: saving.total }
                )}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <a
                  href={downloadHref}
                  aria-disabled={!downloadHref}
                  className={cn(
                    'flex h-10 items-center gap-2 rounded-full bg-gradient-to-b from-gold-light to-gold px-4 text-[15px] font-bold text-[#1b1712] transition-opacity',
                    !downloadHref && 'pointer-events-none opacity-40'
                  )}
                >
                  <IoCloudDownloadOutline className="h-[17px] w-[17px]" aria-hidden="true" />
                  {formatMessage({ id: 'download.zip' })}
                </a>
                <button
                  type="button"
                  disabled={pickedIds.length === 0}
                  onClick={() => void saveSeparately(pickedIds)}
                  className="flex h-10 items-center gap-2 rounded-full border-[1.5px] border-border px-4 text-[15px] font-bold text-ink transition-colors hover:border-border-strong disabled:opacity-40"
                >
                  {formatMessage({ id: 'download.separate' })}
                </button>
              </span>
            )}
          </div>
        )}

        {shown.length === 0 ? (
          <p className="text-ink-muted">{formatMessage({ id: 'library.empty' })}</p>
        ) : (
          <ol className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((row) => {
              const active = row.at === index;
              return (
                <li
                  key={row.at}
                  className={cn(
                    'group flex items-center rounded-[18px] border transition-colors',
                    (picking ? picked.has(row.id) : active)
                      ? 'border-gold/60 bg-gold/[0.08]'
                      : 'border-border bg-surface hover:border-border-strong'
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      picking ? toggleId(row.id) : active ? toggle() : play(row.at)
                    }
                    aria-current={active ? 'true' : undefined}
                    aria-pressed={picking ? picked.has(row.id) : undefined}
                    className="flex min-w-0 flex-1 items-center gap-3.5 rounded-[18px] px-3.5 py-3 text-start"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums',
                        active ? 'bg-gold text-[#1b1712]' : 'bg-surface-sunken text-ink-muted'
                      )}
                    >
                      {row.id}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[17px] font-bold text-ink">{row.name}</span>
                      {row.facts && (
                        <span className="truncate text-[13px] text-ink-subtle">
                          {row.meccan !== null &&
                            `${formatMessage({ id: row.meccan ? 'library.meccan' : 'library.medinan' })} · `}
                          {formatMessage({ id: 'library.ayahs' }, { count: row.facts.ayahs })}
                        </span>
                      )}
                    </span>
                    {row.facts && (
                      <span className="shrink-0 text-[13px] tabular-nums text-ink-subtle">
                        {picking && sizes[row.id] ? sizeLabel(sizes[row.id]) : clock(row.facts.seconds)}
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                        active ? 'text-gold' : 'text-ink-subtle group-hover:text-ink'
                      )}
                    >
                      {picking ? (
                        <span
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                            picked.has(row.id)
                              ? 'border-gold bg-gold text-[#1b1712]'
                              : 'border-border-strong'
                          )}
                        >
                          {picked.has(row.id) && <IoCheckmark className="h-4 w-4" />}
                        </span>
                      ) : active && playing ? (
                        <span className="flex h-4 items-end gap-[3px]">
                          {[0, 0.25, 0.1].map((delay) => (
                            <span
                              key={delay}
                              className="tool-anim-eq h-full w-[3px] rounded-full bg-current"
                              style={{ animationDelay: `${delay}s` }}
                            />
                          ))}
                        </span>
                      ) : (
                        <IoPlay className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {!picking && (
                    <span className="hidden shrink-0 items-center gap-0.5 pe-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 md:flex">
                      <a
                        href={`/api/download/${slug}/${row.id}`}
                        download
                        aria-label={`${formatMessage({ id: 'library.downloadSurah' })}: ${row.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
                      >
                        <IoCloudDownloadOutline className="h-[17px] w-[17px]" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          void share(
                            `${window.location.pathname}?moshafId=${slug}&surah=${row.id}`,
                            `${row.name} · ${reciter.name}`
                          )
                        }
                        aria-label={`${formatMessage({ id: 'library.shareSurah' })}: ${row.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
                      >
                        <IoShareSocialOutline className="h-[17px] w-[17px]" aria-hidden="true" />
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {toast && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-32 z-50 mx-auto w-fit rounded-full bg-ink px-4 py-2 text-sm font-bold text-background shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
