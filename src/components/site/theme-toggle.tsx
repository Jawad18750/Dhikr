'use client';

import { useEffect, useState } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/utils';

/**
 * The header's one appearance control: a pill with a sun and a moon, the
 * current mode shown filled. Light is the default.
 */
export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedMode === 'dark';
  const option =
    'flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200';

  return (
    <div
      role="group"
      aria-label={formatMessage({ id: 'nav.appearance' })}
      className="flex items-center gap-0.5 rounded-full border border-border p-1"
    >
      <button
        type="button"
        onClick={() => setMode('light')}
        aria-pressed={!dark}
        aria-label={formatMessage({ id: 'nav.lightMode' })}
        className={cn(
          option,
          dark ? 'text-ink-muted hover:text-ink' : 'bg-ink text-background'
        )}
      >
        <IoSunnyOutline className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setMode('dark')}
        aria-pressed={dark}
        aria-label={formatMessage({ id: 'nav.darkMode' })}
        className={cn(
          option,
          dark ? 'bg-ink text-background' : 'text-ink-muted hover:text-ink'
        )}
      >
        <IoMoonOutline className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </div>
  );
}
