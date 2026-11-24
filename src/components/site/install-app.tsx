'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCloseOutline, IoDownloadOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { type InstallWay, useInstall } from '@/hooks/use-install';
import type { SeoLocale } from '@/lib/seo/routes';
import { BRAND } from '@/lib/seo/site';
import { cn } from '@/utils';

const STEPS: Record<Exclude<InstallWay, 'installed' | 'prompt'>, string[]> = {
  ios: ['install.ios1', 'install.ios2', 'install.ios3'],
  mac: ['install.mac1'],
  other: ['install.other1', 'install.other2'],
};

/**
 * Installs the site as an app: the browser's own dialog where it has one (Chrome,
 * Edge, Android), and elsewhere a card with the few taps it takes (iPhone and iPad from
 * the Share menu, Safari on a Mac from the File menu). Nothing shows once it is installed.
 * `icon`: the round button of the bar; `link`: a line among the footer's links.
 */
export function InstallApp({ locale, look, className }: { locale: SeoLocale; look: 'icon' | 'link'; className?: string }) {
  const { formatMessage } = useIntl();
  const { way, prompt } = useInstall();
  const [open, setOpen] = useState(false);
  const brand = BRAND[locale];
  const label = formatMessage({ id: 'install.button' }, { brand });

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (way === null || way === 'installed') return null;

  const start = async () => {
    if (!(await prompt())) setOpen(true);
  };
  const steps = STEPS[way === 'prompt' ? 'other' : way];

  return (
    <>
      {look === 'icon' ? (
        <button
          type="button"
          onClick={start}
          aria-label={label}
          title={label}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong',
            className
          )}
        >
          <IoDownloadOutline className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : (
        <button type="button" onClick={start} className={cn('flex items-center gap-1.5 text-start', className)}>
          <IoDownloadOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
          {label}
        </button>
      )}

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="install-title">
            <button
              type="button"
              aria-label={formatMessage({ id: 'install.close' })}
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div className="relative m-3 flex w-full max-w-[420px] flex-col gap-5 rounded-[28px] bg-hero p-6 text-on-hero shadow-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={formatMessage({ id: 'install.close' })}
                className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-on-hero/10 text-on-hero/80 hover:bg-on-hero/15"
              >
                <IoCloseOutline className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-4 pe-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icon-192.png" alt="" width={64} height={64} className="h-16 w-16 shrink-0 rounded-[18px] shadow-[0_0_0_3px_rgba(230,196,122,0.25)]" />
                <h2 id="install-title" className="font-display text-[24px] font-black leading-tight">
                  {formatMessage({ id: 'install.title' }, { brand })}
                </h2>
              </div>
              <p className="text-[15px] leading-[1.8] text-on-hero/70">{formatMessage({ id: 'install.lead' })}</p>
              <ol className="flex flex-col gap-2.5">
                {steps.map((id, index) => (
                  <li key={id} className="flex items-start gap-3 rounded-2xl bg-on-hero/[0.07] p-3.5 text-[15px] leading-[1.7]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hero-gold font-bold tabular-nums text-[#1b1712]">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{formatMessage({ id })}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
