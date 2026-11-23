'use client';

import { useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IoCloudDownloadOutline,
  IoPause,
  IoPlay,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoSearchOutline,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { SURAHS } from '@/constants';
import { useMediaSession } from '@/hooks/use-media-session';
import { currentTimeAtom, selectedReciterAtom } from '@/jotai/atom';
import type { SurahFacts } from '@/lib/dhikr-surah-facts';
import type { Reciter } from '@/types';
import { cn, getSurahDisplayName, normalizeArabicText } from '@/utils';

/** Where a listener was in this recitation, kept on this device only. */
type Resume = { index: number; time: number };
const resumeKey = (slug: string) => `dhikr:resume:${slug}`;
const readResume = (slug: string): Resume | null => {
  try {
    const raw = localStorage.getItem(resumeKey(slug));
    return raw ? (JSON.parse(raw) as Resume) : null;
  } catch {
    return null;
  }
};
const writeResume = (slug: string, value: Resume) => {
  try {
    localStorage.setItem(resumeKey(slug), JSON.stringify(value));
  } catch {
    /* private mode or full: resuming is a convenience */
  }
};

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};

/**
 * A reciter's whole library: every surah he has, searchable, each with its
 * ayahs in this numbering and its length, and one player bar along the foot of
 * the screen. A tap on a surah plays it; the next one follows by itself.
 */
