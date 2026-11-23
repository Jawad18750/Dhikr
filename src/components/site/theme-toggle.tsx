'use client';

import { useEffect, useState } from 'react';
import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';
import { useIntl } from 'react-intl';

import { useTheme } from '@/hooks/use-theme';

/** The header's one appearance control: light (the default) or dark. */
export function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme();
  const { formatMessage } = useIntl();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedMode === 'dark';

  return (
    <button
      type="button"
      onClick={() => setMode(dark ? 'light' : 'dark')}
      aria-label={formatMessage({
        id: dark ? 'nav.lightMode' : 'nav.darkMode',
      })}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-border-strong"
    >
      {dark ? (
        <IoSunnyOutline className="h-5 w-5" aria-hidden="true" />
      ) : (
        <IoMoonOutline className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  );
}
