'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { openReaderSession } from '@/lib/reader/session';
import { cn } from '@/utils';

/**
 * The reader, inside the player: the surah as one continuous line of the printed ink of
 * مصحف الجماهيرية, right to left, gliding so the word being recited stays in the middle,
 * turned gold in its own ink as the reciter reaches it. A swipe (or the wheel) looks along
 * the line; a tap on a word goes there in the recitation.
 *
 * What arrives is pictures only (docs/reader-security.md): the line in tiles, each drawn
 * into a canvas, and the lit word as a transparent overlay of the tile it sits in. The
 * browser holds no shape, no word box and no coordinate: where the lit word is, it reads
 * from the overlay's own pixels, the same pixels the screen shows.
 */
type Strip = { width: number; height: number; tile: number; tiles: number };
type Timing = [number, number, number, number];
type Lit = { bitmap: ImageBitmap; tile: number; centre: number };

/** How long a look along the line holds before it glides back to the recited word. */
const LOOK_MS = 4000;

const openSession = openReaderSession;

const tileCache = new Map<string, Promise<ImageBitmap | null>>();
function tileBitmap(url: string) {
  let held = tileCache.get(url);
  if (!held) {
    held = fetch(url, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.blob().then((b) => createImageBitmap(b)) : null))
      .catch(() => null);
    tileCache.set(url, held);
    if (tileCache.size > 48) tileCache.delete(tileCache.keys().next().value as string);
  }
  return held;
}

/** The lit overlay, and where its ink is: the middle of its own opaque pixels. */
async function litOverlay(url: string): Promise<Lit | null> {
  const response = await fetch(url, { credentials: 'same-origin' }).catch(() => null);
  if (!response?.ok) return null;
  const tile = Number(response.headers.get('x-tile'));
  const bitmap = await createImageBitmap(await response.blob());
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !Number.isInteger(tile)) return null;
  context.drawImage(bitmap, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, bitmap.width, bitmap.height);
  let left = width;
  let right = -1;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 40) {
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (right < 0) return null;
  return { bitmap, tile, centre: (left + right) / 2 };
}

function paint(canvas: HTMLCanvasElement | null, image: ImageBitmap | null) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  if (!image) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  canvas.width = image.width;
  canvas.height = image.height;
  context.clearRect(0, 0, image.width, image.height);
  context.drawImage(image, 0, 0);
}