export function ReciterLibrary({
  reciter,
  facts,
  initialSurah,
}: {
  reciter: Reciter;
  facts: Record<number, SurahFacts>;
  initialSurah?: number;
}) {
  const { formatMessage, locale } = useIntl();
  const setSelectedReciter = useSetAtom(selectedReciterAtom);
  const setCurrentTime = useSetAtom(currentTimeAtom);
  const playlist = reciter.moshaf.playlist;
  const slug = reciter.moshaf.id;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [query, setQuery] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const pendingSeek = useRef<number | null>(null);

  // The reciter is the "last played" one for the home's surah search.
  useEffect(() => {
    setSelectedReciter(reciter);
  }, [reciter, setSelectedReciter]);

  useEffect(() => {
    const saved = readResume(slug);
    if (saved && saved.index < playlist.length) setResume(saved);
    if (initialSurah) {
      const at = playlist.findIndex((item) => Number(item.surahId) === initialSurah);
      if (at >= 0) setIndex(at);
    }
  }, [slug, playlist, initialSurah]);

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

  const play = useCallback(
    (at: number, from = 0) => {
      const audio = audioRef.current;
      if (!audio || !playlist[at]) return;
      if (at !== index) {
        pendingSeek.current = from;
        setIndex(at);
        setTime(from);
        return; // the src effect plays it
      }
      void audio.play();
    },
    [index, playlist]
  );

  // A new surah: load it and play from where it was asked for.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || index === null || !playlist[index]) return;
    if (audio.src !== playlist[index].link) {
      audio.src = playlist[index].link;
      const from = pendingSeek.current;
      pendingSeek.current = null;
      const start = () => {
        if (from) audio.currentTime = from;
        void audio.play().catch(() => setPlaying(false));
      };
      audio.addEventListener('loadedmetadata', start, { once: true });
      audio.load();
    }
  }, [index, playlist]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (index === null) {
      if (resume) play(resume.index, resume.time);
      else play(0);
      return;
    }
    if (audio.paused) void audio.play();
    else audio.pause();
  };
  const next = () => index !== null && index + 1 < playlist.length && play(index + 1);
  const previous = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (index !== null && index > 0) play(index - 1);
  };

  useMediaSession({
    audioRef,
    playlist,
    currentTrackId: index ?? 0,
    isPlaying: playing,
    onPlay: () => void audioRef.current?.play(),
    onPause: () => audioRef.current?.pause(),
    onNext: next,
    onPrev: previous,
  });

  // Keep the place, now and then and on pause.
  const saved = useRef(0);
  const onTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(audio.currentTime);
    setCurrentTime(audio.currentTime);
    if (index !== null && Date.now() - saved.current > 5000) {
      saved.current = Date.now();
      writeResume(slug, { index, time: audio.currentTime });
    }
  };

  const current = index === null ? null : rows[index];
  const resumeRow = resume ? rows[resume.index] : null;

  return (
    <>
      <div className="flex w-full flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-[52px] items-center gap-2.5 rounded-full bg-gradient-to-b from-gold-light to-gold px-7 text-[17px] font-bold text-[#1b1712] transition-transform active:scale-95"
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
      </div>

      <section aria-labelledby="library-title" className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="library-title"
            className="font-display text-[28px] font-black leading-[1.3] text-ink sm:text-[36px]"
          >
            {formatMessage({ id: 'library.title' })}
            <span className="ms-3 align-middle text-base font-medium text-ink-subtle">
              {formatMessage({ id: 'library.count' }, { count: playlist.length })}
            </span>
          </h2>
          <label className="flex h-11 w-full items-center gap-2.5 rounded-full border border-border bg-surface px-4 transition-colors focus-within:border-border-strong sm:w-[280px]">
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
        </div>

        {shown.length === 0 ? (
          <p className="text-ink-muted">{formatMessage({ id: 'library.empty' })}</p>
        ) : (
          <ol className="grid grid-cols-1 gap-2.5 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((row) => {
              const active = row.at === index;
              return (
                <li key={row.at}>
                  <button
                    type="button"
                    onClick={() => (active ? toggle() : play(row.at))}
                    aria-current={active ? 'true' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3.5 rounded-[18px] border px-3.5 py-3 text-start transition-colors',
                      active
                        ? 'border-gold/60 bg-gold/[0.08]'
                        : 'border-border bg-surface hover:border-border-strong'
                    )}
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
                        <span className="text-[13px] text-ink-subtle">
                          {formatMessage({ id: 'library.ayahs' }, { count: row.facts.ayahs })}
                          {' · '}
                          <span className="tabular-nums">{clock(row.facts.seconds)}</span>
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                        active ? 'text-gold' : 'text-ink-subtle group-hover:text-ink'
                      )}
                    >
                      {active && playing ? (
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
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          if (index !== null && audioRef.current) {
            writeResume(slug, { index, time: audioRef.current.currentTime });
          }
        }}
        onTimeUpdate={onTime}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => (index !== null && index + 1 < playlist.length ? play(index + 1) : setPlaying(false))}
      />

      {current && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="player-bar pointer-events-auto mx-auto flex max-w-[920px] flex-col gap-2 rounded-[24px] bg-hero px-4 pb-3 pt-3 text-on-hero shadow-[0_18px_50px_rgb(0_0_0/0.25)] sm:px-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggle}
                aria-label={formatMessage({ id: playing ? 'library.pause' : 'library.play' })}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-[#1b1712] transition-transform active:scale-90"
              >
                {playing ? (
                  <IoPause className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <IoPlay className="h-5 w-5 translate-x-[-1px] rtl:translate-x-[1px]" aria-hidden="true" />
                )}
              </button>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[16px] font-bold">{current.name}</span>
                <span className="truncate text-[13px] text-on-hero/60">{reciter.name}</span>
              </span>
              <span className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={previous}
                  aria-label={formatMessage({ id: 'library.prev' })}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-hero/80 transition-colors hover:bg-on-hero/10 hover:text-on-hero"
                >
                  <IoPlaySkipForward className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={index === null || index + 1 >= playlist.length}
                  aria-label={formatMessage({ id: 'library.next' })}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-on-hero/80 transition-colors hover:bg-on-hero/10 hover:text-on-hero disabled:opacity-30"
                >
                  <IoPlaySkipBack className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
                <a
                  href={current.link}
                  download
                  aria-label={formatMessage({ id: 'library.download' })}
                  className="hidden h-10 w-10 items-center justify-center rounded-full text-on-hero/80 transition-colors hover:bg-on-hero/10 hover:text-on-hero sm:flex"
                >
                  <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3 text-[12px] tabular-nums text-on-hero/60">
              <span className="w-12 text-start">{clock(time)}</span>
              <input
                type="range"
                min={0}
                max={duration || current.facts?.seconds || 0}
                step={1}
                value={Math.min(time, duration || time)}
                onChange={(event) => {
                  const audio = audioRef.current;
                  if (audio) audio.currentTime = Number(event.target.value);
                }}
                aria-label={formatMessage({ id: 'library.seek' })}
                className="player-seek h-1 flex-1"
                style={
                  {
                    '--progress': `${duration ? (time / duration) * 100 : 0}%`,
                  } as React.CSSProperties
                }
              />
              <span className="w-12 text-end">{clock(duration || current.facts?.seconds || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
