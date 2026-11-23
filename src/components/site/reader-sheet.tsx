'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { IoAdd,IoClose, IoRemove } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { cn } from '@/utils';

/**
 * The reader: the surah in the printed ink of مصحف الجماهيرية, re-set to fit the screen
 * by the apps' own engine on the server, and the word being recited turned gold, its own
 * ink, as the reciter reaches it. The page follows him; a tap on a word goes there.
 *
 * What arrives is pictures only (docs/reader-security.md): each line drawn into a canvas,
 * the lit word as a second picture laid exactly over its line. The browser holds no shape,
 * no word box and no coordinate; it knows which words a line holds, not where.
 */
type Layout = {
  column: number;
  rows: {
    top: number;
    height: number;
    y0: number;
    y1: number;
    kind: string;
    words: [number, number, number][];
  }[];
};
type Timing = [number, number, number, number];

const ZOOMS = [1.3, 1.6, 2.0, 2.5];

let session: Promise<boolean> | null = null;
const openSession = () =>
  (session ??= fetch('/api/reader/session', { method: 'POST', credentials: 'same-origin' })
    .then((r) => r.ok)
    .catch(() => {
      session = null;
      return false;
    }));

async function bitmap(url: string): Promise<ImageBitmap | null> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) return null;
  return createImageBitmap(await response.blob());
}

