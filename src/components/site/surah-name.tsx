'use client';

import { useEffect, useState } from 'react';

import { openReaderSession } from '@/lib/reader/session';
import { cn } from '@/utils';

/**
 * A surah's name as مصحف الجماهيرية prints it («سورة …»), the same calligraphy as the apps:
 * a picture from the reader service used as a mask, so it takes the text's colour in every
 * theme. The plain name stays beside it for screen readers, search and copying, and shows
 * until the picture arrives.
 *
 * A list asks once for all 114 names at its size (one picture, a cell each); a single name
 * (`alone`) asks for itself.
 */
type Names = { url: string; cell: number; height: number };
const sheets = new Map<string, Promise<Names | null>>();

function namesAt(height: number, surah?: number): Promise<Names | null> {
  const key = `${height}:${surah ?? 'all'}`;
  let held = sheets.get(key);
  if (!held) {
    held = (async () => {
      if (!(await openReaderSession())) return null;
      const response = await fetch(
        `/api/reader/names?height=${height}${surah ? `&surah=${surah}` : ''}`,
        { credentials: 'same-origin' }
      ).catch(() => null);
      if (!response?.ok) return null;
      const cell = Number(response.headers.get('x-name-cell'));
      const url = URL.createObjectURL(await response.blob());
      return { url, cell, height };
    })();
    sheets.set(key, held);
    held.then((names) => names ?? sheets.delete(key)).catch(() => sheets.delete(key));
  }
  return held;
}

export function SurahName({
  surah,
  name,
  size,
  alone = false,
  className,
}: {
  surah: number;
  /** The plain name, for screen readers and until the picture arrives. */
  name: string;
  /** The name's line height on screen, CSS px. */
  size: number;
  /** Ask for this name only (a page that shows one), not the whole sheet. */
  alone?: boolean;
  className?: string;
}) {
  const [names, setNames] = useState<Names | null>(null);
  useEffect(() => {
    let gone = false;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const height = Math.min(160, Math.max(20, Math.round((size * dpr) / 2) * 2));
    void namesAt(height, alone ? surah : undefined).then((got) => {
      if (!gone) setNames(got);
    });
    return () => {
      gone = true;
    };
  }, [size, alone, surah]);

  if (!names) {
    return <span className={cn('block truncate', className)}>{name}</span>;
  }
  const scale = size / names.height;
  const row = alone ? 0 : surah - 1;
  const rows = alone ? 1 : 114;
  return (
    <span className={cn('block', className)}>
      <span className="sr-only">{name}</span>
      <span
        aria-hidden="true"
        className="block max-w-full bg-current"
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
    </span>
  );
}
