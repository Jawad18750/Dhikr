'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useIntl } from 'react-intl';

import { cn } from '@/utils';

import { ThemeToggle } from './theme-toggle';

export type MenuLink = { href: string; label: string; icon: ReactNode };

/**
 * The phone's menu: one round button in the bar, its two lines turning into
 * a cross, and a card that drops below the bar with the sections and the
 * light/dark switch. A tap outside, a link or Escape closes it. The card is
 * rendered outside the bar, so it keeps the page's own colours whatever the
 * bar is passing over; the veil sits under the bar (z-50), the card over it.
 */
export function SiteMenu({ links }: { links: MenuLink[] }) {
  const { formatMessage } = useIntl();
  const [open, setOpen] = useState(false);
  const [top, setTop] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const bar = buttonRef.current?.closest('.header-shell');
      setTop((bar?.getBoundingClientRect().bottom ?? 64) + 8);
    };
    place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    // Scrolling the page away, or growing past the phone size, closes it.
    const close = () => setOpen(false);
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
    'absolute left-1/2 h-[1.75px] w-[18px] -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={formatMessage({ id: open ? 'nav.closeMenu' : 'nav.menu' })}
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong"
      >
        <span
          aria-hidden="true"
          className={cn(
            line,
            open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[17px]'
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            line,
            open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-[17px]'
          )}
        />
      </button>

      {open &&
        createPortal(
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-label={formatMessage({ id: 'nav.closeMenu' })}
              onClick={() => setOpen(false)}
              className="site-menu-veil fixed inset-0 z-[45] bg-black/25 backdrop-blur-[2px]"
            />
            <nav
              id="site-menu"
              aria-label={formatMessage({ id: 'nav.menu' })}
              style={{ top }}
              className="site-menu-card fixed inset-x-3 z-[55] flex flex-col gap-1 rounded-[26px] border border-border bg-surface p-2 shadow-[0_18px_50px_rgb(0_0_0/0.18)]"
            >
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex h-14 items-center gap-3 rounded-[18px] px-4 text-[17px] font-medium text-ink transition-colors hover:bg-surface-sunken"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-sunken text-ink-muted">
                    {link.icon}
                  </span>
                  {link.label}
                </a>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-border px-4 pb-1 pt-3">
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
