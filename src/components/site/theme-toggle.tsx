'use client';

import { useEffect, useState } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils';

/**
 * The one appearance control: a pill with a sun and a moon and a knob that
 * slides to the chosen one; the sun turns as it goes, the moon swings in.
 * Light is the default.
 */
export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedMode === 'dark';
  const option =
    'relative z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300';

  return (
    <div
      role="group"
      aria-label={formatMessage({ id: 'nav.appearance' })}
      className="relative flex items-center gap-0.5 rounded-full border border-border p-1 transition-colors duration-300"
    >
      {/* The knob: under the sun in light, under the moon in dark. */}
      <span
        aria-hidden="true"
        className="theme-knob absolute start-1 top-1 h-9 w-9 rounded-full bg-ink"
        data-dark={dark ? '' : undefined}
      />
      <button
        type="button"
        onClick={() => setMode('light')}
        aria-pressed={!dark}
        aria-label={formatMessage({ id: 'nav.lightMode' })}
        className={cn(
          option,
          dark ? 'text-ink-muted hover:text-ink' : 'text-background'
        )}
      >
        <IoSunnyOutline
          className={cn(
            'h-[18px] w-[18px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            dark ? '-rotate-90 scale-90' : 'rotate-0'
          )}
          aria-hidden="true"
        />
      </button>
      <button
        type="button"
        onClick={() => setMode('dark')}
        aria-pressed={dark}
        aria-label={formatMessage({ id: 'nav.darkMode' })}
        className={cn(
          option,
          dark ? 'text-background' : 'text-ink-muted hover:text-ink'
        )}
      >
        <IoMoonOutline
          className={cn(
            'h-[18px] w-[18px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            dark ? 'rotate-0' : 'rotate-[30deg] scale-90'
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
