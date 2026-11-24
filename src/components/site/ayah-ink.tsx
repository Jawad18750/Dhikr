'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils';

/** Bumped when the reader draws ayahs differently, so browsers drop their old copies. */
const INK_VERSION = 3;

/**
 * An ayah (or one word of it) in the Jamahiriya mushaf's own ink: the printed words,
 * wrapped to this column, coloured by the text colour (a mask, so it follows the theme).
 * The words are never in the page as text (not even while loading, not in its data): the
 * mushaf's text stays ours. Screen readers hear which ayah it is (`label`).
 *
 * The picture is asked for once the ayah nears the screen, at the screen's density, and
 * the browser keeps it. Until it comes, an empty line holds the place. `wrap={false}` (and a
 * single `word`) draws one line whatever the column, with no measuring.
 */
export function AyahInk({
  surah,
  ayah,
  word,
  label,
  line = 44,
  wrap = true,
  className,
}: {
  surah: number;
  ayah: number;
  word?: number;
  /** What a screen reader says, «سورة البقرة، الآية 255»; by default the ayah's number. */
  label?: string;
  /** One printed line's height, CSS px. */
  line?: number;
  wrap?: boolean;
  className?: string;
}) {
  const box = useRef<HTMLSpanElement>(null);
  const oneLine = !wrap || word !== undefined;
  // The column, in 40 px steps; 0 until the ayah is near the screen.
  const [columns, setColumns] = useState(0);
  const [picture, setPicture] = useState<{ url: string; w: number; h: number } | null>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    let seen = false;
    const measure = () => {
      if (!seen) return;
      if (oneLine) return setColumns(2400);
      // The column is the container's width, never this element's own (which the
      // picture sets): no loop between the two.
      const width = node.parentElement?.clientWidth ?? 0;
      setColumns(Math.max(120, Math.round(width / 40) * 40));
    };
    const near = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen) {
          seen = true;
          measure();
        }
      },
      { rootMargin: '600px 0px' }
    );
    near.observe(node);
    const resize = oneLine ? null : new ResizeObserver(measure);
    if (resize && node.parentElement) resize.observe(node.parentElement);
    return () => {
      near.disconnect();
      resize?.disconnect();
    };
  }, [oneLine]);

  useEffect(() => {
    if (columns === 0) return;
    const density = Math.min(2, window.devicePixelRatio || 1);
    const height = Math.min(200, Math.max(60, Math.round((line * density) / 10) * 10));
    const width = Math.min(2400, Math.round((columns * density) / 40) * 40);
    // Shown at one printed line per `line` CSS px, whatever density it was drawn at.
    const ratio = line / height;
    const url = `/api/reader/ayah?v=${INK_VERSION}&surah=${surah}&ayah=${ayah}&height=${height}&width=${width}${word ? `&word=${word}` : ''}`;
    let live = true;
    const image = new Image();
    image.onload = () => {
      if (live) setPicture({ url, w: image.naturalWidth * ratio, h: image.naturalHeight * ratio });
    };
    image.src = url;
    return () => {
      live = false;
    };
  }, [surah, ayah, word, columns, line]);

  return (
    <span
      ref={box}
      role="img"
      aria-label={label ?? `﴿${surah}:${ayah}${word ? `:${word}` : ''}﴾`}
      className={cn('relative inline-block max-w-full align-middle', !picture && !oneLine && 'w-full', className)}
    >
      {picture ? (
        <span
          aria-hidden="true"
          className="block max-w-full bg-current"
          style={{
            width: picture.w,
            height: picture.h,
            maskImage: `url(${picture.url})`,
            WebkitMaskImage: `url(${picture.url})`,
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'right center',
            WebkitMaskPosition: 'right center',
          }}
        />
      ) : (
        <span
          aria-hidden="true"
          className="block animate-pulse rounded-lg bg-current opacity-[0.07]"
          style={{ height: line, width: oneLine ? line * (word ? 1.6 : 5) : '100%' }}
        />
      )}
    </span>
  );
}
