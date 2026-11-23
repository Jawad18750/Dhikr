'use client';

import { type ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';

import type { SeoLocale } from '@/lib/seo/routes';
import { cn } from '@/utils';

import { LanguageSwitch } from './language-switch';
import { ThemeToggle } from './theme-toggle';

export type MenuLink = { href: string; label: string; icon: ReactNode };

type Phase = 'closed' | 'open' | 'closing';

/** How long the card takes to fold back into the button (globals.css). */
const CLOSE_MS = 280;

/**
 * The phone's menu: one round button in the bar, its two lines folding into
 * a cross, and a card that opens out of the button as a growing circle, its
 * rows arriving one after another, with the light/dark switch at the foot.
 * It folds back the same way when a row, the veil or Escape closes it. The
 * card is rendered outside the bar, so it keeps the page's own colours
 * whatever the bar is passing over; the veil sits under the bar (z-50), the
 * card over it.
 */
export function SiteMenu({ links, locale }: { links: MenuLink[]; locale: SeoLocale }) {
  const { formatMessage } = useIntl();
  const [phase, setPhase] = useState<Phase>('closed');
  const [frame, setFrame] = useState({ top: 0, originX: 0, originY: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = phase === 'open';

  const close = () =>
    setPhase((current) => (current === 'open' ? 'closing' : current));

  const toggle = () => {
    if (phase === 'open') {
      close();
      return;
    }
    // The card opens out of the button: its circle starts at the button's
    // centre, measured against the card's own box (inset 12px, 8px below).
    const button = buttonRef.current;
    const bar = button?.closest('.header-shell');
    const top = (bar?.getBoundingClientRect().bottom ?? 64) + 8;
    const rect = button?.getBoundingClientRect();
    setFrame({
      top,
      originX: rect ? rect.left + rect.width / 2 - 12 : 0,
      originY: rect ? rect.top + rect.height / 2 - top : 0,
    });
    setPhase('open');
  };

  useEffect(() => {
    if (phase !== 'closing') return;
    const timer = window.setTimeout(() => setPhase('closed'), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    // Scrolling the page away, or growing past the phone size, closes it.
    const wide = window.matchMedia('(min-width: 640px)');
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, { passive: true });
    wide.addEventListener('change', close);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close);
      wide.removeEventListener('change', close);
    };
  }, [open]);

  const line =
    'absolute left-1/2 top-1/2 -ml-[9px] -mt-[0.875px] h-[1.75px] w-[18px] rounded-full bg-current transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={formatMessage({ id: open ? 'nav.closeMenu' : 'nav.menu' })}
        onClick={toggle}
        className={cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border text-ink transition-[border-color,background-color,transform] duration-300 active:scale-90',
          open
            ? 'border-transparent [background-color:color-mix(in_srgb,currentColor_10%,transparent)]'
            : 'border-border hover:border-border-strong'
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            line,
            open ? 'translate-y-0 rotate-45' : '-translate-y-[4px] rotate-0'
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            line,
            open ? 'translate-y-0 -rotate-45' : 'translate-y-[4px] rotate-0'
          )}
        />
      </button>

      {phase !== 'closed' &&
        createPortal(
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-label={formatMessage({ id: 'nav.closeMenu' })}
              onClick={close}
              data-closing={phase === 'closing' ? '' : undefined}
              className="site-menu-veil fixed inset-0 z-[45] bg-black/25 backdrop-blur-[3px]"
            />
            <nav
              id="site-menu"
              aria-label={formatMessage({ id: 'nav.menu' })}
              data-closing={phase === 'closing' ? '' : undefined}
              style={
                {
                  top: frame.top,
                  '--menu-x': `${frame.originX}px`,
                  '--menu-y': `${frame.originY}px`,
                } as React.CSSProperties
              }
              className="site-menu-card fixed inset-x-3 z-[55] flex flex-col gap-1 rounded-[26px] border border-border bg-surface p-2 shadow-[0_18px_50px_rgb(0_0_0/0.18)]"
            >
              {links.map((link, index) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  style={{ animationDelay: `${90 + index * 55}ms` }}
                  className="site-menu-row group flex h-14 items-center gap-3 rounded-[18px] px-4 text-[17px] font-medium text-ink transition-colors hover:bg-surface-sunken active:bg-surface-sunken"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunken text-ink-muted transition-transform duration-300 group-active:scale-90">
                    {link.icon}
                  </span>
                  {link.label}
                </a>
              ))}
              <div
                style={{ animationDelay: `${90 + links.length * 55}ms` }}
                className="site-menu-row mt-1 flex items-center justify-between border-t border-border px-4 pt-3"
              >
                <span className="text-[15px] text-ink-muted">
                  {formatMessage({ id: 'nav.language' })}
                </span>
                <Suspense fallback={null}>
                  <LanguageSwitch locale={locale} />
                </Suspense>
              </div>
              <div
                style={{ animationDelay: `${90 + (links.length + 1) * 55}ms` }}
                className="site-menu-row flex items-center justify-between px-4 pb-1 pt-2"
              >
                <span className="text-[15px] text-ink-muted">
                  {formatMessage({ id: 'nav.appearance' })}
                </span>
                <ThemeToggle />
              </div>
            </nav>
          </>,
          document.body
        )}
    </>
  );
}
