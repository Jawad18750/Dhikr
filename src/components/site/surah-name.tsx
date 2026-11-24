'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

import { openReaderSession } from '@/lib/reader/session';
import { cn } from '@/utils';

/**
 * A surah's name as مصحف الجماهيرية prints it («سورة …»), the same calligraphy as the apps:
 * a picture from the reader service used as a mask, so it takes the text's colour in every
 * theme. The plain name stays for screen readers, search and copying, but is never drawn:
 * until the picture is there the name's place is held empty, never filled with a font.
 *
 * A list asks once for all 114 names at its size (one picture, a cell each); a single name
 * (`alone`) asks for itself. The picture is asked for as soon as this module loads, kept for
 * the page's life, and kept by the browser for a month, so on every visit after the first it
 * is there at once.
 */
type Names = { url: string; cell: number; height: number };
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
const VERSION = 1;
const sheets = new Map<string, Promise<Names | null>>();
const ready = new Map<string, Names>();

const dpr = () => (typeof window === 'undefined' ? 1 : Math.min(3, window.devicePixelRatio || 1));
const heightFor = (size: number) => Math.min(160, Math.max(20, Math.round((size * dpr()) / 2) * 2));
const keyOf = (height: number, surah?: number) => `${height}:${surah ?? 'all'}`;

function namesAt(height: number, surah?: number): Promise<Names | null> {
  const key = keyOf(height, surah);
  let held = sheets.get(key);
  if (!held) {
    held = (async () => {
      const url = `/api/reader/names?height=${height}${surah ? `&surah=${surah}` : ''}&v=${VERSION}`;
      let response = await fetch(url, { credentials: 'same-origin' }).catch(() => null);
      // The names need a reader session: open one when refused for want of it, and ask again.
      if (response?.status === 401 && (await openReaderSession())) {
        response = await fetch(url, { credentials: 'same-origin' }).catch(() => null);
      }
      if (!response?.ok) return null;
      const cell = Number(response.headers.get('x-name-cell'));
      const names = { url: URL.createObjectURL(await response.blob()), cell, height };
      ready.set(key, names);
      return names;
    })();
    sheets.set(key, held);
    held.then((names) => names ?? sheets.delete(key)).catch(() => sheets.delete(key));
  }
  return held;
}

/** The lists' sheet (names 38 px tall), asked for as soon as this code arrives. */
export const LIST_NAME_SIZE = 38;
if (typeof window !== 'undefined') void namesAt(heightFor(LIST_NAME_SIZE));

export function SurahName({
  surah,
  name,
  size,
  alone = false,
  className,
}: {
  surah: number;
  /** The plain name, for screen readers. */
  name: string;
  /** The name's line height on screen, CSS px. */
  size: number;
  /** Ask for this name only (a page that shows one), not the whole sheet. */
  alone?: boolean;
  className?: string;
}) {
  const only = alone ? surah : undefined;
  // Empty at first, as the server drew it (so hydration matches); a picture already here
  // is put in before the first paint, so it never shows empty either.
  const [names, setNames] = useState<Names | null>(null);
  useIsomorphicLayoutEffect(() => {
    const held = ready.get(keyOf(heightFor(size), only));
    if (held) setNames(held);
  }, [size, only]);
  useEffect(() => {
    if (names) return;
    let gone = false;
    void namesAt(heightFor(size), only).then((got) => {
      if (!gone) setNames(got);
    });
    return () => {
      gone = true;
    };
  }, [size, only, names]);

  const scale = names ? size / names.height : 1;
  const row = alone ? 0 : surah - 1;
  const rows = alone ? 1 : 114;
  return (
    <span className={cn('block', className)} style={{ height: size }}>
      <span className="sr-only">{name}</span>
      {names && (
        <span
          aria-hidden="true"
          className="name-in block max-w-full bg-current"
          style={{
            width: names.cell * scale,
            height: size,
            maskImage: `url(${names.url})`,
            WebkitMaskImage: `url(${names.url})`,
            maskSize: `${names.cell * scale}px ${size * rows}px`,
            WebkitMaskSize: `${names.cell * scale}px ${size * rows}px`,
            maskPosition: `0 ${-row * size}px`,
            WebkitMaskPosition: `0 ${-row * size}px`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
          }}
        />
      )}
    </span>
  );
}