function draw(canvas: HTMLCanvasElement | null, image: ImageBitmap | null) {
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

export function ReaderSheet({
  slug,
  surah,
  title,
  audio,
  onSeek,
  onClose,
}: {
  slug: string;
  surah: number;
  title: string;
  audio: React.RefObject<HTMLAudioElement | null>;
  onSeek: (seconds: number) => void;
  onClose: () => void;
}) {
  const { formatMessage } = useIntl();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [timings, setTimings] = useState<Timing[]>([]);
  const [lit, setLit] = useState<{ ayah: number; word: number } | null>(null);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  // The column's width, and a text size that suits it.
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const measure = () => {
      const w = page.clientWidth;
      setWidth(w);
      setZoom((held) => held ?? (w < 520 ? 1.6 : 1.3));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(page);
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

  // The layout and the timings of this surah.
  useEffect(() => {
    if (!zoom) return;
    let gone = false;
    setReady(false);
    void (async () => {
      if (!(await openSession())) return;
      const [l, t] = await Promise.all([
        fetch(`/api/reader/${surah}/layout?zoom=${zoom}`, { credentials: 'same-origin' }).then(
          (r) => (r.ok ? (r.json() as Promise<Layout>) : null)
        ),
        fetch(`/api/reader/timings/${slug}/${surah}`, { credentials: 'same-origin' }).then((r) =>
          r.ok ? (r.json() as Promise<{ words: Timing[] }>) : { words: [] }
        ),
      ]);
      if (gone) return;
      setLayout(l);
      setTimings(t.words);
      setReady(true);
    })();
    return () => {
      gone = true;
    };
  }, [slug, surah, zoom]);

  const scale = layout && width ? width / layout.column : 0;
  const pixelWidth = Math.min(
    1600,
    Math.max(200, Math.round((width * (typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1)) / 40) * 40)
  );
  const theme = dark ? 'dark' : 'light';

  // Which row holds a word.
  const rowOf = useCallback(
    (ayah: number, word: number) =>
      layout?.rows.findIndex((r) => r.words.some(([a, from, to]) => a === ayah && word >= from && word <= to)) ?? -1,
    [layout]
  );

  // Follow the recitation: the word whose time it is.
  useEffect(() => {
    if (!timings.length) return;
    let frame = 0;
    let last = '';
    const tick = () => {
      frame = requestAnimationFrame(tick);
      const t = (audio.current?.currentTime ?? 0) * 1000 + 60;
      let lo = 0, hi = timings.length - 1, at = -1;
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

  // Keep the lit line in view, unless the reader has just scrolled away himself.
  const manualUntil = useRef(0);
  const litRow = lit ? rowOf(lit.ayah, lit.word) : -1;
  useEffect(() => {
    const box = scrollRef.current;
    if (!box || !layout || litRow < 0 || Date.now() < manualUntil.current) return;
    const r = layout.rows[litRow];
    const y = (r.top + r.y0) * scale;
    const target = y - box.clientHeight * 0.35;
    if (Math.abs(box.scrollTop - target) > box.clientHeight * 0.25) {
      box.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  }, [litRow, layout, scale]);

  // The lit word's picture, and the next two fetched ahead.
  const litCache = useRef(new Map<string, Promise<ImageBitmap | null>>());
  const litCanvas = useRef<HTMLCanvasElement>(null);
  const litUrl = useCallback(
    (row: number, ayah: number, word: number) =>
      `/api/reader/${surah}/row/${row}?zoom=${zoom}&width=${pixelWidth}&theme=${theme}&ayah=${ayah}&word=${word}`,
    [surah, zoom, pixelWidth, theme]
  );
  const litImage = useCallback(
    (row: number, ayah: number, word: number) => {
      const url = litUrl(row, ayah, word);
      let held = litCache.current.get(url);
      if (!held) {
        held = bitmap(url);
        litCache.current.set(url, held);
        if (litCache.current.size > 40) {
          litCache.current.delete(litCache.current.keys().next().value as string);
        }
      }
      return held;
    },
    [litUrl]
  );
  useEffect(() => {
    if (!lit || litRow < 0) {
      draw(litCanvas.current, null);
      return;
    }
    let gone = false;
    void litImage(litRow, lit.ayah, lit.word).then((image) => {
      if (!gone) draw(litCanvas.current, image);
    });
    const at = timings.findIndex((t) => t[2] === lit.ayah && t[3] === lit.word);
    for (const next of timings.slice(at + 1, at + 3)) {
      const row = rowOf(next[2], next[3]);
      if (row >= 0) void litImage(row, next[2], next[3]);
    }
    return () => {
      gone = true;
    };
  }, [lit, litRow, litImage, timings, rowOf]);

  // A tap: which word, then its time.
  const onTap = async (row: number, event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!layout || !scale) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale + layout.rows[row].y0;
    const response = await fetch(
      `/api/reader/${surah}/hit?zoom=${zoom}&row=${row}&x=${x.toFixed(1)}&y=${y.toFixed(1)}`,
      { credentials: 'same-origin' }
    );
    const word = response.ok ? ((await response.json()) as { ayah: number; word: number } | null) : null;
    if (!word) return;
    const timing = timings.find((t) => t[2] === word.ayah && t[3] === word.word);
    if (timing) onSeek(timing[0] / 1000);
  };

  const total = layout ? (layout.rows.at(-1)?.top ?? 0) + (layout.rows.at(-1)?.height ?? 0) : 0;
  const zoomAt = zoom ? ZOOMS.indexOf(zoom) : -1;

  return (
    <div className="reader-sheet fixed inset-0 z-[60] flex flex-col bg-background">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={formatMessage({ id: 'reader.close' })}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
        >
          <IoClose className="h-5 w-5" aria-hidden="true" />
        </button>
        <span className="min-w-0 flex-1 truncate text-center font-display text-xl font-black text-ink">
          {title}
        </span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            disabled={zoomAt <= 0}
            onClick={() => setZoom(ZOOMS[zoomAt - 1])}
            aria-label={formatMessage({ id: 'reader.smaller' })}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-sunken disabled:opacity-30"
          >
            <IoRemove className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={zoomAt < 0 || zoomAt >= ZOOMS.length - 1}
            onClick={() => setZoom(ZOOMS[zoomAt + 1])}
            aria-label={formatMessage({ id: 'reader.larger' })}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-surface-sunken disabled:opacity-30"
          >
            <IoAdd className="h-5 w-5" aria-hidden="true" />
          </button>
        </span>
      </div>
      <div
        ref={scrollRef}
        onWheel={() => (manualUntil.current = Date.now() + 4000)}
        onTouchMove={() => (manualUntil.current = Date.now() + 4000)}
        className="flex-1 overflow-y-auto overscroll-contain"
      >
        <div ref={pageRef} className="mx-auto w-full max-w-[760px] px-4 pb-48 pt-8 sm:px-8">
          {!ready && (
            <div className="flex flex-col gap-6 pt-6" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="h-10 animate-pulse rounded-full bg-surface-sunken" />
              ))}
            </div>
          )}
          {ready && layout && scale > 0 && (
            <div className="relative" style={{ height: total * scale }} onContextMenu={(e) => e.preventDefault()}>
              {layout.rows.map((row, index) => (
                <ReaderRow
                  key={`${surah}:${zoom}:${index}:${theme}:${pixelWidth}`}
                  url={`/api/reader/${surah}/row/${index}?zoom=${zoom}&width=${pixelWidth}&theme=${theme}`}
                  top={(row.top + row.y0) * scale}
                  height={(row.y1 - row.y0) * scale}
                  onTap={(event) => void onTap(index, event)}
                  root={scrollRef}
                />
              ))}
              {litRow >= 0 && (
                <canvas
                  ref={litCanvas}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 w-full"
                  style={{
                    top: (layout.rows[litRow].top + layout.rows[litRow].y0) * scale,
                    height: (layout.rows[litRow].y1 - layout.rows[litRow].y0) * scale,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** One line: fetched when it comes near the screen, drawn into its canvas. */
function ReaderRow({
  url,
  top,
  height,
  onTap,
  root,
}: {
  url: string;
  top: number;
  height: number;
  onTap: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  root: React.RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && setNear(true),
      { root: root.current, rootMargin: '600px 0px' }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [root]);
  useEffect(() => {
    if (!near) return;
    let gone = false;
    void bitmap(url).then((image) => {
      if (gone) return;
      draw(ref.current, image);
      setDrawn(true);
    });
    return () => {
      gone = true;
    };
  }, [near, url]);
  return (
    <canvas
      ref={ref}
      onClick={onTap}
      aria-hidden="true"
      className={cn(
        'absolute inset-x-0 w-full cursor-pointer transition-opacity duration-500',
        drawn ? 'opacity-100' : 'opacity-0'
      )}
      style={{ top, height }}
    />
  );
}
