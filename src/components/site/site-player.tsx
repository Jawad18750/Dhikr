'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  IoBookOutline,
  IoChevronDown,
  IoClose,
  IoCloudDownloadOutline,
  IoPause,
  IoPlay,
  IoPlayBackOutline,
  IoPlayForwardOutline,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoRepeat,
} from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { cn } from '@/utils';

import { ReaderLine } from './reader-line';

/**
 * The site's one player. It lives in the root shell, so a recitation keeps playing from
 * page to page: a bar along the foot of every page, which folds into a small pill and
 * closes. A reciter's library hands it a queue (his surahs) and where to start.
 */
export type PlayerTrack = { id: number; name: string; link: string };
export type PlayerAlbum = {
  /** The recitation's slug: the audio folder, the timings and the resume key. */
  slug: string;
  reciter: string;
  /** His page, to go back to from anywhere. */
  href: string;
  /** His portrait, for the lock screen's now-playing card. */
  portrait?: string | null;
  tracks: PlayerTrack[];
};

/** Where a listener was in a recitation, kept on this device only. */
export type Resume = { index: number; time: number };
const resumeKey = (slug: string) => `dhikr:resume:${slug}`;
export const readResume = (slug: string): Resume | null => {
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

export const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};

type Player = {
  album: PlayerAlbum | null;
  index: number | null;
  playing: boolean;
  /** The surah playing (its number), whichever list it was started from. */
  trackId: number | null;
  /** Play [at] of [album] from [from] seconds (the same surah just resumes). */
  start: (album: PlayerAlbum, at: number, from?: number) => void;
  toggle: () => void;
};

const PlayerContext = createContext<Player | null>(null);

export function usePlayer(): Player {
  const player = useContext(PlayerContext);
  if (!player) throw new Error('usePlayer outside the PlayerProvider');
  return player;
}

