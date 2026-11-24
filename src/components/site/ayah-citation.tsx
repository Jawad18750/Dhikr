'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';

import { AyahInk } from '@/components/site/ayah-ink';

/**
 * A citation in a book («[البقرة: ٢٥٥]»): tapped, the ayahs it names open in the
 * Jamahiriya mushaf's ink, with the way to each ayah's own page. The numbers are ours
 * (Qalun); the label stays as the author wrote it.
 */
export function AyahCitation({
  label,
  surah,
  ayahs,
}: {
  label: string;
  surah: number;
  /** Our ayahs the citation covers (drawn in ink; their text never reaches the page). */
  ayahs: { ayah: number }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  if (ayahs.length === 0) return <span className="text-[0.85em] text-ink-subtle">{label}</span>;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-0.5 text-[0.85em] font-bold text-ink-muted underline decoration-gold/60 decoration-dotted underline-offset-4 hover:text-ink"
      >
        {label}
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-label={label}>
            <button type="button" aria-label="إغلاق" className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div
              dir="rtl"
              className="relative m-3 flex max-h-[80vh] w-full max-w-[560px] flex-col gap-3 overflow-y-auto rounded-[24px] border border-border bg-background p-4 text-foreground shadow-2xl sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-bold text-ink-muted">{label}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="إغلاق"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink hover:border-border-strong"
                >
                  <IoClose className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {ayahs.map((a) => (
                <div key={a.ayah} className="flex flex-col gap-2 rounded-[18px] bg-surface-sunken px-4 py-3 text-ink">
                  <AyahInk surah={surah} ayah={a.ayah} label={`${label}، الآية ${a.ayah}`} line={56} />
                  <Link href={`/ayah/${surah}/${a.ayah}`} className="self-start text-[13.5px] font-bold text-ink-muted hover:text-ink">
                    معاني الآية وبلاغتها وأحكامها ←
                  </Link>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