export function ReaderLine({
  slug,
  surah,
  audio,
  onSeek,
}: {
  slug: string;
  surah: number;
  audio: React.RefObject<HTMLAudioElement | null>;
  onSeek: (seconds: number) => void;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [viewWidth, setViewWidth] = useState(0);
  const [dpr, setDpr] = useState(1);
  /** The line's height on the screen (CSS px); the picture is drawn at its density. */
  const [size, setSize] = useState<number | null>(null);
  const [held, setStrip] = useState<Strip | null>(null);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [lit, setLit] = useState<{ ayah: number; word: number } | null>(null);
  const [dark, setDark] = useState(false);

  // The view's width, the screen's density and a text size that suits it.
  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const measure = () => {
      setViewWidth(view.clientWidth);
      setDpr(Math.min(3, window.devicePixelRatio || 1));
      setSize(view.clientWidth < 640 ? 58 : 76);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(view);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDark(root.classList.contains('dark'));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // The picture's height in device pixels (10 px steps, as the server takes them), and on
  // the screen.
  const pixelsOf = (css: number) => Math.min(400, Math.max(60, Math.round((css * dpr) / 10) * 10));
  const pixels = size ? pixelsOf(size) : 0;
  const lineHeight = pixels / dpr;
  // The player card is the page reversed (black on a light page, white on a dark one), and
  // the ink is drawn for the card.
  const theme = dark ? 'light' : 'dark';
  // The line in hand, only once it is the one for this size (never a stale one for a render).
  const strip = held && held.height === pixels ? held : null;

  useEffect(() => {
    if (!pixels) return;
    let gone = false;
    setStrip(null);
    void (async () => {
      if (!(await openSession())) return;
      const s = await fetch(`/api/reader/${surah}/strip?height=${pixels}`, {
        credentials: 'same-origin',
      })
        .then((r) => (r.ok ? (r.json() as Promise<Strip>) : null))
        .catch(() => null);
      if (!gone) setStrip(s);
    })();
    return () => {
      gone = true;
    };
  }, [surah, pixels]);

  useEffect(() => {
    let gone = false;
    setTimings([]);
    void (async () => {
      if (!(await openSession())) return;
      const t = await fetch(`/api/reader/timings/${slug}/${surah}`, { credentials: 'same-origin' })
        .then((r) => (r.ok ? (r.json() as Promise<{ words: Timing[] }>) : { words: [] }))
        .catch(() => ({ words: [] as Timing[] }));
      if (!gone) setTimings(t.words);
    })();
    return () => {
      gone = true;
    };
  }, [slug, surah]);

  // Follow the recitation: the word whose time it is.
  useEffect(() => {
    if (!timings.length) return;
    let frame = 0;
    let last = '';
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = (audio.current?.currentTime ?? 0) * 1000 + 60;
      let lo = 0;
      let hi = timings.length - 1;
      let at = -1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (timings[mid][0] <= t) {
          at = mid;
          lo = mid + 1;
        } else hi = mid - 1;
      }
      // A word stays lit through the breath after it, until the next begins, but not
      // through a long pause or a passage the timings do not cover.
      const next = timings[at + 1];
      const until = Math.min(next ? next[0] : Infinity, (at >= 0 ? timings[at][1] : 0) + 1500);
      const hit = at >= 0 && t < until ? timings[at] : null;
      const key = hit ? `${hit[2]}:${hit[3]}` : '';
      if (key !== last) {
        last = key;
        setLit(hit ? { ayah: hit[2], word: hit[3] } : null);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [timings, audio]);

  // The lit word's overlay, and the next two fetched ahead.
  const litCache = useRef(new Map<string, Promise<Lit | null>>());
  const litUrl = useCallback(
    (ayah: number, word: number) =>
      `/api/reader/${surah}/strip/word?height=${pixels}&theme=${theme}&ayah=${ayah}&word=${word}`,
    [surah, pixels, theme]
  );
  const litImage = useCallback(
    (ayah: number, word: number) => {
      const url = litUrl(ayah, word);
      let held = litCache.current.get(url);
      if (!held) {
        held = litOverlay(url);
        litCache.current.set(url, held);
        if (litCache.current.size > 40) {
          litCache.current.delete(litCache.current.keys().next().value as string);
        }
      }
      return held;
    },
    [litUrl]
  );
  const [shown, setShown] = useState<Lit | null>(null);
  useEffect(() => {
    if (!lit || !strip) {
      setShown(null);
      return;
    }
    let gone = false;
    void litImage(lit.ayah, lit.word).then((overlay) => {
      if (!gone) setShown(overlay);
    });
    const at = timings.findIndex((t) => t[2] === lit.ayah && t[3] === lit.word);
    for (const next of timings.slice(at + 1, at + 3)) void litImage(next[2], next[3]);
    return () => {
      gone = true;
    };
  }, [lit, strip, litImage, timings]);

  // Where the line stands: the point of it (CSS px from its left end) in the view's middle.
  const width = strip ? strip.width / dpr : 0;
  const [centre, setCentre] = useState<number | null>(null);
  const [gliding, setGliding] = useState(true);
  const lookUntil = useRef(0);
  const litCentre = shown && strip ? (shown.tile * strip.tile + shown.centre) / dpr : null;
  const litCentreRef = useRef(litCentre);
  litCentreRef.current = litCentre;

  // A new line opens at its beginning, on the right.
  useEffect(() => {
    if (!strip || !viewWidth) return;
    setGliding(false);
    // Its first word clear of the fade at the right edge (globals.css: 9% of the view).
    setCentre(litCentreRef.current ?? width - viewWidth / 2 + viewWidth * 0.12 + 8);
  }, [strip, viewWidth, width]);

  // Follow the recited word, unless the reader is looking elsewhere along the line.
  const backToWord = useCallback(() => {
    if (Date.now() < lookUntil.current || litCentreRef.current === null) return;
    setGliding(true);
    setCentre(litCentreRef.current);
  }, []);
  useEffect(() => {
    if (litCentre !== null) backToWord();
  }, [litCentre, backToWord]);

  const lookTimer = useRef(0);
  const look = (to: number) => {
    lookUntil.current = Date.now() + LOOK_MS;
    setGliding(false);
    setCentre(Math.min(width, Math.max(0, to)));
    window.clearTimeout(lookTimer.current);
    lookTimer.current = window.setTimeout(backToWord, LOOK_MS + 30);
  };
  useEffect(() => () => window.clearTimeout(lookTimer.current), []);

  // A swipe moves along the line; a touch that hardly moved is a tap on a word.
  const drag = useRef<{ x: number; centre: number; moved: boolean; id: number } | null>(null);
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (centre === null) return;
    drag.current = { x: event.clientX, centre, moved: false, id: event.pointerId };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const held = drag.current;
    if (!held || held.id !== event.pointerId) return;
    const dx = event.clientX - held.x;
    if (!held.moved && Math.abs(dx) < 6) return;
    if (!held.moved) event.currentTarget.setPointerCapture(event.pointerId);
    held.moved = true;
    look(held.centre - dx);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const held = drag.current;
    drag.current = null;
    if (!held || held.id !== event.pointerId || held.moved) return;
    void tap(event.clientX, event.clientY);
  };
  // The wheel looks along the line too (down, or a swipe left on a trackpad, reads on:
  // leftwards, as the line runs), and the page under the player stays put.
  const wheel = useRef<(event: WheelEvent) => void>(() => {});
  wheel.current = (event: WheelEvent) => {
    if (centre === null) return;
    event.preventDefault();
    look(centre + event.deltaX - event.deltaY);
  };
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const listener = (event: WheelEvent) => wheel.current(event);
    view.addEventListener('wheel', listener, { passive: false });
    return () => view.removeEventListener('wheel', listener);
  }, []);

  const tap = async (clientX: number, clientY: number) => {
    const track = trackRef.current;
    if (!track || !strip) return;
    const rect = track.getBoundingClientRect();
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;
    if (x < 0 || x > strip.width) return;
    const response = await fetch(
      `/api/reader/${surah}/strip/hit?height=${pixels}&x=${x.toFixed(1)}&y=${y.toFixed(1)}`,
      { credentials: 'same-origin' }
    ).catch(() => null);
    const word = response?.ok
      ? ((await response.json()) as { ayah: number; word: number } | null)
      : null;
    if (!word) return;
    const timing = timings.find((t) => t[2] === word.ayah && t[3] === word.word);
    if (!timing) return;
    lookUntil.current = 0;
    onSeek(timing[0] / 1000);
  };

  // The tiles near the view, asked for once the line has stopped moving for a moment.
  const [settled, setSettled] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(centre), gliding ? 0 : 140);
    return () => window.clearTimeout(timer);
  }, [centre, gliding]);
  let nearKey = '';
  if (strip && settled !== null && viewWidth) {
    const from = Math.max(0, Math.floor(((settled - viewWidth) * dpr) / strip.tile));
    const to = Math.min(strip.tiles - 1, Math.floor(((settled + viewWidth) * dpr) / strip.tile));
    const near: number[] = [];
    for (let k = from; k <= to; k++) near.push(k);
    nearKey = near.join(',');
  }
  const picture = `${surah}:${pixels}:${theme}`;
  const [mounted, setMounted] = useState<{ picture: string; tiles: number[] }>({
    picture,
    tiles: [],
  });
  useEffect(() => {
    if (!nearKey) return;
    // Keep what was drawn, so a stretch does not blink out while the line glides past;
    // a new picture (surah, size or theme) starts afresh.
    setMounted((held) => ({
      picture,
      tiles: [
        ...new Set([
          ...nearKey.split(',').map(Number),
          ...(held.picture === picture ? held.tiles : []),
        ]),
      ].slice(0, 12),
    }));
  }, [nearKey, picture]);

  const offset = centre === null ? 0 : viewWidth / 2 - centre;

  return (
    <div
      ref={viewRef}
      dir="ltr"
      className="reader-line relative w-full touch-pan-y select-none overflow-hidden"
      style={{ height: (lineHeight || 58) + 16 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      onContextMenu={(event) => event.preventDefault()}
    >
      {(!strip || centre === null) && (
        <div
          aria-hidden="true"
          className="absolute inset-x-[18%] top-1/2 h-3 -translate-y-1/2 animate-pulse rounded-full bg-on-hero/10"
        />
      )}
      {strip && centre !== null && (
        <div
          ref={trackRef}
          className={cn(
            'absolute left-0 top-2 cursor-grab active:cursor-grabbing',
            gliding && 'transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)]'
          )}
          style={{ width, height: lineHeight, transform: `translate3d(${offset}px,0,0)` }}
        >
          {(mounted.picture === picture ? mounted.tiles : []).map((k) => (
            <StripTile
              key={`${surah}:${pixels}:${theme}:${k}`}
              url={`/api/reader/${surah}/strip/tile/${k}?height=${pixels}&theme=${theme}`}
              left={(k * strip.tile) / dpr}
              dpr={dpr}
            />
          ))}
          <LitOverlay lit={shown} tile={strip.tile} dpr={dpr} />
        </div>
      )}
    </div>
  );
}

/** One stretch of the line, drawn into its canvas once it arrives. */
function StripTile({ url, left, dpr }: { url: string; left: number; dpr: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    let gone = false;
    void tileBitmap(url).then((image) => {
      if (gone || !image) return;
      paint(ref.current, image);
      setSize({ w: image.width / dpr, h: image.height / dpr });
    });
    return () => {
      gone = true;
    };
  }, [url, dpr]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 transition-opacity duration-500',
        size ? 'opacity-100' : 'opacity-0'
      )}
      style={{ left, width: size?.w ?? 0, height: size?.h ?? 0 }}
    />
  );
}

/** The recited word in gold, laid exactly over its own ink. */
function LitOverlay({ lit, tile, dpr }: { lit: Lit | null; tile: number; dpr: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => paint(ref.current, lit?.bitmap ?? null), [lit]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute top-0"
      style={
        lit
          ? {
              left: (lit.tile * tile) / dpr,
              width: lit.bitmap.width / dpr,
              height: lit.bitmap.height / dpr,
            }
          : { display: 'none' }
      }
    />
  );
}