const SPEEDS = [1, 1.25, 1.5, 0.75];

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const { formatMessage } = useIntl();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [album, setAlbum] = useState<PlayerAlbum | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(false);
  // The mushaf line is open unless this listener has closed it (remembered on the device).
  const [reading, setReading] = useState(true);
  const readingRef = useRef(reading);
  readingRef.current = reading;
  useEffect(() => {
    try {
      if (localStorage.getItem('dhikr:reader') === 'off') setReading(false);
    } catch {
      /* storage blocked: open */
    }
  }, []);
  const toggleReading = () =>
    setReading((open) => {
      try {
        localStorage.setItem('dhikr:reader', open ? 'off' : 'on');
      } catch {
        /* storage blocked: this visit only */
      }
      return !open;
    });
  const [folded, setFolded] = useState(false);
  const foldedRef = useRef(folded);
  foldedRef.current = folded;
  // The bar or pill on its way out (globals.css: player-out, 220 ms), before the change.
  const [leaving, setLeaving] = useState(false);
  const LEAVE_MS = 220;
  const leaveThen = (change: () => void) => {
    setLeaving(true);
    window.setTimeout(() => {
      change();
      setLeaving(false);
    }, LEAVE_MS);
  };
  const pendingSeek = useRef<number | null>(null);
  // Whether the next surah to load should start by itself (not when coming back paused).
  const pendingPlay = useRef(true);

  // The handlers read the latest of these without being rebuilt each time.
  const live = useRef({ album, index, repeat });
  live.current = { album, index, repeat };

  const start = useCallback((next: PlayerAlbum, at: number, from = 0) => {
    const audio = audioRef.current;
    if (!audio || !next.tracks[at]) return;
    const { album: held, index: heldAt } = live.current;
    if (held?.slug === next.slug && heldAt !== null && held.tracks[heldAt]?.id === next.tracks[at].id) {
      void audio.play();
      return;
    }
    pendingSeek.current = from;
    pendingPlay.current = true;
    setAlbum(next);
    setIndex(at);
    setTime(from);
    setFolded(false);
  }, []);

  // Across a full page load (the other language is another document, or a reload) the
  // recitation carries on: its state is kept for the next page, which picks it up at the
  // same moment. A phone may want a tap before sound starts again on a fresh page; then it
  // waits there, paused, at the exact place.
  const HANDOFF = 'dhikr:player';
  useEffect(() => {
    const save = () => {
      const audio = audioRef.current;
      const { album: held, index: at } = live.current;
      try {
        if (!held || at === null || !audio) {
          sessionStorage.removeItem(HANDOFF);
          return;
        }
        sessionStorage.setItem(
          HANDOFF,
          JSON.stringify({
            album: held,
            index: at,
            time: audio.currentTime,
            playing: !audio.paused,
            reading: readingRef.current,
            folded: foldedRef.current,
            at: Date.now(),
          })
        );
      } catch {
        /* storage blocked: it starts afresh */
      }
    };
    window.addEventListener('pagehide', save);
    return () => window.removeEventListener('pagehide', save);
  }, []);
  useEffect(() => {
    let saved: {
      album: PlayerAlbum;
      index: number;
      time: number;
      playing: boolean;
      reading: boolean;
      folded: boolean;
      at: number;
    } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(HANDOFF) ?? 'null');
      sessionStorage.removeItem(HANDOFF);
    } catch {
      saved = null;
    }
    if (!saved || Date.now() - saved.at > 5 * 60_000 || !saved.album?.tracks?.[saved.index]) return;
    pendingSeek.current = saved.time;
    pendingPlay.current = saved.playing;
    setAlbum(saved.album);
    setIndex(saved.index);
    setTime(saved.time);
    setReading(saved.reading);
    setFolded(saved.folded);
  }, []);

  // A new surah: load it and play from where it was asked for.
  const track = album && index !== null ? album.tracks[index] : null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.src === track.link) return;
    audio.src = track.link;
    const from = pendingSeek.current;
    pendingSeek.current = null;
    const play = pendingPlay.current;
    pendingPlay.current = true;
    const begin = () => {
      if (from) audio.currentTime = from;
      if (play) void audio.play().catch(() => setPlaying(false));
    };
    audio.addEventListener('loadedmetadata', begin, { once: true });
    audio.load();
  }, [track]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed, track]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !live.current.album) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);
  const go = useCallback((at: number) => {
    const held = live.current.album;
    if (held && held.tracks[at]) start(held, at);
  }, [start]);
  const next = useCallback(() => {
    const { index: at } = live.current;
    if (at !== null) go(at + 1);
  }, [go]);
  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const { index: at } = live.current;
    if (at !== null && at > 0) go(at - 1);
  }, [go]);
  const seekBy = (delta: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = Math.max(0, audio.currentTime + delta);
  };
  const close = () => leaveThen(stop);
  const fold = () => leaveThen(() => setFolded(true));
  const unfold = () => leaveThen(() => setFolded(false));
  const stop = () => {
    const audio = audioRef.current;
    const { album: held, index: at } = live.current;
    if (audio && held && at !== null) writeResume(held.slug, { index: at, time: audio.currentTime });
    audio?.pause();
    audio?.removeAttribute('src');
    audio?.load();
    setAlbum(null);
    setIndex(null);
    setFolded(false);
    setTime(0);
    setDuration(0);
  };

  // Keep the place, now and then and on pause.
  const saved = useRef(0);
  const onTime = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(audio.currentTime);
    const { album: held, index: at } = live.current;
    if (held && at !== null && Date.now() - saved.current > 5000) {
      saved.current = Date.now();
      writeResume(held.slug, { index: at, time: audio.currentTime });
    }
  };

  // The phone's lock screen and headphones.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !album || !track) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: album.reciter,
      // The reciter's portrait, else the «ذكر» rosette (an address of its own, so no copy of
      // an older icon cached under another name can stand in for it).
      artwork: [
        ...(album.portrait ? [{ src: album.portrait, sizes: '512x512' }] : []),
        { src: '/images/now-playing-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/images/now-playing-256.png', sizes: '256x256', type: 'image/png' },
      ],
    });
    navigator.mediaSession.setActionHandler('play', () => void audioRef.current?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler('previoustrack', previous);
    navigator.mediaSession.setActionHandler('nexttrack', next);
  }, [album, track, next, previous]);
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = album ? (playing ? 'playing' : 'paused') : 'none';
    }
  }, [playing, album]);

  // Room at the foot of every page for the bar, so it never covers the end of one.
  const barRef = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) {
      setRoom(0);
      return;
    }
    const measure = () => setRoom(bar.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [album, folded]);

  const trackId = track?.id ?? null;
  const value = useMemo<Player>(
    () => ({ album, index, playing, trackId, start, toggle }),
    [album, index, playing, trackId, start, toggle]
  );

  const quiet =
    'flex h-9 w-9 items-center justify-center rounded-full text-on-hero/75 transition-colors hover:bg-on-hero/10 hover:text-on-hero sm:h-10 sm:w-10';
  const total = duration || 0;

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {album && <div aria-hidden="true" style={{ height: room + 16 }} className="w-full shrink-0" />}

      <audio
        ref={audioRef}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          const audio = audioRef.current;
          const { album: held, index: at } = live.current;
          if (audio && held && at !== null) writeResume(held.slug, { index: at, time: audio.currentTime });
        }}
        onTimeUpdate={onTime}
        onDurationChange={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => {
          const audio = audioRef.current;
          const { album: held, index: at, repeat: again } = live.current;
          if (again && audio) {
            audio.currentTime = 0;
            void audio.play();
          } else if (held && at !== null && at + 1 < held.tracks.length) go(at + 1);
          else setPlaying(false);
        }}
      />

      {album && track && index !== null && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:px-6 sm:pb-5">
          {folded ? (
            // Folded: a small pill, play and close, a tap on it opens the bar again.
            <div
              ref={barRef}
              className={`player-pill ${leaving ? 'player-leave' : ''} pointer-events-auto relative mx-auto flex w-fit max-w-full items-center gap-1 overflow-hidden rounded-full bg-hero py-1.5 pe-1.5 ps-1.5 text-on-hero shadow-[0_14px_40px_rgb(0_0_0/0.25)]`}
            >
              <button
                type="button"
                onClick={toggle}
                aria-label={formatMessage({ id: playing ? 'library.pause' : 'library.play' })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-[#1b1712] transition-transform active:scale-90"
              >
                {playing ? (
                  <IoPause className="h-[18px] w-[18px]" aria-hidden="true" />
                ) : (
                  <IoPlay className="h-[18px] w-[18px] rtl:translate-x-[1px]" aria-hidden="true" />
                )}
              </button>
              <Avatar album={album} className="h-9 w-9 rounded-full" />
              <button
                type="button"
                onClick={unfold}
                aria-label={formatMessage({ id: 'player.unfold' })}
                className="flex min-w-0 max-w-[200px] flex-col px-1 text-start"
              >
                <span className="truncate text-[14px] font-bold leading-tight">{track.name}</span>
                <span className="truncate text-[12px] leading-tight text-on-hero/60">{album.reciter}</span>
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={formatMessage({ id: 'player.close' })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-hero/70 transition-colors hover:bg-on-hero/10 hover:text-on-hero"
              >
                <IoClose className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-[2px] origin-right bg-hero-gold/80 ltr:origin-left"
                style={{ transform: `scaleX(${total ? time / total : 0})` }}
              />
            </div>
          ) : (
            <div
              ref={barRef}
              className={`player-bar ${leaving ? 'player-leave' : ''} pointer-events-auto mx-auto flex max-w-[920px] flex-col gap-2 overflow-hidden rounded-[24px] bg-hero px-4 pb-3 pt-3 text-on-hero shadow-[0_18px_50px_rgb(0_0_0/0.25)] sm:px-5`}
            >
              {reading && (
                <div className="reader-in -mx-4 -mt-3 border-b border-on-hero/10 pb-1 pt-2 sm:-mx-5">
                  <ReaderLine
                    slug={album.slug}
                    surah={track.id}
                    audio={audioRef}
                    onSeek={(seconds) => {
                      const audio = audioRef.current;
                      if (!audio) return;
                      audio.currentTime = seconds;
                      if (audio.paused) void audio.play();
                    }}
                  />
                </div>
              )}
              {/* Phones, the names with the avatar, the mushaf and fold on one line… */}
              <div className="flex items-center gap-2.5 sm:hidden">
                <Link href={album.href} className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Avatar album={album} className="h-10 w-10 rounded-[12px]" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-bold">{track.name}</span>
                    <span className="truncate text-[12px] text-on-hero/60">{album.reciter}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={toggleReading}
                  aria-pressed={reading}
                  aria-label={formatMessage({ id: 'reader.open' })}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                    reading ? 'bg-on-hero text-hero' : 'bg-on-hero/10 text-on-hero'
                  )}
                >
                  <IoBookOutline className="h-[17px] w-[17px]" aria-hidden="true" />
                </button>
                <button type="button" onClick={fold} aria-label={formatMessage({ id: 'player.fold' })} className={quiet}>
                  <IoChevronDown className="h-[18px] w-[18px]" aria-hidden="true" />
                </button>
              </div>
              {/* Wider screens, one row: the names, the controls with play in the middle, the mushaf. */}
              <div className="hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:grid">
                <Link href={album.href} className="flex min-w-0 items-center gap-2.5">
                  <Avatar album={album} className="h-10 w-10 rounded-[12px] sm:h-11 sm:w-11" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-[15px] font-bold sm:text-[16px]">{track.name}</span>
                    <span className="truncate text-[12px] text-on-hero/60 sm:text-[13px]">{album.reciter}</span>
                  </span>
                </Link>
                <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => setRepeat((on) => !on)}
                    aria-pressed={repeat}
                    aria-label={formatMessage({ id: 'library.repeat' })}
                    className={cn(
                      'hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-on-hero/10 md:flex',
                      repeat ? 'text-hero-gold' : 'text-on-hero/75 hover:text-on-hero'
                    )}
                  >
                    <IoRepeat className="h-[19px] w-[19px]" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => seekBy(-10)}
                    aria-label={formatMessage({ id: 'library.back10' })}
                    className={cn(quiet, 'hidden sm:flex')}
                  >
                    <IoPlayForwardOutline className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={previous}
                    aria-label={formatMessage({ id: 'library.prev' })}
                    className={quiet}
                  >
                    <IoPlaySkipForward className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={toggle}
                    aria-label={formatMessage({ id: playing ? 'library.pause' : 'library.play' })}
                    className="mx-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-[#1b1712] transition-transform active:scale-90 sm:mx-1.5"
                  >
                    {playing ? (
                      <IoPause className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <IoPlay className="h-5 w-5 translate-x-[-1px] rtl:translate-x-[1px]" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    disabled={index + 1 >= album.tracks.length}
                    aria-label={formatMessage({ id: 'library.next' })}
                    className={cn(quiet, 'disabled:opacity-30')}
                  >
                    <IoPlaySkipBack className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => seekBy(10)}
                    aria-label={formatMessage({ id: 'library.fwd10' })}
                    className={cn(quiet, 'hidden sm:flex')}
                  >
                    <IoPlayBackOutline className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpeed((held) => SPEEDS[(SPEEDS.indexOf(held) + 1) % SPEEDS.length])}
                    aria-label={formatMessage({ id: 'library.speed' })}
                    className="hidden h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold tabular-nums text-on-hero/75 transition-colors hover:bg-on-hero/10 hover:text-on-hero md:flex"
                  >
                    {speed}×
                  </button>
                </div>
                <span className="flex items-center justify-end gap-0.5 sm:gap-1">
                  <a
                    href={`/api/download/${album.slug}/${track.id}`}
                    download
                    aria-label={formatMessage({ id: 'library.download' })}
                    className={cn(quiet, 'hidden lg:flex')}
                  >
                    <IoCloudDownloadOutline className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={toggleReading}
                    aria-pressed={reading}
                    aria-label={formatMessage({ id: 'reader.open' })}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center gap-1.5 rounded-full text-[14px] font-bold transition-colors sm:h-10 lg:w-auto lg:px-3',
                      reading ? 'bg-on-hero text-hero' : 'bg-on-hero/10 text-on-hero hover:bg-on-hero/20',
                      'sm:w-10'
                    )}
                  >
                    <IoBookOutline className="h-[17px] w-[17px]" aria-hidden="true" />
                    <span className="hidden lg:inline">{formatMessage({ id: 'reader.open' })}</span>
                  </button>
                  <button
                    type="button"
                    onClick={fold}
                    aria-label={formatMessage({ id: 'player.fold' })}
                    className={quiet}
                  >
                    <IoChevronDown className="h-[18px] w-[18px]" aria-hidden="true" />
                  </button>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[12px] tabular-nums text-on-hero/60">
                <span className="w-12 text-start">{clock(time)}</span>
                <input
                  type="range"
                  min={0}
                  max={total}
                  step={1}
                  value={Math.min(time, total || time)}
                  onChange={(event) => {
                    const audio = audioRef.current;
                    if (audio) audio.currentTime = Number(event.target.value);
                  }}
                  aria-label={formatMessage({ id: 'library.seek' })}
                  className="player-seek h-1 flex-1"
                  style={{ '--progress': `${total ? (time / total) * 100 : 0}%` } as React.CSSProperties}
                />
                <span className="w-12 text-end">{clock(total)}</span>
              </div>
              {/* …and the controls under the seek bar, play in the middle, with room to breathe. */}
              <div className="flex items-center justify-center gap-3 sm:hidden">
                <button type="button" onClick={() => seekBy(-10)} aria-label={formatMessage({ id: 'library.back10' })} className={quiet}>
                  <IoPlayForwardOutline className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
                <button type="button" onClick={previous} aria-label={formatMessage({ id: 'library.prev' })} className={quiet}>
                  <IoPlaySkipForward className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={formatMessage({ id: playing ? 'library.pause' : 'library.play' })}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold-light to-gold text-[#1b1712] transition-transform active:scale-90"
                >
                  {playing ? (
                    <IoPause className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <IoPlay className="h-5 w-5 rtl:translate-x-[1px]" aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={index + 1 >= album.tracks.length}
                  aria-label={formatMessage({ id: 'library.next' })}
                  className={cn(quiet, 'disabled:opacity-30')}
                >
                  <IoPlaySkipBack className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => seekBy(10)} aria-label={formatMessage({ id: 'library.fwd10' })} className={quiet}>
                  <IoPlayBackOutline className="h-[18px] w-[18px] ltr:rotate-180" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PlayerContext.Provider>
  );
}

/** The reciter's portrait in the player, else his name's first letter. */
function Avatar({ album, className }: { album: PlayerAlbum; className: string }) {
  return album.portrait ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={album.portrait} alt="" className={`${className} shrink-0 object-cover object-top`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${className} flex shrink-0 items-center justify-center bg-on-hero/10 text-[15px] font-black text-hero-gold`}
    >
      {album.reciter.charAt(0)}
    </span>
  );
}
